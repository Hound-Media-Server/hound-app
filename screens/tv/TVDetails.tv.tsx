import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SeasonSection from "@/components/media_page/SeasonSection";
import { useShowContinueWatching } from "@/services/watchDataService";
import { fetchShowProviders } from "@/services/providerService";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSelectStreamUrl,
  getStreamUrl,
  getAddToCollectionUrl,
} from "@/utils/navigation";
import { ImageBackground } from "expo-image";
import GradientBackgroundView from "@/components/media_page/GradientBackgroundView";
import FocusButton from "@/components/FocusButton";

export default function TVDetails() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const [showSeasonsModal, setShowSeasonsModal] = React.useState(false);
  const SCREEN_HEIGHT = Dimensions.get("window").height;

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

  // fetch show details
  const { data: details, isLoading, error } = useShowDetails(id as string);
  const { data: continueWatching, isLoading: isContinueLoading } =
    useShowContinueWatching(id as string);

  const watchAction = continueWatching;
  const resumeStartTime =
    (watchAction?.watch_action_type === "resume"
      ? watchAction.watch_progress?.current_progress_seconds
      : 0) || 0;

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
          const providersRes = await fetchShowProviders(
            id as string,
            targetSeason,
            targetEpisode,
          );
          const streams = providersRes?.data?.providers?.[0]?.streams || [];
          const match = streams.find(
            (s: any) => s.encoded_data === encodedData,
          );
          if (match) {
            router.navigate(
              getStreamUrl(match.encoded_data, true, {
                id: id as string,
                type: "tv",
                title: details?.media_title,
                season: targetSeason,
                episode: targetEpisode,
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
      // if stream doesn't exist in providers response, open select stream modal
      router.navigate(
        getSelectStreamUrl({
          id: id as string,
          type: "tv",
          season: targetSeason,
          episode: targetEpisode,
          startTime: resumeStartTime,
          title: details?.media_title,
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
                  {" (" + details?.release_date.split("-")[0] + ")"}
                </ThemedText>
              </ThemedText>
              <ThemedText className="text-secondary mt-1 opacity-80 sm:text-lg">
                {details?.genres?.map((item: any) => item.name).join(", ")}
              </ThemedText>
              {/* {creators && (
              <ThemedText className="text-gray-300 mt-1 sm:text-lg">
                by {creators}
              </ThemedText>
            )} */}
              <ThemedText className="text-gray-400 text-md sm:text-lg mt-1">
                {details?.overview}
              </ThemedText>
              {details?.cast?.length > 0 && (
                <ThemedText className="italic text-gray-300 text-sm mt-1">
                  Starring{" "}
                  {details.cast
                    .slice(0, 3)
                    .map((item: any) => item.name)
                    .join(", ")}
                  {details.cast.length > 3 && ", and more..."}
                </ThemedText>
              )}
              <View className="flex-row gap-3 mt-3">
                <FocusButton
                  onPress={handlePlayPress}
                  label={playLabel}
                  hasTVPreferredFocus
                />
                <FocusButton
                  label="View Episodes"
                  onPress={() => setShowSeasonsModal(true)}
                />
                <FocusButton
                  onPress={() =>
                    router.push(
                      getAddToCollectionUrl(
                        "tv",
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
      <Modal
        visible={showSeasonsModal}
        animationType="fade"
        onRequestClose={() => setShowSeasonsModal(false)}
      >
        <View
          className="flex-1 bg-primary p-5"
          style={{ paddingTop: SCREEN_HEIGHT / 5 }}
        >
          <SeasonSection
            sourceID={id as string}
            seasons={seasonsData}
            defaultSeason={seasonsData[0]?.season_number}
            mediaTitle={details?.media_title}
          />
        </View>
      </Modal>
    </>
  );
}
