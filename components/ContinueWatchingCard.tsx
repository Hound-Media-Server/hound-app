import { View, Text, TouchableHighlight, Platform } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Route, useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { getSelectStreamUrl, getStreamUrl } from "@/utils/navigation";
import { FocusItem, useFocusStore } from "@/stores/focusStore";
import { useModalStore } from "@/stores/modalStore";
import { MediaTypeTVShow } from "@/constants/MediaTypes";

export default function ContinueWatchingCard({
  item,
  onFocus,
  hasTVPreferredFocus,
  rowIndex,
}: {
  item: any;
  onFocus: () => void;
  hasTVPreferredFocus?: boolean;
  rowIndex?: number;
}) {
  if (!item) return;
  const router = useRouter();
  const setFocusedItem = useFocusStore((s) => s.setFocusedItem);
  const openModal = useModalStore((s) => s.open);

  let route = "";
  let title = "";
  let subtitle = "";
  let imgSource = "";
  const itemID = item.media_source + "-" + item.source_id;
  const mediaType = item.media_type;
  // resume case
  if (item.watch_action_type == "resume") {
    const wp = item.watch_progress;
    // for resume
    // TODO: allow fallback to select stream if failure
    route = getStreamUrl(wp.encoded_data, true, {
      id: itemID,
      mediaType: mediaType,
      modalTitle: wp.media_title,
      season: wp.season_number,
      episode: wp.episode_number,
      startTime: wp.current_progress_seconds,
      playerSettings: JSON.stringify(wp.player_settings),
    });
    title = wp?.media_title;
    if (mediaType === MediaTypeTVShow) {
      title = `S${wp.season_number}E${wp.episode_number} | ${wp?.media_title}`;
    }
    subtitle = mediaType === MediaTypeTVShow ? wp.episode_title : "";
    imgSource = wp?.thumbnail_uri;
  } else if (item.watch_action_type == "next_episode") {
    const nextEp = item.next_episode;
    // for next episode, show select-stream modal
    title = nextEp?.media_title;
    if (mediaType === MediaTypeTVShow) {
      title = `S${nextEp.season_number}E${nextEp.episode_number} | ${nextEp?.media_title}`;
    }
    subtitle = mediaType === MediaTypeTVShow ? nextEp.episode_title : "";
    imgSource = nextEp?.thumbnail_uri;
  } else {
    return <></>;
  }
  return (
    <>
      <TouchableHighlight
        className={"rounded-lg" + Platform.isTV ? "group" : ""}
        focusable
        hasTVPreferredFocus={hasTVPreferredFocus || false}
        onFocus={() => {
          const focusItem: FocusItem = {
            media_type: item.media_type,
            source_id: item.source_id,
            media_title:
              item.watch_progress?.media_title ||
              item.next_episode?.media_title,
            media_subtitle:
              item.watch_progress?.episode_title ||
              item.next_episode?.episode_title,
            overview:
              item.watch_progress?.overview || item.next_episode?.overview,
            backdrop_uri:
              item.watch_progress?.thumbnail_uri ||
              item.next_episode?.thumbnail_uri,
            release_date:
              item.watch_progress?.release_date ||
              item.next_episode?.release_date,
            season_number:
              item.watch_progress?.season_number ||
              item.next_episode?.season_number,
            episode_number:
              item.watch_progress?.episode_number ||
              item.next_episode?.episode_number,
          };
          setFocusedItem(focusItem);
          onFocus?.();
        }}
        activeOpacity={Platform.isTV ? 1 : 0.9}
        disabled={!item.media_type}
        onPress={async () => {
          let finalRoute = route;
          if (item.watch_action_type === "next_episode") {
            const nextEp = item.next_episode;
            finalRoute = await getSelectStreamUrl({
              id: itemID,
              mediaType: mediaType,
              season: nextEp.season_number,
              episode: nextEp.episode_number,
            });
          }
          router.navigate(finalRoute as Route);
        }}
        onLongPress={() =>
          openModal({
            type: "watchEvent",
            props: {
              modalTitle: title,
              mediaItem: item,
            },
          })
        }
      >
        <View>
          <View className="rounded-lg">
            {imgSource ? (
              <Image
                className={
                  "border-2 w-[200px] h-[112px] rounded-lg bg-gray-300" +
                  (Platform.isTV ? " group-focus:border-white" : "")
                }
                source={imgSource}
                contentFit="cover"
                transition={1000}
              />
            ) : (
              <View
                className={
                  "border-zinc-700 border-2 w-[200px] h-[112px] rounded-lg bg-zinc-800 items-center justify-center" +
                  (Platform.isTV ? " group-focus:border-white" : "")
                }
              >
                <ThemedText className="text-gray-500">No Image</ThemedText>
              </View>
            )}
            <View className="absolute bottom-2 right-1 bg-black/50 px-1.5 py-0.5 rounded-md">
              {item.watch_progress && (
                <ThemedText className="text-white text-xs">
                  {Math.ceil(
                    (item.watch_progress.total_duration_seconds -
                      item.watch_progress.current_progress_seconds) /
                      60,
                  )}
                  m left
                </ThemedText>
              )}
              {item.next_episode && (
                <ThemedText className="text-white text-xs">
                  Next Episode
                </ThemedText>
              )}
            </View>
          </View>
          <View className="w-[200px]">
            {!!title && (
              <ThemedText
                className="text-gray-200 mt-2 text-start"
                numberOfLines={1}
              >
                {title}
              </ThemedText>
            )}
            {!!subtitle && (
              <ThemedText
                className="text-gray-400 text-sm text-start"
                numberOfLines={1}
              >
                "{subtitle}"
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableHighlight>
    </>
  );
}
