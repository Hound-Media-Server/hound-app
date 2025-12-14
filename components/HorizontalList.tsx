import { View, Text, FlatList } from "react-native";
import React from "react";
import PosterCard from "./PosterCard";

interface HorizontalListProps {
  useQuery?: () => any;
  title?: string;
  itemData?: any;
  showDescription?: boolean;
}

export default function HorizontalList({
  useQuery,
  title,
  itemData,
  showDescription,
}: HorizontalListProps) {
  let data = itemData;
  if (!data && useQuery) {
    const { data: queryData, isLoading, error } = useQuery();
    if (isLoading) {
      return <Text className="text-white bg-black">Loading {title}...</Text>;
    }
    if (error) {
      return (
        <Text className="text-white bg-black">
          Error fetching {title}: {error.message}
        </Text>
      );
    }
    data = queryData;
  }
  return (
    <>
      {title && <Text className="text-white text-2xl mb-3">{title}</Text>}
      <FlatList
        keyExtractor={(item) => {
          if (item.media_source && item.source_id) {
            return item.media_source + item.source_id;
          }
          return item.credit_id;
        }}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={(item) => (
          <PosterCard item={item.item} showDescription={showDescription} />
        )}
      />
    </>
  );
}
