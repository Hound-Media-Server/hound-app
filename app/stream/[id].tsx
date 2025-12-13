import { View, Text } from "react-native";
import React from "react";
import VideoScreen from "@/components/VideoScreen";
import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { useLocalSearchParams } from "expo-router";

export default function Stream() {
  const { id } = useLocalSearchParams();
  const url = "http://10.0.2.2:8000/api/v1/stream/" + id;
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
