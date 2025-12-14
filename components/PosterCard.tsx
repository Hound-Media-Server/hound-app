import { View, Text, TouchableHighlight } from "react-native";
import React from "react";
import { Image } from "react-native";
import { Route, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";

export default function PosterCard({ item, showDescription }: any) {
  const router = useRouter();
  if (!item) return;
  let imgSource = item.thumbnail_url;
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
      <View className="flex-1 w-[140px] me-5">
        <Image
          className="w-[140px] h-[210px] rounded-lg"
          source={{ uri: imgSource }}
        />
        {showDescription && (
          <ThemedText className="text-gray-200 mt-2 text-start">
            {item.original_name}
          </ThemedText>
        )}
      </View>
    </TouchableHighlight>
  );
}
