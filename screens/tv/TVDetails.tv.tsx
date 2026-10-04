import { View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { getAddToCollectionUrl, getSeasonsUrl } from "@/utils/navigation";
import GradientBackgroundView from "@/components/media_page/GradientBackgroundView";
import {
  TVFocusButtonText,
  TVFocusButtonMore,
} from "@/components/TVFocusButton";
import { useModalStore } from "@/stores/modalStore";
import { MediaTypeTVShow } from "@/constants/MediaTypes";
import { TVDetailsProps } from "@/app/tv/[id]";
import MediaPageTitle from "@/components/media_page/MediaPageTitle";
import { formatMediaMetadata, normalizeOverview } from "@/utils/mediaMetadata";

export default function TVDetails({
  id,
  details,
  continueWatching,
  playLabel,
  handlePlayPress,
  handleRewatch,
}: TVDetailsProps) {
  const openModal = useModalStore((s) => s.open);
  const metadata = formatMediaMetadata(details);
  const overview = normalizeOverview(details?.overview);

  return (
    <View className="flex-1">
      <View className="flex-1">
        <GradientBackgroundView
          uri={details?.backdrop_uri as string}
          className="h-full w-full px-8 py-8"
        >
          <View
            className={
              overview.length > 300 ? "flex-1 w-4/5" : "flex-1 w-3/5"
            }
          >
            <View className="absolute bottom-0">
              <MediaPageTitle title={details?.media_title} logoUri={details?.logo_uri} />
              {!!metadata && (
                <ThemedText
                  className="text-secondary mt-1 opacity-80 sm:text-lg"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {metadata}
                </ThemedText>
              )}
              {/* {creators && (
              <ThemedText className="text-gray-300 mt-1 sm:text-lg">
                by {creators}
              </ThemedText>
            )} */}
              <ThemedText className="text-gray-400 text-md sm:text-lg mt-1">
                {overview}
              </ThemedText>
              {details?.cast?.length > 0 && (
                <ThemedText className="italic text-gray-200 text-sm mt-1">
                  Starring{" "}
                  {details.cast
                    .slice(0, 3)
                    .map((item: any) => item.name)
                    .join(", ")}
                  {details.cast.length > 3 && ", and more..."}
                </ThemedText>
              )}
              <View className="flex-row gap-3 mt-3">
                <TVFocusButtonMore
                  onPress={() =>
                    openModal({
                      type: "playOptions",
                      props: {
                        mediaItem: {
                          ...details,
                          watch_progress: continueWatching?.watch_progress,
                          next_episode: continueWatching?.next_episode,
                        },
                        modalTitle: details?.media_title,
                        autoFocus: true,
                        showRewatch: true,
                      },
                    })
                  }
                />
                <TVFocusButtonText
                  onPress={handlePlayPress}
                  label={playLabel}
                  hasTVPreferredFocus
                />
                <TVFocusButtonText
                  label="View Episodes"
                  onPress={() => router.push(getSeasonsUrl(id as string))}
                />
                <TVFocusButtonText
                  onPress={() =>
                    router.push(
                      getAddToCollectionUrl(
                        MediaTypeTVShow,
                        details?.media_source,
                        details?.source_id,
                      ),
                    )
                  }
                  label="Add to Collection"
                />
              </View>
            </View>
          </View>
        </GradientBackgroundView>
      </View>
    </View>
  );
}
