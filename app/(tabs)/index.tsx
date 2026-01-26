import { RefreshControl, FlatList, Platform, View, Text } from "react-native";
import React, { useState, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContinueWatching,
  useTrendingMovies,
  useTrendingShows,
} from "./../../services/catalogService";
import HorizontalList from "@/components/HorizontalList";
import { ThemedText } from "@/components/ThemedText";
import HomeDetails from "@/components/home/HomeDetails";

export default function Index() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["trending-movies"] }),
      queryClient.invalidateQueries({ queryKey: ["trending-shows"] }),
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] }),
    ]);
    setRefreshing(false);
  }, []);

  const rows = [
    { key: "trendingShows", header: "Trending Shows", query: useTrendingShows },
    {
      key: "trendingMovies",
      header: "Trending Movies",
      query: useTrendingMovies,
    },
    {
      key: "continueWatching",
      header: "Continue Watching",
      query: useContinueWatching,
      itemType: "episode",
    },
  ];

  const verticalListRef = useRef<FlatList>(null);
  return (
    <SafeAreaView className="flex bg-black">
      <HomeDetails item={null} />
      <FlatList
        className="mt-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={verticalListRef}
        data={rows}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        renderItem={({ item, index }) => (
          <HorizontalList
            key={item.key}
            header={item.header}
            useQuery={item.query}
            itemType={item.itemType}
            rowIndex={index}
            onRowFocus={(rowIndex: number) => {
              if (!Platform.isTV) return;
              verticalListRef.current?.scrollToIndex({
                index: rowIndex,
                viewPosition: 0.5,
                animated: true,
              });
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-5" />}
      />
    </SafeAreaView>
  );
}
