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
  const { encoded_data, startTime, id, type, season, episode, title } =
    useLocalSearchParams();
  const { session } = useSession();
  const [playerSetting, setPlayerSetting] = useState<string | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    // Load setting
    getSetting("player").then((val) => {
      setPlayerSetting(val ?? "exoplayer");
    });

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useKeepAwake();

  if (!session) return null;
  if (playerSetting === null) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  let url = `${session?.host}/api/v1/stream/${encoded_data}`;

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {playerSetting === "mpv" ? (
        <MPVVideoScreen
          src={url}
          startTime={startTime ? parseInt(startTime as string, 10) : 0}
          id={id as string}
          mediaType={type as "movie" | "tv"}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
        />
      ) : (
        <VideoScreen
          src={url}
          startTime={startTime ? parseInt(startTime as string, 10) : 0}
          id={id as string}
          mediaType={type as "movie" | "tv"}
          seasonNumber={season ? parseInt(season as string, 10) : undefined}
          episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
          encodedData={encoded_data as string}
        />
      )}
    </View>
  );
}
