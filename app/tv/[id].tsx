import TVDetailsMobile from "@/screens/tv/TVDetails";
import TVDetailsTV from "@/screens/tv/TVDetails.tv";
import { Platform, View, ActivityIndicator, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import {
  useShowContinueWatching,
  useCreateRewatch,
} from "@/services/watchDataService";
import { Toast } from "toastify-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { getSelectStreamUrl } from "@/utils/navigation";
import { MediaTypeTVShow } from "@/constants/MediaTypes";

export interface TVDetailsProps {
  id: string;
  details: any;
  continueWatching: any;
  playLabel: string;
  handlePlayPress: () => Promise<void>;
  handleRewatch: () => Promise<void>;
}

export default function TVDetails() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();

  // fetch show details
  const { data: details, isLoading, error } = useShowDetails(id as string);
  const { data: continueWatching, isLoading: isContinueLoading } =
    useShowContinueWatching(id as string);
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
      setPlaySeason(1);
      setPlayEpisode(1);
      setPlayMode("play");
    }
  }, [continueWatching, isContinueLoading]);

  const playLabel =
    playMode === "resume"
      ? `▶︎ Resume S${playSeason}E${playEpisode}`
      : `▶︎ Play S${playSeason}E${playEpisode}`;

  const handlePlayPress = async () => {
    let encodedData: string | null = null;
    let playerSettings: string | undefined;
    if (playSeason && playEpisode) {
      router.navigate(
        getSelectStreamUrl({
          id: id as string,
          mediaType: MediaTypeTVShow,
          modalTitle: details?.media_title,
          season: playSeason,
          episode: playEpisode,
          startTime: resumeStartTime,
          playerSettings: playerSettings,
          previousEncodedData: encodedData || undefined,
        }),
      );
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

  const props: TVDetailsProps = {
    id: id as string,
    details,
    continueWatching,
    playLabel,
    handlePlayPress,
    handleRewatch,
  };

  if (Platform.isTV) {
    return <TVDetailsTV {...props} />;
  }
  return <TVDetailsMobile {...props} />;
}
