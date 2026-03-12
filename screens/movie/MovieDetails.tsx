import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useMovieDetails } from "@/services/mediaDetailsService";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {
  useMovieContinueWatching,
  useMovieWatchData,
} from "@/services/watchDataService";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSelectStreamUrl,
  getStreamUrl,
  getAddToCollectionUrl,
} from "@/utils/navigation";
import { useModalStore } from "@/stores/modalStore";
import { useUnifiedStreamsMutation } from "@/services/providerService";
import { MediaTypeMovie } from "@/constants/MediaTypes";

export default function MovieDetails() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const openModal = useModalStore((s) => s.open);

  const { data: details, isLoading, error } = useMovieDetails(id as string);
  const { data: continueWatching, isLoading: isContinueLoading } =
    useMovieContinueWatching(id as string);
  const { data: movieWatchData, isLoading: isWatchDataLoading } =
    useMovieWatchData(id as string);
  const { mutateAsync: streamsMutation } = useUnifiedStreamsMutation();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["movie-continue-watching", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["movie-watch-data", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["movie-watch-progress", id],
      });
    }, [id, queryClient]),
  );

  const watchAction = continueWatching;

  let playLabel = "▶︎ Play";
  if (watchAction) {
    if (watchAction.watch_action_type === "resume") {
      playLabel = "▶︎ Resume";
    }
  }

  const handlePlayPress = async () => {
    let encodedData: string | null = null;
    let startTime: number = 0;
    let playerSettings: string | undefined;

    if (watchAction) {
      if (
        watchAction.watch_action_type === "resume" &&
        watchAction.watch_progress
      ) {
        encodedData = watchAction.watch_progress.encoded_data;
        startTime = watchAction.watch_progress.current_progress_seconds;
        playerSettings = JSON.stringify(
          watchAction.watch_progress.player_settings,
        );
      }
    }

    if (encodedData) {
      try {
        const res = await streamsMutation({
          mediaType: MediaTypeMovie,
          id: id as string,
        });
        const match = res?.data?.providers
          ?.flatMap((p: any) => p.streams ?? [])
          .find((s: any) => s.encoded_data === encodedData);
        if (match) {
          router.navigate(
            getStreamUrl(match.encoded_data, true, {
              id: id as string,
              mediaType: MediaTypeMovie,
              startTime: startTime,
              playerSettings: playerSettings,
            }),
          );
          return;
        }
      } catch (e) {
        console.error("Error matching stream:", e);
      }
    }

    router.navigate(
      await getSelectStreamUrl({
        id: id as string,
        mediaType: MediaTypeMovie,
        modalTitle: details?.media_title,
        startTime: watchAction?.watch_progress?.current_progress_seconds || 0,
        playerSettings: playerSettings,
      }),
    );
  };

  if (isLoading || isContinueLoading || isWatchDataLoading) {
    return (
      <View className="w-full h-full bg-primary justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
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
                  {" (" + details?.release_date.split("-")[0] + ")"}
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
