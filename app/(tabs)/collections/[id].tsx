import React, { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCollectionContents } from "@/services/collectionService";
import CollectionView from "@/components/CollectionView";
import { MediaType } from "@/constants/MediaTypes";
import { useQueryClient } from "@tanstack/react-query";

export default function Collection() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["collection-contents", id],
      });
    }, [id, queryClient]),
  );

  const useCollection = (
    mediaType?: MediaType,
    limit?: number,
    offset?: number,
  ) => useCollectionContents(id as string, limit, offset);

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={["top", "left", "right", "bottom"]}
    >
      <CollectionView useCollection={useCollection} header="" />
    </SafeAreaView>
  );
}
