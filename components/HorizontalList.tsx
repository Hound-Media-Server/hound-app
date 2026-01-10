import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import PosterCard from "./PosterCard";
import { ThemedText } from "./ThemedText";
import { FlashList } from "@shopify/flash-list";
import ContinueWatchingCard from "./ContinueWatchingCard";

interface HorizontalListProps {
  useQuery?: () => any;
  itemType?: string;
  isLoading?: boolean;
  header?: string;
  itemData?: any;
  showDescription?: boolean;
}

export default function HorizontalList({
  useQuery,
  itemType,
  isLoading,
  header,
  itemData,
  showDescription,
}: HorizontalListProps) {
  let data = itemData;
  if (!data && useQuery) {
    const { data: queryData, isLoading: queryLoading, error } = useQuery();
    if (error) {
      return (
        <ThemedText className="text-white bg-black">
          Error fetching {header}: {error.message}
        </ThemedText>
      );
    }
    isLoading = queryLoading || isLoading;
    data = queryData;
  }
  if (isLoading) {
    return (
      <View className="me-5">
        {!!header && (
          <ThemedText className="text-white text-2xl mb-3">{header}</ThemedText>
        )}
        <View className="w-full h-[100px] justify-center items-center">
          <ActivityIndicator color="white" size="large" />
        </View>
      </View>
    );
  }
  return (
    <>
      {!!header && (
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
          if (itemType === "search") {
            return (
              <PosterCard
                item={item.item}
                title={getMediaTitle(item.item)}
                imgAlt={getMediaTitle(item.item)}
              />
            );
          }
          if (itemType === "episode") {
            return <ContinueWatchingCard item={item.item} />;
          }
          return (
            <PosterCard
              item={item.item}
              title={showDescription ? getMediaTitle(item.item) : ""}
              subtitle={""}
              imgAlt={getMediaTitle(item.item)}
            />
          );
        }}
      />
    </>
  );
}

function getMediaTitle(item: any) {
  let title = item?.media_title;
  if (item?.release_date && item.release_date.length >= 4) {
    title += " (" + item.release_date.slice(0, 4) + ")";
  } else if (item?.first_air_date && item.first_air_date.length >= 4) {
    title += " (" + item.first_air_date.slice(0, 4) + ")";
  }
  return title;
}
