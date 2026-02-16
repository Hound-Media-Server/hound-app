import { View, TouchableHighlight } from "react-native";
import React, { useState } from "react";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { RelativePathString, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { MediaItemContextModal } from "./modals/MediaContextModal";
import { getMediaPageUrl } from "@/utils/navigation";

export default function MediaItemCard({
  mediaItem,
  title,
  subtitle,
  imgAlt,
  showDescription,
  onFocus,
  hasTVPreferredFocus,
}: {
  mediaItem: any;
  title?: string;
  subtitle?: string;
  imgAlt?: string;
  showDescription?: boolean;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}) {
  if (!mediaItem) return;
  const router = useRouter();
  const [showContextMenu, setShowContextMenu] = useState(false);
  let imgSource = mediaItem.thumbnail_uri;
  return (
    <>
      <TouchableHighlight
        className="group rounded-lg"
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
          setShowContextMenu(true);
        }}
      >
        <View>
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
          {showDescription && !!title && (
            <ThemedText className="text-gray-200 mt-2 text-start px-1 w-[120px]">
              {title}
            </ThemedText>
          )}
          {showDescription && !!subtitle && (
            <ThemedText className="text-gray-400 text-sm text-start px-1 w-[120px]">
              {subtitle}
            </ThemedText>
          )}
        </View>
      </TouchableHighlight>
      <MediaItemContextModal
        mediaItem={mediaItem}
        visible={showContextMenu}
        setVisible={setShowContextMenu}
        onClose={() => setShowContextMenu(false)}
        modalTitle={title || ""}
      />
    </>
  );
}
