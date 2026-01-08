import { View, Text, TouchableHighlight } from "react-native";
import React from "react";
import { Image } from "react-native";
import { Route, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { getSelectStreamUrl, getStreamUrl } from "@/utils/navigation";

export default function ContinueWatchingCard({ item }: { item: any }) {
  const router = useRouter();
  if (!item) return;
  let route = "";
  let title = "";
  let subtitle = "";
  let imgSource = "";
  const itemID = item.media_source + "-" + item.source_id;
  const mediaType = item.media_type.replace("tvshow", "tv");
  // resume case
  if (item.watch_action_type == "resume") {
    const wp = item.watch_progress;
    // for resume, show stream modal
    route = getStreamUrl(wp.encoded_data, {
      id: itemID,
      type: mediaType,
      title: wp.media_title,
      season: wp.season_number,
      episode: wp.episode_number,
      startTime: wp.current_progress_seconds,
    });
    title = wp?.media_title;
    if (mediaType === "tv") {
      title += ` - S${wp.season_number}E${wp.episode_number}`;
    }
    subtitle = mediaType === "tv" ? wp.episode_title : "";
    imgSource = wp?.thumbnail_url;
  } else if (item.watch_action_type == "next_episode") {
    const nextEp = item.next_episode;
    // for next episode, show select-stream modal
    route = getSelectStreamUrl({
      id: itemID,
      type: mediaType,
      title: nextEp.media_title,
      season: nextEp.season_number,
      episode: nextEp.episode_number,
    });
    title = nextEp?.media_title;
    if (mediaType === "tv") {
      title += ` - S${nextEp.season_number}E${nextEp.episode_number}`;
    }
    subtitle = mediaType === "tv" ? nextEp.episode_title : "";
    imgSource = nextEp?.thumbnail_url;
  } else {
    return <></>;
  }
  return (
    <TouchableHighlight
      disabled={!item.media_type}
      onPress={() => {
        // cast/credits case
        if (!item.media_type) return;
        router.navigate(route as Route);
      }}
    >
      <View className="flex-1 w-[200px]">
        <Image
          className="w-[200px] h-[112px] rounded-lg bg-gray-300"
          source={{ uri: imgSource }}
        />
        {!!title && (
          <ThemedText className="text-gray-200 mt-2 text-start">
            {title}
          </ThemedText>
        )}
        {!!subtitle && (
          <ThemedText className="text-gray-400 text-sm text-start">
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableHighlight>
  );
}
