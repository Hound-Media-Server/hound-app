import { View, Text } from "react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import VideoScreen from "@/components/VideoScreen";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export default function Stream() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <VideoScreen />
    </View>
  );
}
