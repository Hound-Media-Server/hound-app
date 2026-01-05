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
import SelectStreamModal from "@/components/SelectStreamModal";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {
  useMovieContinueWatching,
  useMovieWatchData,
} from "@/services/watchDataService";
import { fetchMovieProviders } from "@/services/providerService";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

export default function MovieDetails() {
  const queryClient = useQueryClient();
  const [selectStreamModalVisible, setSelectStreamModalVisible] =
    React.useState(false);
  const { id } = useLocalSearchParams();

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["movie-continue-watching", id],
      });
      queryClient.invalidateQueries({ queryKey: ["movie-watch-data", id] });
    }, [id, queryClient])
  );

  const { data: details, isLoading, error } = useMovieDetails(id as string);
  const { data: continueWatching } = useMovieContinueWatching(id as string);
  const { data: movieWatchData } = useMovieWatchData(id as string);

  const watchAction = continueWatching?.watch_action;

  let playLabel = "▶︎ Play";
  if (watchAction) {
    if (watchAction.watch_action_type === "resume") {
      playLabel = "▶︎ Resume";
    }
  }

  const handlePlayPress = async () => {
    let encodedData: string | null = null;
    let startTime: number = 0;

    if (watchAction) {
      if (
        watchAction.watch_action_type === "resume" &&
        watchAction.watch_progress
      ) {
        encodedData = watchAction.watch_progress.encoded_data;
        startTime = watchAction.watch_progress.current_progress_seconds;
      }
    }

    if (encodedData) {
      try {
        const providersRes = await fetchMovieProviders(id as string);
        const streams = providersRes?.data?.providers?.[0]?.streams || [];
        const match = streams.find((s: any) => s.encoded_data === encodedData);
        if (match) {
          router.navigate(
            `/stream/${match.encoded_data}?id=${id}&type=movie&title=${details?.media_title}&startTime=${startTime}`
          );
          return;
        }
      } catch (e) {
        console.error("Error matching stream:", e);
      }
    }

    setSelectStreamModalVisible(true);
  };

  if (isLoading) {
    return (
      <View className="w-full h-full bg-primary justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  const creators = details?.credits?.crew
    ?.filter((item: any) => item.job === "Director")
    .map((item: any) => item.name)
    .join(", ");
  // create array to render info in a row
  const info = [];
  if (details?.runtime) {
    info.push(
      Math.floor(details?.runtime / 60) + "h " + (details?.runtime % 60) + "m"
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
            <ImageBackground
              source={{ uri: details?.backdrop_url }}
              className="absolute w-full h-96"
              resizeMode="cover"
            />
          }
        >
          <View className="px-5 sm:px-8 md:px-24">
            <TouchableOpacity
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
                {details?.genres?.map((item: any) => item.name).join(", ")}
              </ThemedText>
              {info.length > 0 && (
                <ThemedText className="text-gray-400 mt-1 sm:text-lg">
                  {info.join(" ⸱ ")}
                </ThemedText>
              )}
              <ThemedText className="text-gray-300 text-md sm:text-lg mt-1">
                {details?.overview}
              </ThemedText>
            </View>
            {details?.credits?.cast?.length > 0 && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Cast
                </ThemedText>
                <View className="-mx-5">
                  <HorizontalList
                    itemData={details?.credits?.cast}
                    showDescription={true}
                    itemType="cast"
                  />
                </View>
              </View>
            )}
          </View>
        </ParallaxScrollView>
      </View>
      <SelectStreamModal
        id={id as string}
        mediaType="movie"
        modalVisible={selectStreamModalVisible}
        setModalVisible={setSelectStreamModalVisible}
        startTime={watchAction?.watch_progress?.current_progress_seconds || 0}
      />
    </>
  );
}
