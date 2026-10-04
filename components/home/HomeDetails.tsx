import { useTVScale } from "@/hooks/useTVScale";
import { View, useWindowDimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusStore } from "@/stores/focusStore";
import { MediaTypeMovie, MediaTypeTVShow } from "@/constants/MediaTypes";
import {
  useMovieDetails,
  useShowDetails,
} from "@/services/mediaDetailsService";
import { formatMediaMetadata, normalizeOverview } from "@/utils/mediaMetadata";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

export default function HomeDetails() {
  const { height } = useWindowDimensions();
  const heroHeight = height / 1.8;
  const scale = useTVScale();
  if (!Platform.isTV) {
    return (
      <View className="flex justify-center py-4 px-6">
        <ThemedText className="text-secondary text-4xl font-extrabold">
          HOUND
        </ThemedText>
      </View>
    );
  }
  return <TVHomeDetails height={heroHeight} scale={scale} />;
}

function TVHomeDetails({
  height: heroHeight,
  scale,
}: {
  height: number;
  scale: number;
}) {
  const focusedItem = useFocusStore((s) => s.focusedItem);
  const detailsId =
    focusedItem?.media_source && focusedItem?.source_id
      ? `${focusedItem.media_source}-${focusedItem.source_id}`
      : "";
  const { data: movieDetails } = useMovieDetails(
    detailsId,
    focusedItem?.media_type === MediaTypeMovie,
  );
  const { data: showDetails } = useShowDetails(
    detailsId,
    focusedItem?.media_type === MediaTypeTVShow,
  );
  if (!focusedItem) {
    return <PlaceholderHero height={heroHeight} />;
  }
  const details =
    focusedItem.media_type === MediaTypeMovie ? movieDetails : showDetails;
  const logoUri = details?.logo_uri || focusedItem.logo_uri;
  const metadata = formatMediaMetadata({
    release_date: details?.release_date || focusedItem.release_date,
    status: details?.status || focusedItem.status,
    duration: details?.duration || focusedItem.duration,
    genres: details?.genres?.length ? details.genres : focusedItem.genres,
  });
  // TODO: HACKY, we need a better way to support image sizes in hound
  const backdropUri = focusedItem?.backdrop_uri?.replace("w500", "w1280");
  return (
    <View className="relative" style={{ height: heroHeight }}>
      {backdropUri && (
        <Image
          source={backdropUri}
          className="opacity-80"
          style={{ height: heroHeight }}
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,1)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 300 * scale,
        }}
      />
      <View className="absolute left-0 bottom-0 ps-10 pe-10 mb-5 w-4/5">
        {logoUri ? (
          <Image
            source={logoUri}
            contentFit="contain"
            contentPosition="left bottom"
            transition={300}
            style={{
              width: 300 * scale,
              height: 100 * scale,
              marginBottom: 10 * scale,
            }}
          />
        ) : (
          <ThemedText className="text-white text-3xl mb-1">
            {focusedItem.media_title}
          </ThemedText>
        )}
        {focusedItem.media_subtitle && (
          <ThemedText numberOfLines={1}>
            {focusedItem.season_number && focusedItem.episode_number && (
              <ThemedText className="text-gray-200 opacity-90 text-xl">
                S{focusedItem.season_number}E{focusedItem.episode_number}
                {" | "}
              </ThemedText>
            )}
            <ThemedText className="text-gray-300 text-xl">
              {focusedItem.media_subtitle}
            </ThemedText>
          </ThemedText>
        )}
        {!!metadata && (
          <ThemedText
            className="text-secondary opacity-90 text-base"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {metadata}
          </ThemedText>
        )}
        <ThemedText
          className="text-gray-400 text-lg"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {normalizeOverview(details?.overview || focusedItem.overview)}
        </ThemedText>
      </View>
    </View>
  );
}

function PlaceholderHero({ height: heroHeight }: { height: number }) {
  const scale = useTVScale();
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
    <View className="relative" style={{ height: heroHeight }}>
      <View className="absolute left-0 bottom-0 ps-10 pe-10 mb-5 w-4/5">
        <Animated.View
          className="bg-gray-700 rounded-lg"
          style={[{ width: 200 * scale, height: 30 * scale }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 100 * scale, height: 20 * scale }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 300 * scale, height: 20 * scale }, pulsingStyle]}
        />
        <Animated.View
          className="bg-gray-700 rounded-lg mt-2"
          style={[{ width: 300 * scale, height: 20 * scale }, pulsingStyle]}
        />
      </View>
    </View>
  );
}
