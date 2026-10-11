import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { usePlaceholderOpacity } from "@/hooks/usePlaceholderOpacity";
import { useTVScale } from "@/hooks/useTVScale";

export default function PlayerLoadingOverlay({
  mediaDetails,
  message,
}: {
  mediaDetails?: any;
  message: string;
}) {
  const { width, height } = useWindowDimensions();
  const scale = useTVScale();
  const pulse = usePlaceholderOpacity();
  const opacity = pulse.interpolate({
    inputRange: [0.8, 1],
    outputRange: [0.45, 1],
  });
  const year = (mediaDetails?.release_date || mediaDetails?.first_air_date)?.slice(
    0,
    4,
  );

  return (
    <View style={StyleSheet.absoluteFill} className="bg-black overflow-hidden">
      {mediaDetails?.backdrop_uri && (
        <Image
          source={{ uri: mediaDetails.backdrop_uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
        />
      )}
      <LinearGradient
        colors={["rgba(12, 5, 50, 0.4)", "rgba(12, 5, 50, 0.2)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(12, 5, 50, 0.85)", "rgba(12, 5, 50, 0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        accessibilityLabel="Close player"
        accessibilityRole="button"
        onPress={() => router.back()}
        hasTVPreferredFocus={Platform.isTV}
        className="absolute rounded-full p-2 border-2 border-transparent focus:border-white"
        style={{ top: 16 * scale, left: 16 * scale }}
      >
        <Ionicons name="arrow-back" size={24 * scale} color="white" />
      </Pressable>
      <View
        className="absolute items-end"
        style={{
          right: width * 0.03,
          bottom: height * 0.05,
          maxWidth: width * 0.8,
        }}
      >
        <Animated.View style={{ opacity }}>
          {mediaDetails?.logo_uri ? (
            <Image
              source={{ uri: mediaDetails.logo_uri }}
              contentFit="contain"
              contentPosition="right bottom"
              style={{
                width: Math.min(width * 0.36, 420 * scale),
                height: Math.min(height * 0.18, 150 * scale),
              }}
            />
          ) : (
            <ThemedText
              className="text-white text-right"
              style={{
                fontSize: Math.max(16 * scale, Math.min(height * 0.03, 40 * scale)),
              }}
            >
              {mediaDetails?.media_title}
              {year ? ` (${year})` : ""}
            </ThemedText>
          )}
        </Animated.View>
        <ThemedText
          accessibilityLiveRegion="polite"
          className="text-white text-right"
          style={{ marginTop: 12 * scale, fontSize: 14 * scale }}
        >
          {message}
        </ThemedText>
      </View>
    </View>
  );
}
