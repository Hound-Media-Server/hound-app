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
import { LinearGradient } from "expo-linear-gradient";

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
  autoFocus?: boolean;
  renderHeader?: () => React.ReactNode;
  cardWidth?: number;
  horizontalGap?: number;
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
  autoFocus = false,
  renderHeader,
  cardWidth = 120,
  horizontalGap = 15,
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

  const totalGridWidth =
    numColumns * cardWidth + (numColumns - 1) * horizontalGap;

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator color="white" size="large" />
        </View>
      );
    }
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-5 py-20">
          <ThemedText className="text-white text-center">
            Error: {error.message}
          </ThemedText>
        </View>
      );
    }
    if (data && data.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-5 py-20">
          <ThemedText className="text-gray-400">No items found</ThemedText>
        </View>
      );
    }
    return null;
  };

  return wrapTVFocusGuideView(
    <View className="flex-1">
      {(header || renderHeader) && (
        <LinearGradient
          colors={["#000000", "#000000", "transparent"]}
          locations={[0, 0.83, 1]}
          className="pb-5"
          style={{
            width: totalGridWidth,
            alignSelf: "center",
            zIndex: 10,
          }}
        >
          {header && (
            <ThemedText className="text-white text-2xl ps-2 mb-3">
              {header}
            </ThemedText>
          )}
          {renderHeader && renderHeader()}
        </LinearGradient>
      )}
      <FlatList
        style={{ marginTop: -40 }}
        ref={flatListRef}
        data={data}
        numColumns={numColumns}
        key={numColumns} // needed to force re-render on orientation change
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) =>
          item.media_type + "-" + item.media_source + "-" + item.source_id
        }
        contentContainerStyle={{
          paddingBottom: 140,
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
        ListHeaderComponent={<View className="mt-10" />}
        ListEmptyComponent={renderEmptyComponent}
        renderItem={({ item, index }) => (
          <View style={{ width: cardWidth }}>
            <MediaItemCard
              mediaItem={item}
              title={getMediaTitle(item)}
              showDescription={true}
              onFocus={() => handleFocus(index)}
              hasTVPreferredFocus={autoFocus && index === 0}
              width={cardWidth}
            />
          </View>
        )}
      />
    </View>,
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
