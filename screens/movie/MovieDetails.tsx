import {
  View,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { router } from "expo-router";
import { getAddToCollectionUrl } from "@/utils/navigation";
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
    <>
      <View className="flex-1 relative bg-primary">
        <ParallaxScrollView
          headerHeight={300}
          headerImage={
            details?.backdrop_uri ? (
              <ImageBackground
                source={{ uri: details?.backdrop_uri }}
                className="absolute w-full h-96"
                resizeMode="cover"
              />
            ) : (
              <View className="absolute w-full h-96 bg-zinc-900 border-b border-zinc-800" />
            )
          }
        >
          <View className="px-5 sm:px-8 md:px-24">
            <TouchableOpacity
              focusable
              hasTVPreferredFocus
              onPress={handlePlayPress}
              activeOpacity={0.75}
              className="p-2 mb-3 bg-secondary rounded-2xl w-[120px] sm:w-[150px] items-center"
            >
              <ThemedText className="text-primary text-md sm:text-lg">
                {playLabel}
              </ThemedText>
            </TouchableOpacity>
            <View className="me-5">
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
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    getAddToCollectionUrl(
                      MediaTypeMovie,
                      details?.media_source,
                      details?.source_id,
                    ),
                  )
                }
                activeOpacity={0.75}
                className="p-2 mt-3 bg-white rounded-2xl w-[120px] sm:w-[150px] items-center"
              >
                <ThemedText className="text-primary text-md sm:text-lg">
                  Add to Collection
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
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
                activeOpacity={0.75}
                className="p-2 mt-3 bg-gray-600 rounded-2xl w-[120px] sm:w-[150px] items-center"
              >
                <ThemedText className="text-white text-md sm:text-lg">
                  More
                </ThemedText>
              </TouchableOpacity>
            </View>
            {details?.cast?.length > 0 && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Cast
                </ThemedText>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={details?.cast}
                    showDescription={true}
                    itemType="cast"
                  />
                </View>
              </View>
            )}
          </View>
        </ParallaxScrollView>
      </View>
    </>
  );
}
