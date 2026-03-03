import {
  View,
  ActivityIndicator,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import React, { useRef } from "react";
import MediaItemCard from "./MediaItemCard";
import { ThemedText } from "./ThemedText";
import { TVFocusGuideView } from "react-native";

interface PosterGridProps {
  useQuery?: (limit?: number, offset?: number) => any;
  isLoading?: boolean;
  error?: any;
  header?: string;
  itemData?: any[];
  numColumns?: number;
  onEndReached?: () => void;
  limit?: number;
  offset?: number;
}

export default function PosterGrid({
  useQuery,
  isLoading,
  error: propError,
  header,
  itemData,
  numColumns = 3,
  onEndReached,
  limit,
  offset,
}: PosterGridProps) {
  const flatListRef = useRef<FlatList<any> | null>(null);

  const handleFocus = (index: number) => {
    if (!Platform.isTV) return;
    const rowIndex = Math.floor(index / numColumns);
    flatListRef.current?.scrollToIndex({
      index: rowIndex,
      animated: true,
      viewPosition: 0.5,
    });
  };
  let data = itemData;
  let error: any = null;

  if (!data && useQuery) {
    const {
      data: queryData,
      isLoading: queryLoading,
      error: queryError,
    } = useQuery(limit, offset);
    error = queryError;
    isLoading = queryLoading || isLoading;
    data = queryData?.records;
  }

  error = propError || error;
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ThemedText className="text-white text-center">
          Error: {error.message}
        </ThemedText>
      </View>
    );
  }
  if (isLoading && (!data || data.length === 0)) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }
  if (!data || data.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ThemedText className="text-gray-400">No items found</ThemedText>
      </View>
    );
  }
  const cardWidth = 120;
  const horizontalGap = 15;
  const totalGridWidth =
    numColumns * cardWidth + (numColumns - 1) * horizontalGap;

  return wrapTVFocusGuideView(
    <FlatList
      ref={flatListRef}
      data={data}
      numColumns={numColumns}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!Platform.isTV}
      keyExtractor={(item: any) =>
        item.media_type + "-" + item.media_source + "-" + item.source_id
      }
      contentContainerStyle={{
        paddingBottom: 20,
        alignSelf: "center",
        width: totalGridWidth,
      }}
      columnWrapperStyle={{
        justifyContent: "flex-start",
        gap: horizontalGap,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item, index }) => (
        <View style={{ width: cardWidth }}>
          <MediaItemCard
            mediaItem={item}
            title={getMediaTitle(item)}
            showDescription={true}
            onFocus={() => handleFocus(index)}
            hasTVPreferredFocus={index === 0}
          />
        </View>
      )}
      ListHeaderComponent={
        header ? (
          <ThemedText className="text-white text-2xl mb-5 mt-5">
            {header}
          </ThemedText>
        ) : null
      }
    />,
  );
}

function wrapTVFocusGuideView(children: React.ReactNode) {
  if (!Platform.isTV) return children;
  return (
    <TVFocusGuideView trapFocusLeft trapFocusRight className="flex-1">
      {children}
    </TVFocusGuideView>
  );
}

function getMediaTitle(item: any) {
  let title = item?.media_title;
  if (item?.release_date && item.release_date.length >= 4) {
    title += " (" + item.release_date.slice(0, 4) + ")";
  }
  return title;
}
