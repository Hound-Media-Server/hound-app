import { Platform, View, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/services/ctx";
import MPVVideoScreen from "@/components/video/MPVVideoScreen";
import { useKeepAwake } from "expo-keep-awake";
import VideoScreen from "@/components/video/ExoplayerVideoScreen";
import { getSetting } from "@/stores/settingsStore";

export default function Stream() {
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
  const parsedPlayerSettings = playerSettings
    ? JSON.parse(playerSettings as string)
    : null;
  const [currentSettings, setCurrentSettings] = useState<any>(
    parsedPlayerSettings || {},
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    // Load setting
    getSetting("player").then((val) => {
      // Use player from context if available, otherwise fallback to settings
      const preferredPlayer =
        (parsedPlayerSettings?.player as string) || val || "exoplayer";
      setCurrentPlayer(preferredPlayer);
    });
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

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
      {currentPlayer === "mpv" ? (
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
        />
      )}
    </View>
  );
}
