import { View, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusStore } from "@/stores/focusStore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HERO_HEIGHT = SCREEN_HEIGHT / 1.85;

export default function HomeDetails() {
  if (!Platform.isTV) {
    return (
      <View className="flex justify-center py-4 px-6">
        <ThemedText className="text-secondary text-4xl font-extrabold">
          HOUND
        </ThemedText>
      </View>
    );
  }
  const focusedItem = useFocusStore((s) => s.focusedItem);
  if (!focusedItem) {
    return <PlaceholderHero />;
  }
  const releaseYear = focusedItem.release_date?.slice(0, 4);
  const genres = focusedItem.genres?.map((g) => g.genre).join(", ");
  // TODO: HACKY, we need a better way to support image sizes in hound
  const backdropUri = focusedItem?.backdrop_uri?.replace("w500", "w1280");
  return (
    <View className="relative" style={{ height: HERO_HEIGHT }}>
      {backdropUri && (
        <Image
          source={backdropUri}
          className="opacity-80"
          style={{ height: HERO_HEIGHT }}
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,1)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 300,
        }}
      />
      <View className="absolute left-0 bottom-0 ps-10 pe-10 mb-5 w-4/5">
        <ThemedText className="text-white text-3xl mb-1">
          {focusedItem.media_title}
          {releaseYear && (
            <ThemedText className="text-gray-400 text-2xl">
              {" "}
              ({releaseYear})
            </ThemedText>
          )}
        </ThemedText>
        {focusedItem.media_subtitle && (
          <ThemedText>
            {focusedItem.season_number && focusedItem.episode_number && (
              <ThemedText className="text-gray-300 opacity-90 text-xl">
                S{focusedItem.season_number}E{focusedItem.episode_number}
                {" | "}
              </ThemedText>
            )}
            <ThemedText className="text-gray-400 text-xl">
              {focusedItem.media_subtitle}
            </ThemedText>
          </ThemedText>
        )}
        {focusedItem.genres && (
          <ThemedText className="text-secondary opacity-90 text-base">
            {genres}
          </ThemedText>
        )}
        <ThemedText
          className="text-gray-400 text-lg"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {focusedItem.overview}
        </ThemedText>
      </View>
    </View>
  );
}

function PlaceholderHero() {
  const opacity = useSharedValue(0.8);
  // shimmer animation
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 700,
      }),
      -1,
      true,
    );
  }, []);
  const pulsingStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  return (
    <View className="relative" style={{ height: HERO_HEIGHT }}>
      <View className="absolute left-0 bottom-0 ps-10 pe-10 mb-5 w-4/5">
        <Animated.View
          className="bg-gray-700 rounded-lg"
          style={[{ width: 200, height: 30 }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 100, height: 20 }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 300, height: 20 }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 300, height: 20 }, pulsingStyle]}
        />
      </View>
    </View>
  );
}
