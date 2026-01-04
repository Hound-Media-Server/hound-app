import { View } from "react-native";
import React, { use } from "react";
import VideoScreen from "@/components/video/VideoScreen";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import { useSession } from "@/services/ctx";

export default function Stream() {
  const { encoded_data } = useLocalSearchParams();
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
      <VideoScreen src={url} />
    </View>
  );
}
