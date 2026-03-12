import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useCollectionContents } from "@/services/collectionService";
import CollectionView from "@/components/CollectionView";
import { MediaType } from "@/constants/MediaTypes";

export default function CollectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const useCollection = (
    mediaType?: MediaType,
    limit?: number,
    offset?: number
  ) => useCollectionContents(id as string, limit, offset);

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={["top", "left", "right", "bottom"]}
    >
      <CollectionView useCollection={useCollection} header="Collection" />
    </SafeAreaView>
  );
}
