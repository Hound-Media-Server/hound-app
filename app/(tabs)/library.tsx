import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHoundLibrary } from "@/services/collectionService";
import CollectionView from "@/components/CollectionView";
import { MediaType } from "@/constants/MediaTypes";

const useLibrary = (mediaType?: MediaType, limit?: number, offset?: number) =>
  useHoundLibrary(mediaType, undefined, limit, offset);

export default function Library() {
  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={["top", "left", "right", "bottom"]}
    >
      <CollectionView useCollection={useLibrary} header="In Hound" />
    </SafeAreaView>
  );
}
