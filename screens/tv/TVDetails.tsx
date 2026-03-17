import { View, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SeasonSection from "@/components/media_page/SeasonSection";
import { getAddToCollectionUrl } from "@/utils/navigation";
import { ImageBackground } from "expo-image";
import { useModalStore } from "@/stores/modalStore";
import { MediaTypeTVShow } from "@/constants/MediaTypes";
import { TVDetailsProps } from "@/app/tv/[id]";

export default function TVDetails({
  id,
  details,
  continueWatching,
  playLabel,
  handlePlayPress,
  handleRewatch,
}: TVDetailsProps) {
  const openModal = useModalStore((s) => s.open);

  const creators = details?.creators?.map((item: any) => item.name).join(", ");
  // if first season is specials, move it to the end
  const seasonsData =
    details?.seasons?.[0]?.season_number === 0
      ? [...details.seasons.slice(1), details.seasons[0]]
      : details?.seasons;
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
                contentFit="cover"
              />
            ) : (
              <View className="absolute w-full h-96 bg-zinc-900 border-b border-zinc-800" />
            )
          }
        >
          <View className="px-5 sm:px-8 md:px-24">
            <View className="flex-row">
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
            </View>
            <View className="me-5">
              <View className="flex-row items-center">
                <ThemedText className="text-white text-3xl leading-[36px]">
                  {details?.media_title}
                  <ThemedText className="text-gray-400 text-2xl leading-[32px]">
                    {" (" + details?.release_date?.split("-")[0] + ")"}
                  </ThemedText>
                </ThemedText>
              </View>
              <ThemedText className="text-secondary mt-1 opacity-80 sm:text-lg">
                {details?.genres?.map((item: any) => item.genre).join(", ")}
              </ThemedText>
              {!!creators && (
                <ThemedText className="text-gray-300 mt-1 sm:text-lg">
                  {creators}
                </ThemedText>
              )}
              <ThemedText className="text-gray-400 text-md sm:text-lg mt-1">
                {details?.overview}
              </ThemedText>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    getAddToCollectionUrl(
                      MediaTypeTVShow,
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
                    type: "confirm",
                    props: {
                      modalTitle: "Rewatch Show",
                      message:
                        "Are you sure you want to rewatch this show? This will archive your current progress.",
                      autoFocus: true,
                      onPress: handleRewatch,
                    },
                  })
                }
                activeOpacity={0.75}
                className="p-2 mt-3 bg-white rounded-2xl w-[120px] sm:w-[150px] items-center"
              >
                <ThemedText className="text-primary text-md sm:text-lg">
                  Rewatch Show
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
                        next_episode: continueWatching?.next_episode,
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
            {!!details?.seasons?.length && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Seasons
                </ThemedText>
                <SeasonSection
                  sourceID={id as string}
                  seasons={seasonsData}
                  defaultSeason={seasonsData[0]?.season_number}
                  mediaTitle={details?.media_title}
                />
              </View>
            )}
            {!!details?.cast?.length && (
              <View className="mt-2">
                <ThemedText className=" text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Cast
                </ThemedText>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={details?.cast}
                    itemType="cast"
                    showDescription={true}
                  />
                </View>
              </View>
            )}
          </View>
        </ParallaxScrollView>
        <View className="ms-5 me-5 sm:px-8 md:px-24"></View>
      </View>
    </>
  );
}
