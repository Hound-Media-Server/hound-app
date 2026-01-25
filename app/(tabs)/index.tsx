import { View, Text, ScrollView, RefreshControl } from "react-native";
import React, { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContinueWatching,
  useTrendingMovies,
  useTrendingShows,
} from "./../../services/catalogService";
import HorizontalList from "@/components/HorizontalList";

export default function Index() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["trending-movies"] }),
      queryClient.invalidateQueries({ queryKey: ["trending-shows"] }),
    ]);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Text className="text-secondary text-3xl text-center mb-5">Hound</Text>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <HorizontalList useQuery={useTrendingShows} header="Trending Shows" />
          <View className="mb-5" />
          <HorizontalList
            useQuery={useTrendingMovies}
            header="Trending Movies"
          />
          <View className="mb-5" />
          <HorizontalList
            useQuery={useContinueWatching}
            header="Continue Watching"
            itemType="episode"
          />
          <View className="mb-[100px]" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
