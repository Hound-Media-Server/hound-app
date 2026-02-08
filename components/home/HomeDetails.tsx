import {
  View,
  Text,
  TouchableHighlight,
  Platform,
  Dimensions,
} from "react-native";
import React from "react";
import { Image } from "expo-image";
import { ThemedText } from "../ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusStore } from "@/stores/focusStore";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HERO_HEIGHT = SCREEN_HEIGHT / 1.8;

export default function HomeDetails() {
  const focusedItem = useFocusStore((s) => s.focusedItem);
  if (!focusedItem) return null;
  const releaseYear = focusedItem.release_date?.slice(0, 4);
  const genres = focusedItem.genres?.map((g) => g.name).join(", ");
  return (
    <View className="relative" style={{ height: HERO_HEIGHT }}>
      {focusedItem.backdrop_uri && (
        <Image
          source={focusedItem.backdrop_uri}
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
      <View className="absolute left-0 bottom-0 ps-5 pe-5 pb-5">
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
          className="text-gray-300 text-lg"
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {focusedItem.overview}
        </ThemedText>
      </View>
    </View>
  );
}
