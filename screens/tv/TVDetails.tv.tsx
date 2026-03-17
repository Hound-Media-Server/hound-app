import { View, Text, ActivityIndicator, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import { ThemedText } from "@/components/ThemedText";
import {
  useShowContinueWatching,
  useCreateRewatch,
} from "@/services/watchDataService";
import { Toast } from "toastify-react-native";
import { useUnifiedStreamsMutation } from "@/services/providerService";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSelectStreamUrl,
  getStreamUrl,
  getAddToCollectionUrl,
  getSeasonsUrl,
} from "@/utils/navigation";
import GradientBackgroundView from "@/components/media_page/GradientBackgroundView";
import {
  TVFocusButtonText,
  TVFocusButtonMore,
} from "@/components/TVFocusButton";
import { useModalStore } from "@/stores/modalStore";
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
  const { mutateAsync: rewatchMutation } = useCreateRewatch();
  const [playSeason, setPlaySeason] = useState<number>(1);
  const [playEpisode, setPlayEpisode] = useState<number>(1);
  const [playMode, setPlayMode] = useState<"play" | "resume">("play");

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

  const resumeStartTime =
    (continueWatching?.watch_action_type === "resume"
      ? continueWatching.watch_progress?.current_progress_seconds
      : 0) || 0;

  useEffect(() => {
    if (continueWatching) {
      if (
        continueWatching.watch_action_type === "resume" &&
        continueWatching.watch_progress
      ) {
        setPlaySeason(continueWatching.watch_progress.season_number);
        setPlayEpisode(continueWatching.watch_progress.episode_number);
        setPlayMode("resume");
      } else if (
        continueWatching.watch_action_type === "next_episode" &&
        continueWatching.next_episode
      ) {
        setPlaySeason(continueWatching.next_episode.season_number);
        setPlayEpisode(continueWatching.next_episode.episode_number);
        setPlayMode("play");
      }
    } else if (!isContinueLoading) {
      // evaluate necessity of checking if first episode for all tmdb shows are
      // s1e1 or if there are edge cases
      setPlaySeason(1);
      setPlayEpisode(1);
      setPlayMode("play");
    }
  }, [continueWatching]);

  const playLabel =
    playMode === "resume"
      ? `▶︎ Resume S${playSeason}E${playEpisode}`
      : `▶︎ Play S${playSeason}E${playEpisode}`;

  const handlePlayPress = async () => {
    let encodedData: string | null = null;
    let startTime: number = 0;
    let playerSettings: string | undefined;
    const navigateSelectStream = async () => {
      router.navigate(
        await getSelectStreamUrl({
          id: id as string,
          mediaType: MediaTypeTVShow,
          modalTitle: details?.media_title,
          season: playSeason,
          episode: playEpisode,
          startTime: resumeStartTime,
          playerSettings: playerSettings,
        }),
      );
    };
    if (playSeason && playEpisode) {
      if (encodedData) {
        try {
          const res = await streamsMutation({
            mediaType: MediaTypeTVShow,
            id: id as string,
            season: playSeason,
            episode: playEpisode,
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
                season: playSeason,
                episode: playEpisode,
                startTime,
                playerSettings,
              }),
            );
          } else {
            await navigateSelectStream();
          }
        } catch (e) {
          console.error("Error matching stream:", e);
        }
      } else {
        await navigateSelectStream();
      }
    } else {
      Alert.alert(
        "Invalid Season or Episode. Please report this issue on Github",
      );
    }
  };

  const handleRewatch = async () => {
    try {
      await rewatchMutation({ id: id as string });
      Toast.success("New Rewatch Started");
    } catch (e: any) {
      if (e?.status === 400) {
        Toast.error("Your current rewatch is already empty!");
      } else {
        Toast.error("Error creating rewatch");
      }
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
  return (
    <View className="flex-1">
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
                {details?.genres?.map((item: any) => item.genre).join(", ")}
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
                <TVFocusButtonText
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
                  label="Rewatch Show"
                />
              </View>
            </View>
          </View>
        </GradientBackgroundView>
      </View>
    </View>
  );
}
