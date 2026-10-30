import { Animated, View } from "react-native";
import { usePlaceholderOpacity } from "@/hooks/usePlaceholderOpacity";

export default function OverviewSkeleton() {
  const opacity = usePlaceholderOpacity();
  return (
    <Animated.View className="mt-2 gap-2" style={{ opacity }}>
      <View className="h-4 rounded bg-zinc-600" />
      <View className="h-4 rounded bg-zinc-600" />
      <View className="h-4 w-2/3 rounded bg-zinc-600" />
    </Animated.View>
  );
}
