import { Platform, View, ActivityIndicator, Alert } from "react-native";
import React, { useState, useMemo } from "react";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/services/ctx";
import MPVVideoScreen from "@/components/video/MPVVideoScreen";
import { useKeepAwake } from "expo-keep-awake";
import VideoScreen from "@/components/video/ExoplayerVideoScreen";
import { getSetting } from "@/stores/settingsStore";
import { useShowDetails } from "@/services/mediaDetailsService";
import { fetchMediaFiles, fetchProviders } from "@/services/providerService";
import { getStreamUrl } from "@/utils/navigation";

export default function Stream() {
  const router = useRouter();
  const {
    encoded_data,
    startTime,
    id,
    type,
    season,
    episode,
    title,
    streamsMatch,
    playerSettings,
  } = useLocalSearchParams();
  const { session } = useSession();
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(
    startTime ? parseInt(startTime as string, 10) : 0,
  );
  const [playerHasChanged, setPlayerHasChanged] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const parsedPlayerSettings = playerSettings
    ? JSON.parse(playerSettings as string)
    : null;
  const [currentSettings, setCurrentSettings] = useState<any>(
    parsedPlayerSettings || {},
  );

  // Fetch show details if it is a tv show to handle next episode
  const { data: showDetails } = useShowDetails(id as string, type === "tv");

  const nextEpisodeInfo = useMemo(() => {
    if (type !== "tv" || !showDetails || !season || !episode) return null;

    const sNum = parseInt(season as string, 10);
    const epNum = parseInt(episode as string, 10);
    const currentSeason = showDetails.seasons?.find(
      (s: any) => s.season_number === sNum,
    );
    if (!currentSeason) return null;

    // check if next episode exists in current season
    if (epNum < currentSeason.episode_count) {
      return { season: sNum, episode: epNum + 1 };
    }
    // else, check if next episode exists in next season
    const nextSeason = showDetails.seasons
      .filter((s: any) => s.season_number > sNum)
      .sort((a: any, b: any) => a.season_number - b.season_number)[0];

    if (nextSeason && nextSeason.episode_count > 0) {
      return { season: nextSeason.season_number, episode: 1 };
    }
    return null;
  }, [showDetails, type, season, episode]);

  const handleNextEpisode = async (nextSettings: any) => {
    if (!nextEpisodeInfo || !id) return;
    try {
      let firstStream = null;
      const mediaFilesRes = await fetchMediaFiles(
        "tv",
        id as string,
        nextEpisodeInfo.season,
        nextEpisodeInfo.episode,
      );
      if (mediaFilesRes?.data?.providers?.[0].streams?.length > 0) {
        firstStream = mediaFilesRes?.data?.providers?.[0]?.streams?.[0];
      }
      // prioritize media files, if not found, then fetch
      // this does add a delay to fetching providers
      if (!firstStream) {
        const providersRes = await fetchProviders(
          "tv",
          id as string,
          nextEpisodeInfo.season,
          nextEpisodeInfo.episode,
        );
        if (providersRes?.data?.providers?.[0].streams?.length > 0) {
          firstStream = providersRes?.data?.providers?.[0]?.streams?.[0];
        }
      }
      if (firstStream) {
        const link = getStreamUrl(firstStream.encoded_data, false, {
          id: id as string,
          type: "tv",
          title: title as string,
          season: nextEpisodeInfo.season,
          episode: nextEpisodeInfo.episode,
          startTime: 0,
          playerSettings: JSON.stringify({
            ...nextSettings,
            player: currentPlayer,
          }),
        });
        setIsNavigating(true);
        // Give React time to unmount the player component
        // not ideal, but I haven't found a better solution
        setTimeout(() => {
          router.replace(link);
        }, 100);
      } else {
        Alert.alert("No streams found for the next episode.");
        console.log(
          "[NEXT_EPISODE] No main stream found in providers response",
        );
      }
    } catch (error) {
      console.error("Error fetching next episode providers:", error);
    }
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    // Load setting
    const val = getSetting("defaultPlayer");
    const defaultResizeMode =
      type === "movie"
        ? getSetting("defaultMovieResizeMode")
        : getSetting("defaultShowResizeMode");
    // Use player from context if available, otherwise fallback to settings
    const preferredPlayer =
      (parsedPlayerSettings?.player as string) || val || "exoplayer";
    setCurrentPlayer(preferredPlayer);
    setCurrentSettings((prev: any) => ({
      ...prev,
      resize_mode: prev?.resize_mode || defaultResizeMode || "contain",
    }));

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [type]);

  const handlePlayerChange = async (
    newPlayer: "exoplayer" | "mpv",
    currentTime: number,
    settings?: any,
  ) => {
    setCurrentProgress(currentTime);
    setCurrentPlayer(newPlayer);
    setPlayerHasChanged(true);
    if (settings) {
      setCurrentSettings((prev: any) => ({ ...prev, ...settings }));
    }
  };

  useKeepAwake();

  if (!session) return null;
  if (currentPlayer === null) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  let url = `${session?.host}/api/v1/stream/${encoded_data}`;

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {isNavigating ? (
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : currentPlayer === "mpv" ? (
        <MPVVideoScreen
          src={url}
          startTime={currentProgress}
          id={id as string}
          mediaType={type as "movie" | "tv"}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
          streamsMatch={
            streamsMatch === "true" || playerHasChanged
          } /* if we're just changing players, we want to preserve settings */
          playerSettings={{ ...currentSettings, player: "mpv" }}
          onChangePlayer={handlePlayerChange}
          hasNextEpisode={!!nextEpisodeInfo}
          onNextEpisode={handleNextEpisode}
        />
      ) : (
        <VideoScreen
          src={url}
          startTime={currentProgress}
          id={id as string}
          mediaType={type as "movie" | "tv"}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
          streamsMatch={
            streamsMatch === "true" || playerHasChanged
          } /* if we're just changing players, we want to preserve settings */
          playerSettings={{ ...currentSettings, player: "exoplayer" }}
          onChangePlayer={handlePlayerChange}
          hasNextEpisode={!!nextEpisodeInfo}
          onNextEpisode={handleNextEpisode}
        />
      )}
    </View>
  );
}
