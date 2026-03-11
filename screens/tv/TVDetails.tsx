import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SeasonSection from "@/components/media_page/SeasonSection";
import { useShowContinueWatching } from "@/services/watchDataService";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSelectStreamUrl,
  getStreamUrl,
  getAddToCollectionUrl,
} from "@/utils/navigation";
import { ImageBackground } from "expo-image";
import { useModalStore } from "@/stores/modalStore";
import {
  useMediaFiles,
  useUnifiedStreamsMutation,
} from "@/services/providerService";
import { MediaTypeTVShow } from "@/constants/MediaTypes";

export default function TVDetails() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const openModal = useModalStore((s) => s.open);
  // fetch show details
  const { data: details, isLoading, error } = useShowDetails(id as string);
  const { data: continueWatching, isLoading: isContinueLoading } =
    useShowContinueWatching(id as string);
  const { mutateAsync: streamsMutation } = useUnifiedStreamsMutation();
  const { data: mediaFiles } = useMediaFiles(MediaTypeTVShow, id as string);

  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["show-continue-watching", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["show-watch-data", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["show-watch-progress", id],
      });
    }, [id, queryClient]),
  );

  const watchAction = continueWatching;
  const resumeStartTime =
    (watchAction?.watch_action_type === "resume"
      ? watchAction.watch_progress?.current_progress_seconds
      : 0) || 0;

  // this contains streams for every season and episode in hound
  const streams = mediaFiles?.data?.providers?.[0]?.streams;
  let playLabel = "▶︎ Play";
  if (watchAction) {
    if (
      watchAction.watch_action_type === "resume" &&
      watchAction.watch_progress
    ) {
      const s = watchAction.watch_progress.season_number;
      const e = watchAction.watch_progress.episode_number;
      if (s && e) {
        playLabel = `▶︎ Resume S${s}E${e}`;
      } else {
        playLabel = "▶︎ Resume";
      }
    } else if (
      watchAction.watch_action_type === "next_episode" &&
      watchAction.next_episode
    ) {
      const s = watchAction.next_episode.season_number;
      const e = watchAction.next_episode.episode_number;
      if (s && e) {
        playLabel = `▶︎ Play S${s}E${e}`;
      }
    }
  } else if (!isContinueLoading) {
    // evaluate necessity of checking if first episode for all tmdb shows are
    // s1e1 or if there are edge cases
    playLabel = "▶︎ Play S1E1";
  }

  const handlePlayPress = async () => {
    let targetSeason: number | undefined;
    let targetEpisode: number | undefined;
    let encodedData: string | null = null;
    let startTime: number = 0;
    let playerSettings: string | undefined;
    if (watchAction) {
      if (
        watchAction.watch_action_type === "resume" &&
        watchAction.watch_progress
      ) {
        targetSeason = watchAction.watch_progress.season_number;
        targetEpisode = watchAction.watch_progress.episode_number;
        encodedData = watchAction.watch_progress.encoded_data;
        startTime = watchAction.watch_progress.current_progress_seconds;
        playerSettings = JSON.stringify(
          watchAction.watch_progress.player_settings,
        );
      } else if (
        watchAction.watch_action_type === "next_episode" &&
        watchAction.next_episode
      ) {
        targetSeason = watchAction.next_episode.season_number;
        targetEpisode = watchAction.next_episode.episode_number;
      }
    } else {
      // Start at S1E1
      targetSeason = 1;
      targetEpisode = 1;
    }
    if (targetSeason && targetEpisode) {
      if (encodedData) {
        try {
          const res = await streamsMutation({
            mediaType: MediaTypeTVShow,
            id: id as string,
            season: targetSeason,
            episode: targetEpisode,
          });
          // flatten providers array
          const match = res?.data?.providers
            ?.flatMap((p: any) => p.streams ?? [])
            .find((s: any) => s.encoded_data === encodedData);

          if (match) {
            router.navigate(
              getStreamUrl(match.encoded_data, true, {
                id: id as string,
                mediaType: MediaTypeTVShow,
                season: targetSeason,
                episode: targetEpisode,
                startTime,
                playerSettings,
              }),
            );
          }
        } catch (e) {
          console.error("Error matching stream:", e);
        }
      }
      // if stream doesn't exist in providers response, open select stream modal
      router.navigate(
        await getSelectStreamUrl({
          id: id as string,
          mediaType: MediaTypeTVShow,
          season: targetSeason,
          episode: targetEpisode,
          startTime: resumeStartTime,
          playerSettings: playerSettings,
        }),
      );
    } else {
      Alert.alert(
        "Invalid Season or Episode. Please report this issue on Github",
      );
    }
  };

  if (isLoading || isContinueLoading) {
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
