import { View, TouchableHighlight } from "react-native";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { Route, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";

export default function PosterCard({
  item,
  title,
  subtitle,
  imgAlt,
  onFocus,
}: {
  item: any;
  title?: string;
  subtitle?: string;
  imgAlt?: string;
  onFocus?: () => void;
}) {
  const router = useRouter();
  if (!item) return;
  let imgSource = item.thumbnail_uri;
  return (
    <TouchableHighlight
      className="group rounded-lg"
      focusable
      onFocus={() => onFocus?.()}
      underlayColor={Platform.isTV ? "transparent" : "#000"}
      activeOpacity={Platform.isTV ? 1 : 0.9}
      disabled={!item.media_type} // disable for cast view for now
      onPress={() => {
        // cast/credits case
        if (!item.media_type) return;
        router.navigate(
          `/${item.media_type === "movie" ? "movie" : "tv"}/${item.media_source + "-" + item.source_id}` as Route,
        );
      }}
    >
      <View className="flex-1">
        {imgSource ? (
          <Image
            source={imgSource}
            className="w-[120px] h-[180px] rounded-lg group-focus:border-white border-2 border-transparent"
            contentFit="cover"
          />
        ) : (
          <View className="w-[120px] h-[180px] rounded-lg p-2 bg-gray-300 flex items-center justify-center group-focus:border-white border-2 border-transparent">
            <ThemedText className="text-black mt-2 text-base text-start">
              {imgAlt}
            </ThemedText>
          </View>
        )}
        {!!title && (
          <ThemedText className="text-gray-200 mt-2 text-start px-1 w-[120px]">
            {title}
          </ThemedText>
        )}
        {!!subtitle && (
          <ThemedText className="text-gray-400 text-sm text-start px-1 w-[120px]">
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableHighlight>
  );
}
