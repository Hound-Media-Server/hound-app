import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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
            {data?.tv_results?.length > 0 && (
              <>
                <HorizontalList
                  isLoading={isSearching}
                  itemData={data?.tv_results}
                  itemType="search"
                  header="TV Shows"
                  rowIndex={1}
                  showDescription
                  hasPreferredFocus={!isSearching}
                />
                <View className="mb-5" />
              </>
            )}
            {data?.movie_results?.length > 0 && (
              <HorizontalList
                isLoading={isSearching}
                itemData={data?.movie_results}
                itemType="search"
                header="Movies"
                rowIndex={2}
                showDescription
                hasPreferredFocus={
                  !isSearching && !(data?.tv_results?.length > 0)
                }
              />
            )}
            {!(data?.tv_results?.length > 0) &&
              !(data?.movie_results?.length > 0) && (
                <View className="flex-1 items-center justify-center mt-10">
                  <ThemedText className="text-white text-lg">
                    No results found.
                  </ThemedText>
                </View>
              )}
            <View className="mb-[100px]" />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
