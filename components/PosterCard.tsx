import { View, Text, TouchableHighlight } from "react-native";
import React from "react";
import { Image } from "react-native";
import { Route, useRouter } from "expo-router";

export default function PosterCard({ item }: any) {
  const router = useRouter();
  if (!item) return;
  if (item.media_type !== "movie" && item.media_type !== "tvshow") {
    alert("Invalid item type, should be movie/tv");
    return;
  }
  return (
    <TouchableHighlight
      onPress={() =>
        router.navigate(
          `/${item.media_type === "movie" ? "movie" : "tv"}/${item.media_source + "-" + item.source_id}` as Route
        )
      }
    >
      <View className="flex-1 w-[140px] h-[220px] me-3">
        <Image
          className="w-[140px] h-[210px] rounded-lg"
          source={{ uri: item.thumbnail_url }}
        />
      </View>
    </TouchableHighlight>
  );
}
