import React, { useCallback } from "react";
import { View, FlatList, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAllCollections } from "@/services/collectionService";
import { ThemedText } from "@/components/ThemedText";
import { useRouter, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

export default function Collections() {
  const { data: collections, isLoading, error } = useAllCollections();
  const router = useRouter();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    }, [queryClient]),
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ThemedText>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ThemedText>Error: {error.message}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className={"px-5 md:px-12 " + (Platform.isTV ? "mt-20" : "mt-5")}>
        <ThemedText className="ps-2 text-2xl text-white mb-3">
          Your Collections
        </ThemedText>
        <FlatList
          data={collections}
          keyExtractor={(item) => item.collection_id.toString()}
          renderItem={({ item }) => (
            <Pressable
              className="bg-white/10 p-4 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white"
              onPress={() =>
                router.push(`/collections/${item.collection_id}` as any)
              }
              focusable={Platform.isTV}
            >
              <ThemedText className="text-xl font-semibold text-white">
                {item.collection_title}
              </ThemedText>
              {item.description ? (
                <ThemedText className="text-gray-400 mt-1" numberOfLines={2}>
                  {item.description}
                </ThemedText>
              ) : null}
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
