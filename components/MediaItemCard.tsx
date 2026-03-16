import { View, TouchableHighlight } from "react-native";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { RelativePathString, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { getMediaPageUrl } from "@/utils/navigation";
import { useModalStore } from "@/stores/modalStore";

export default function MediaItemCard({
  mediaItem,
  title,
  subtitle,
  imgAlt,
  showDescription,
  onFocus,
  width = 120,
  hasTVPreferredFocus,
}: {
  mediaItem: any;
  title?: string;
  subtitle?: string;
  imgAlt?: string;
  showDescription?: boolean;
  onFocus?: () => void;
  width?: number;
  hasTVPreferredFocus?: boolean;
}) {
  if (!mediaItem) return;
  const router = useRouter();
  const openModal = useModalStore((s) => s.open);

  let imgSource = mediaItem.thumbnail_uri;
  return (
    <>
      <TouchableHighlight
        className={"rounded-lg" + Platform.isTV ? "group" : ""}
        focusable
        hasTVPreferredFocus={hasTVPreferredFocus || false}
        onFocus={() => {
          onFocus?.();
        }}
        underlayColor={Platform.isTV ? "transparent" : "#000"}
        activeOpacity={Platform.isTV ? 1 : 0.9}
        disabled={!mediaItem.media_type} // disable for cast view for now
        onPress={() => {
          const mediaPageUrl = getMediaPageUrl(
            mediaItem.media_type,
            mediaItem.media_source,
            mediaItem.source_id,
          );
          router.navigate(mediaPageUrl as RelativePathString);
        }}
        onLongPress={() => {
          openModal({
            type: "mediaItem",
            props: {
              modalTitle: title ? title : "",
              mediaItem: mediaItem,
            },
          });
        }}
      >
        <View>
          {imgSource ? (
            <Image
              source={imgSource}
              className={
                "rounded-lg " +
                (Platform.isTV
                  ? " group-focus:border-white border-2 border-transparent"
                  : "")
              }
              style={{ width: width, height: width * 1.5 }}
              contentFit="cover"
            />
          ) : (
            <View
              className={
                "rounded-lg p-2 bg-gray-300 flex items-center justify-center " +
                (Platform.isTV
                  ? " group-focus:border-white border-2 border-transparent"
                  : "")
              }
              style={{ width: width, height: width * 1.5 }}
            >
              <ThemedText className="text-black mt-2 text-base text-start">
                {imgAlt}
              </ThemedText>
            </View>
          )}
          {showDescription && !!title && (
            <ThemedText
              className="text-gray-200 mt-2 text-start px-1"
              numberOfLines={2}
              style={{ width: width }}
            >
              {title}
            </ThemedText>
          )}
          {showDescription && !!subtitle && (
            <ThemedText
              className="text-gray-400 text-sm text-start px-1"
              numberOfLines={1}
              style={{ width: width }}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      </TouchableHighlight>
    </>
  );
}
