import { View, Text, TouchableHighlight } from "react-native";
import React from "react";
import { Image } from "react-native";
import { Route, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";

export default function PosterCard({
  item,
  title,
  subtitle,
  imgAlt,
}: {
  item: any;
  title?: string;
  subtitle?: string;
  imgAlt?: string;
}) {
  const router = useRouter();
  if (!item) return;
  let imgSource = item.thumbnail_url || item.poster_url;
  if (item.profile_path) {
    imgSource = item.profile_path;
  }

  return (
    <TouchableHighlight
      disabled={!item.media_type} // disable for cast view for now
      onPress={() => {
        // cast/credits case
        if (!item.media_type) return;
        router.navigate(
          `/${item.media_type === "movie" ? "movie" : "tv"}/${item.media_source + "-" + item.source_id}` as Route
        );
      }}
    >
      <View className="flex-1 w-[120px]">
        {imgSource ? (
          <Image
            className="w-[120px] h-[180px] rounded-lg bg-gray-300"
            source={{ uri: imgSource }}
          />
        ) : (
          <View className="w-[120px] h-[180px] p-2 rounded-lg bg-gray-300 flex items-center justify-center">
            <ThemedText className="text-black mt-2 text-base text-start">
              {imgAlt}
            </ThemedText>
          </View>
        )}
        {!!title && (
          <ThemedText className="text-gray-200 mt-2 text-start px-1">
            {title}
          </ThemedText>
        )}
        {!!subtitle && (
          <ThemedText className="text-gray-400 text-sm text-start px-1">
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableHighlight>
  );
}
