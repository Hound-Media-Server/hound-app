import { View, Text, FlatList } from "react-native";
import React from "react";
import PosterCard from "./PosterCard";

interface HorizontalListProps {
  useQuery: () => any;
  title: string;
}

export default function HorizontalList({
  useQuery,
  title,
}: HorizontalListProps) {
  const { data, isLoading, error } = useQuery();
  if (isLoading) {
    return <Text className="text-white">Loading {title}...</Text>;
  }
  if (error) {
    return (
      <Text className="text-white">
        Error fetching {title}: {error.message}
      </Text>
    );
  }
  return (
    <>
      <Text className="text-white text-2xl mb-3">{title}</Text>
      <FlatList
        keyExtractor={(item) => item.media_source + item.source_id}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={(item) => (
          <PosterCard item={item.item} />
          //   <Text className="text-white me-8">{item.media_title}</Text>
        )}
      />
    </>
  );
}
