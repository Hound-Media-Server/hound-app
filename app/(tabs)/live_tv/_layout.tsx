import { Platform } from "react-native";
import { Stack } from "expo-router";

export default function LiveTVLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        orientation: Platform.isTV ? undefined : "landscape",
      }}
    />
  );
}
