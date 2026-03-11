import { Platform, View, ActivityIndicator, Alert } from "react-native";
import React, { useState, useMemo, useRef, useCallback } from "react";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "@/services/ctx";
import MPVVideoScreen from "@/components/video/MPVVideoScreen";
import { useKeepAwake } from "expo-keep-awake";
import VideoScreen from "@/components/video/ExoplayerVideoScreen";
import { getSetting } from "@/stores/settingsStore";
import {
  useMovieDetails,
  useShowDetails,
} from "@/services/mediaDetailsService";
import { fetchMediaFiles, fetchProviders } from "@/services/providerService";
import { getStreamUrl } from "@/utils/navigation";
import {
  MediaTypeMovie,
  MediaTypeTVShow,
  MediaType,
} from "@/constants/MediaTypes";

export type DisplayInfo = {
  original_language: string;
  media_title: string;
  episode_title: string;
};

export default function Stream() {
  const router = useRouter();
  const {
    encoded_data,
    startTime,
    id,
    mediaType,
    season,
    episode,
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
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo | undefined>(
    undefined,
  );

  // Autoplay next episode
  const autoplayEnabled = useMemo(
    () => getSetting("autoplayNextEpisode") !== false,
    [],
  );
  const [playbackProgress, setPlaybackProgress] = useState<{
    time: number;
    duration: number;
  }>({ time: 0, duration: 0 });
  const cachedNextEpisodeData = useRef<any>(null);
  const cacheWarmStarted = useRef(false);

  // Fetch show details if it is a tv show to handle next episode
  const { data: showDetails } = useShowDetails(
    id as string,
    mediaType === MediaTypeTVShow,
  );

  const { data: movieDetails } = useMovieDetails(
    id as string,
    mediaType === MediaTypeMovie,
  );

  // get default audio language, etc.
  useEffect(() => {
    if (mediaType === MediaTypeMovie && movieDetails) {
      setDisplayInfo({
        original_language: movieDetails.original_language || "",
        media_title: movieDetails.media_title || "",
        episode_title: "",
      });
    } else if (mediaType === MediaTypeTVShow && showDetails) {
      setDisplayInfo({
        original_language: showDetails.original_language || "",
        media_title: showDetails.media_title || "",
        episode_title: "",
      });
    }
  }, [mediaType, movieDetails, showDetails]);

  const nextEpisodeInfo = useMemo(() => {
    if (mediaType !== MediaTypeTVShow || !showDetails || !season || !episode)
      return null;

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
  }, [showDetails, mediaType, season, episode]);

  // Progress callback from video screens
  const handleProgress = useCallback((time: number, dur: number) => {
    setPlaybackProgress({ time, duration: dur });
  }, []);

  // Determine if near end (>80% or <5 min remaining)
  const isNearEnd = useMemo(() => {
    const { time, duration: dur } = playbackProgress;
    if (dur <= 0 || time <= 0) return false;
    const remaining = dur - time;
    return remaining < 300 || time / dur > 0.8;
  }, [playbackProgress]);

  // Next episode logic, if prefetch is true, warm cache without navigating
  const handleNextEpisode = async (nextSettings: any, prefetch = false) => {
    if (!nextEpisodeInfo || !id) return;
    try {
      let firstStream = cachedNextEpisodeData.current;
      if (!firstStream) {
        const mediaFilesRes = await fetchMediaFiles(
          MediaTypeTVShow,
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
            MediaTypeTVShow,
            id as string,
            nextEpisodeInfo.season,
            nextEpisodeInfo.episode,
          );
          if (providersRes?.data?.providers?.[0].streams?.length > 0) {
            firstStream = providersRes?.data?.providers?.[0]?.streams?.[0];
          }
        }
      }
      if (firstStream) {
        if (prefetch) {
          cachedNextEpisodeData.current = firstStream;
          return;
        }
        const link = getStreamUrl(firstStream.encoded_data, false, {
          id: id as string,
          mediaType: MediaTypeTVShow,
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
        if (!prefetch) {
          Alert.alert("No streams found for the next episode.");
          console.log(
            "[NEXT_EPISODE] No main stream found in providers response",
          );
        }
      }
    } catch (error) {
      console.error("Error fetching next episode providers:", error);
    }
  };

  // pre-fetch next episode data when near end
  useEffect(() => {
    if (
      !isNearEnd ||
      !nextEpisodeInfo ||
      !id ||
      cacheWarmStarted.current ||
      !autoplayEnabled
    )
      return;
    cacheWarmStarted.current = true;
    handleNextEpisode(currentSettings, true);
  }, [isNearEnd, nextEpisodeInfo, id, autoplayEnabled, currentSettings]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    // Load setting
    const val = getSetting("defaultPlayer");
    const defaultResizeMode =
      mediaType === MediaTypeMovie
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
  }, [mediaType]);

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
      {isNavigating || (!movieDetails && !showDetails) ? (
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : currentPlayer === "mpv" ? (
        <MPVVideoScreen
          src={url}
          startTime={currentProgress}
          id={id as string}
          mediaType={mediaType as MediaType}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
          streamsMatch={
            streamsMatch === "true" || playerHasChanged
          } /* if we're just changing players, we want to preserve settings */
          displayInfo={displayInfo}
          playerSettings={{ ...currentSettings, player: "mpv" }}
          onChangePlayer={handlePlayerChange}
          hasNextEpisode={!!nextEpisodeInfo}
          onNextEpisode={(settings: any) => handleNextEpisode(settings, false)}
          autoplayEnabled={autoplayEnabled && !!nextEpisodeInfo}
          onProgress={handleProgress}
        />
      ) : (
        <VideoScreen
          src={url}
          startTime={currentProgress}
          id={id as string}
          mediaType={mediaType as MediaType}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
          streamsMatch={
            streamsMatch === "true" || playerHasChanged
          } /* if we're just changing players, we want to preserve settings */
          displayInfo={displayInfo}
          playerSettings={{ ...currentSettings, player: "exoplayer" }}
          onChangePlayer={handlePlayerChange}
          hasNextEpisode={!!nextEpisodeInfo}
          onNextEpisode={(settings: any) => handleNextEpisode(settings, false)}
          autoplayEnabled={autoplayEnabled && !!nextEpisodeInfo}
          onProgress={handleProgress}
        />
      )}
    </View>
  );
}
