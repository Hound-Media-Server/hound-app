import { View } from "react-native";
import React, { use } from "react";
import VideoScreen from "@/components/video/VideoScreen";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/services/ctx";

export default function Stream() {
  const { encoded_data, startTime, id, type, season, episode, title } =
    useLocalSearchParams();
  const { session } = useSession();
  if (!session) return;
  let url = `${session?.host}/api/v1/stream/${encoded_data}`;
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <VideoScreen
        src={url}
        startTime={startTime ? parseInt(startTime as string, 10) : 0}
        id={id as string}
        mediaType={type as "movie" | "tv"}
        seasonNumber={season ? parseInt(season as string, 10) : undefined}
        episodeNumber={episode ? parseInt(episode as string, 10) : undefined}
        encodedData={encoded_data as string}
      />
    </View>
  );
}
