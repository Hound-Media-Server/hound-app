import MovieDetailsMobile from "@/screens/movie/MovieDetails";
import MovieDetailsTV from "@/screens/movie/MovieDetails.tv";
import { Platform, View, ActivityIndicator, Text } from "react-native";
import React from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useMovieDetails } from "@/services/mediaDetailsService";
import {
  useMovieContinueWatching,
  useMovieWatchData,
} from "@/services/watchDataService";
import { useQueryClient } from "@tanstack/react-query";
import { getSelectStreamUrl, getStreamUrl } from "@/utils/navigation";
import { useUnifiedStreamsMutation } from "@/services/providerService";
import { MediaTypeMovie } from "@/constants/MediaTypes";

export interface MovieDetailsProps {
  id: string;
  details: any;
  continueWatching: any;
  movieWatchData: any;
  playLabel: string;
  handlePlayPress: () => Promise<void>;
}

export default function MovieDetails() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();

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

  const props: MovieDetailsProps = {
    id: id as string,
    details,
    continueWatching,
    movieWatchData,
    playLabel,
    handlePlayPress,
  };

  if (Platform.isTV) {
    return <MovieDetailsTV {...props} />;
  }
  return <MovieDetailsMobile {...props} />;
}
