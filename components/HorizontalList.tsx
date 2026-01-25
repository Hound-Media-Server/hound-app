import { View, ActivityIndicator, FlatList, Platform } from "react-native";
import React, { useRef } from "react";
import PosterCard from "./PosterCard";
import { ThemedText } from "./ThemedText";
import ContinueWatchingCard from "./ContinueWatchingCard";
import { TVFocusGuideView } from "react-native";

interface HorizontalListProps {
  useQuery?: () => any;
  itemType?: string;
  isLoading?: boolean;
  header?: string;
  itemData?: any;
  showDescription?: boolean;
  rowIndex: number;
  onRowFocus?: (rowIndex: number) => void;
}

export default function HorizontalList({
  useQuery,
  itemType,
  isLoading,
  header,
  itemData,
  showDescription,
  rowIndex,
  onRowFocus,
}: HorizontalListProps) {
  const flatListRef = useRef<FlatList<any> | null>(null);
  const handleFocus = (index: number) => {
    if (!Platform.isTV) return;
    // vertical scroll in parent
    onRowFocus?.(rowIndex);
    // scroll within row
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.25,
    });
  };

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
  // only wrap tv focus guide view if platform is tv
  return wrapTVFocusGuideView(
    <>
      {!!header && data && (
        <ThemedText className="text-white text-2xl mb-3 ps-5">
          {header}
        </ThemedText>
      )}
      <FlatList
        keyExtractor={(item: any) => {
          if (item.media_source && item.source_id) {
            return item.media_source + item.source_id;
          }
          return item.credit_id;
        }}
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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
              onFocus={() => handleFocus(item.index)}
            />
          );
        }}
      />
    </>,
  );
}

function wrapTVFocusGuideView(children: React.ReactNode) {
  if (!Platform.isTV) return children;
  return <TVFocusGuideView>{children}</TVFocusGuideView>;
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
