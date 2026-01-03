import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import PosterCard from "./PosterCard";
import { ThemedText } from "./ThemedText";
import { FlashList } from "@shopify/flash-list";

interface HorizontalListProps {
  useQuery?: () => any;
  itemType?: string;
  header?: string;
  itemData?: any;
  showDescription?: boolean;
}

export default function HorizontalList({
  useQuery,
  itemType,
  header,
  itemData,
  showDescription,
}: HorizontalListProps) {
  let data = itemData;
  if (!data && useQuery) {
    const { data: queryData, isLoading, error } = useQuery();
    if (isLoading) {
      return (
        <View className="me-5">
          {header && (
            <ThemedText className="text-white text-2xl mb-3">
              {header}
            </ThemedText>
          )}
          <View className="w-full h-[100px] justify-center items-center">
            <ActivityIndicator color="white" size="large" />
          </View>
        </View>
      );
    }
    if (error) {
      return (
        <ThemedText className="text-white bg-black">
          Error fetching {header}: {error.message}
        </ThemedText>
      );
    }
    data = queryData;
  }
  return (
    <>
      {header && (
        <ThemedText className="text-white text-2xl mb-3 ps-5">
          {header}
        </ThemedText>
      )}
      <FlashList
        keyExtractor={(item: any) => {
          if (item.media_source && item.source_id) {
            return item.media_source + item.source_id;
          }
          return item.credit_id;
        }}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
        renderItem={(item) => {
          if (itemType === "cast") {
            return (
              <PosterCard
                item={item.item}
                title={showDescription ? item.item.name : ""}
                subtitle={showDescription ? item.item.character : ""}
              />
            );
          }
          return (
            <PosterCard
              item={item.item}
              title={showDescription ? item.item.media_title : ""}
              subtitle={""}
            />
          );
        }}
      />
    </>
  );
}
