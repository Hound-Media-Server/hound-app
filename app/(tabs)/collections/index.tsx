import React, { useCallback } from "react";
import { View, FlatList, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useAllCollections,
  usePublicCollections,
} from "@/services/collectionService";
import { ThemedText } from "@/components/ThemedText";
import { useRouter, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMobileTabContentPadding } from "@/hooks/useMobileTabContentPadding";

export default function Collections() {
  const bottomPadding = useMobileTabContentPadding();
  const {
    data: collections,
    isLoading: isCollectionsLoading,
    error: isCollectionsError,
  } = useAllCollections();
  const {
    data: publicCollections,
    isLoading: isPublicCollectionsLoading,
    error: isPublicCollectionsError,
  } = usePublicCollections();

  const router = useRouter();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["public-collections"] });
    }, [queryClient]),
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View
        className={"px-5 md:px-12 " + (Platform.isTV ? "mt-20" : "mt-5 flex-1")}
      >
        {(isCollectionsLoading || isCollectionsError) && (
          <View className="justify-center items-center">
            {isCollectionsLoading && <ThemedText>Loading...</ThemedText>}
            {isCollectionsError && (
              <ThemedText>{isCollectionsError.message}</ThemedText>
            )}
          </View>
        )}
        {!!collections?.length && (
          <>
            <ThemedText className="ps-2 text-2xl text-white mb-3">
              Your Collections
            </ThemedText>
            <FlatList
              style={!Platform.isTV ? { flex: 1 } : undefined}
              data={collections}
              contentContainerStyle={{
                paddingBottom: publicCollections?.length ? 0 : bottomPadding,
              }}
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
                    <ThemedText
                      className="text-gray-400 mt-1"
                      numberOfLines={2}
                    >
                      {item.description}
                    </ThemedText>
                  ) : null}
                </Pressable>
              )}
            />
          </>
        )}
        {(isPublicCollectionsLoading || isPublicCollectionsError) && (
          <View className="justify-center items-center">
            {isPublicCollectionsLoading && <ThemedText>Loading...</ThemedText>}
            {isPublicCollectionsError && (
              <ThemedText>{isPublicCollectionsError.message}</ThemedText>
            )}
          </View>
        )}
        {!!publicCollections?.length && (
          <>
            <ThemedText className="ps-2 text-2xl text-white mb-3 mt-3">
              Public Collections
            </ThemedText>
            <FlatList
              style={!Platform.isTV ? { flex: 1 } : undefined}
              data={publicCollections}
              contentContainerStyle={{ paddingBottom: bottomPadding }}
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
                    <ThemedText
                      className="text-gray-400 mt-1"
                      numberOfLines={2}
                    >
                      {item.description}
                    </ThemedText>
                  ) : null}
                </Pressable>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
