import {
  View,
  TextInput,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { useSearch } from "@/services/searchService";
import HorizontalList from "@/components/HorizontalList";
import { useQueryClient } from "@tanstack/react-query";

export default function Search() {
  const { query } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((query as string) || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    (query as string) || "",
  );

  const [refreshing, setRefreshing] = useState(false);
  const verticalListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["search"] }),
    ]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (query) {
      setSearchQuery(query as string);
      setDebouncedSearchQuery(query as string);
    }
  }, [query]);

  // debounce search by some millis
  useEffect(() => {
    if (searchQuery === query) return;
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, query]);

  const { data, isLoading, error } = useSearch(debouncedSearchQuery);

  const isSearching =
    isLoading ||
    (searchQuery.length > 0 && searchQuery !== debouncedSearchQuery);
  const rows = [
    { key: "tv", header: "TV Shows", itemData: data?.tv_results },
    { key: "movies", header: "Movies", itemData: data?.movie_results },
  ].filter((row) => row.itemData?.length > 0);

  return (
    <SafeAreaView className="flex-1 bg-black items-center">
      <View
        className={"w-full px-5 md:px-10 " + (Platform.isTV ? "mt-20" : "mt-5")}
      >
        <TextInput
          className="w-full bg-zinc-800 text-white p-4 rounded-md border border-zinc-700 focus:border-indigo-500 focus:outline-none"
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {searchQuery && (
        <View className="flex-1 w-full pt-5">
          {error && (
            <View className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <ThemedText className="text-red-200">
                Search failed: {(error as Error).message}
              </ThemedText>
            </View>
          )}
          <FlatList
            ref={verticalListRef}
            data={rows}
            keyExtractor={(item) => item.key}
            scrollEnabled={!Platform.isTV}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item, index }) => (
              <HorizontalList
                isLoading={isSearching}
                itemData={item.itemData}
                itemType="search"
                header={item.header}
                rowIndex={index}
                showDescription
                hasPreferredFocus={!isSearching && index === 0}
                onRowFocus={(rowIndex) => {
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
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center mt-10">
                <ThemedText className="text-white text-lg">
                  No results found.
                </ThemedText>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
