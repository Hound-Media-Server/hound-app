import { View, Platform, TouchableOpacity, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHoundLibrary } from "@/services/collectionService";
import PosterGrid from "@/components/PosterGrid";
import { ThemedText } from "@/components/ThemedText";

export default function Library() {
  const [items, setItems] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);

  const numColumns = Platform.isTV ? 6 : 3;
  const limit = numColumns * 5;

  const { data, isLoading, error } = useHoundLibrary(
    undefined,
    undefined,
    limit,
    offset,
  );

  useEffect(() => {
    if (data?.records) {
      if (offset === 0) {
        setItems(data.records);
      } else {
        setItems((prev) => {
          const newRecords = data.records.filter(
            (newRec: any) =>
              !prev.some(
                (oldRec: any) =>
                  String(oldRec.media_type) === String(newRec.media_type) &&
                  String(oldRec.media_source) === String(newRec.media_source) &&
                  String(oldRec.source_id) === String(newRec.source_id),
              ),
          );
          if (newRecords.length === 0) return prev;
          return [...prev, ...newRecords];
        });
      }
    }
  }, [data, offset]);

  const loadMore = () => {
    if (data && items.length < data.total_records && !isLoading) {
      setOffset((prev) => prev + limit);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "left", "right"]}>
      <View className="flex-1 mt-20">
        <View className="flex-row gap-2 pb-3 ml-10">
          <MediaTypeFilterButton type="all" />
          <MediaTypeFilterButton type="movie" />
          <MediaTypeFilterButton type="tvshow" />
        </View>
        <PosterGrid
          header="In Hound"
          itemData={items}
          isLoading={isLoading}
          error={error}
          onEndReached={loadMore}
          numColumns={numColumns}
        />
      </View>
    </SafeAreaView>
  );
}

function MediaTypeFilterButton({ type }: { type: "all" | "movie" | "tvshow" }) {
  return (
    <Pressable className="group">
      <View className="rounded-full px-4 py-2 bg-white/10 group-focus:bg-white">
        <ThemedText className="text-white group-focus:text-black">
          {type === "all" ? "All" : type === "movie" ? "Movies" : "TV Shows"}
        </ThemedText>
      </View>
    </Pressable>
  );
}
