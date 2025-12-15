import { View } from "react-native";
import React, { use } from "react";
import VideoScreen from "@/components/VideoScreen";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useSession } from "@/services/ctx";

export default function Stream() {
  const { id } = useLocalSearchParams();
  const { session } = useSession();
  if (!session) return;
  let url = `${session?.host}/api/v1/stream/${id}`;
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
