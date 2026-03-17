import { View } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { getAddToCollectionUrl } from "@/utils/navigation";
import GradientBackgroundView from "@/components/media_page/GradientBackgroundView";
import {
  TVFocusButtonMore,
  TVFocusButtonText,
} from "@/components/TVFocusButton";
import { useModalStore } from "@/stores/modalStore";
import { MediaTypeMovie } from "@/constants/MediaTypes";
import { MovieDetailsProps } from "@/app/movie/[id]";

export default function MovieDetails({
  id,
  details,
  continueWatching,
  movieWatchData,
  playLabel,
  handlePlayPress,
}: MovieDetailsProps) {
  const openModal = useModalStore((s) => s.open);

  const creators = details?.creators?.map((item: any) => item.name).join(", ");
  // create array to render info in a row
  const info = [];
  if (details?.duration) {
    details.duration <= 60
      ? info.push(details.duration + "m")
      : info.push(
          Math.floor(details?.duration / 60) +
            "h " +
            (details?.duration % 60) +
            "m",
        );
  }
  if (creators) {
    info.push(creators);
  }
  return (
    <View className="flex-1">
      <GradientBackgroundView
        uri={details?.backdrop_uri as string}
        className="h-full w-full px-8 py-8"
      >
        <View className="flex-1 w-3/5">
          <View className="absolute bottom-0">
            <ThemedText className="text-white text-3xl leading-[36px]">
              {details?.media_title}
              <ThemedText className="text-gray-400 text-2xl leading-[32px]">
                {" (" + details?.release_date?.split("-")[0] + ")"}
              </ThemedText>
            </ThemedText>
            {movieWatchData && (
              <ThemedText className="text-gray-400 text-xs sm:text-sm">
                Last watched {movieWatchData}
              </ThemedText>
            )}
            <ThemedText className="text-secondary mt-1 opacity-80 sm:text-lg">
              {details?.genres?.map((item: any) => item.genre).join(", ")}
            </ThemedText>
            {info.length > 0 && (
              <ThemedText className="text-gray-300 mt-1 sm:text-lg">
                {info.join(" ⸱ ")}
              </ThemedText>
            )}
            <ThemedText className="text-gray-400 text-md sm:text-lg mt-1">
              {details?.overview}
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
                      },
                      modalTitle: details?.media_title,
                      autoFocus: true,
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
                onPress={() =>
                  router.push(
                    getAddToCollectionUrl(
                      MediaTypeMovie,
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
  );
}
