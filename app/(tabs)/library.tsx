import React, { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHoundLibrary } from "@/services/collectionService";
import CollectionView from "@/components/CollectionView";
import { MediaType } from "@/constants/MediaTypes";
import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const useLibrary = (mediaType?: MediaType, limit?: number, offset?: number) =>
  useHoundLibrary(mediaType, undefined, limit, offset);

export default function Library() {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["collection-contents", "hound-library"],
      });
    }, [queryClient]),
  );

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={["top", "left", "right", "bottom"]}
    >
      <CollectionView useCollection={useLibrary} header="In Hound" />
    </SafeAreaView>
  );
}
