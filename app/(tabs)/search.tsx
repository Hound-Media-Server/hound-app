import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
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
    (query as string) || ""
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

  // delay search by some millis
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
      <View className="w-full p-5 flex flex-row">
        <TextInput
          className="w-full bg-zinc-800 text-white p-4 rounded-lg border border-zinc-700 focus:border-indigo-500 focus:outline-none"
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {searchQuery && (
        <View className="w-full p-5">
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
            <HorizontalList
              isLoading={isSearching}
              itemData={data?.tv_results}
              itemType="search"
              header="TV Shows"
            />
            <View className="mb-5" />
            <HorizontalList
              isLoading={isSearching}
              itemData={data?.movie_results}
              itemType="search"
              header="Movies"
            />
            <View className="mb-[100px]" />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
