import {
  View,
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
} from "react-native";
import React, { useRef } from "react";
import PosterCard from "./PosterCard";
import { ThemedText } from "./ThemedText";
import ContinueWatchingCard from "./ContinueWatchingCard";
import { TVFocusGuideView } from "react-native";
import { FocusItem, useFocusStore } from "@/stores/focusStore";

interface HorizontalListProps {
  useQuery?: () => any;
  itemType?: string;
  isLoading?: boolean;
  header?: string;
  itemData?: any;
  showDescription?: boolean;
  rowIndex?: number;
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
  const setFocusedItem = useFocusStore((s) => s.setFocusedItem);
  const handleFocus = (index: number) => {
    if (!Platform.isTV) return;
    // vertical scroll in parent
    onRowFocus?.(rowIndex ?? 0);
    // scroll within row
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.15,
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
      <View className="me-5 flex-1">
        {!!header && (
          <ThemedText className="text-white text-2xl mb-3 ps-5">
            {header}
          </ThemedText>
        )}
        <View className="w-full h-[100px] justify-center items-center">
          <ActivityIndicator color="white" size="large" />
        </View>
      </View>
    );
  }
  // only wrap tv focus guide view if platform is tv
  // prevents errors on other platforms (web)
  return wrapTVFocusGuideView(
    <View>
      {!!header && data && (
        <ThemedText className="text-white text-2xl mb-3 ps-5">
          {header}
        </ThemedText>
      )}
      <View style={{ minHeight: 100 }}>
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
          renderItem={({ item, index }) => {
            if (itemType === "cast") {
              return (
                <PosterCard
                  item={item}
                  title={showDescription ? item.name : ""}
                  subtitle={showDescription ? item.character : ""}
                />
              );
            }
            if (itemType === "search") {
              return (
                <PosterCard
                  item={item}
                  title={getMediaTitle(item)}
                  imgAlt={getMediaTitle(item)}
                />
              );
            }
            if (itemType === "episode") {
              return (
                <ContinueWatchingCard
                  item={item}
                  onFocus={() => handleFocus(index)}
                  hasTVPreferredFocus={rowIndex === 0 && index === 0}
                />
              );
            }
            return (
              <PosterCard
                item={item}
                title={showDescription ? getMediaTitle(item) : ""}
                subtitle={""}
                imgAlt={getMediaTitle(item)}
                onFocus={() => {
                  const focusItem: FocusItem = {
                    media_type: item.media_type,
                    source_id: item.source_id,
                    media_title: item.media_title,
                    overview: item.overview,
                    backdrop_uri: item.backdrop_uri,
                    release_date: item.release_date,
                    status: item.status,
                    genres: item.genres,
                  };
                  setFocusedItem(focusItem);
                  handleFocus(index);
                }}
                hasTVPreferredFocus={rowIndex === 0 && index === 0}
              />
            );
          }}
        />
      </View>
    </View>,
  );
}

function wrapTVFocusGuideView(children: React.ReactNode) {
  if (!Platform.isTV) return children;
  return <TVFocusGuideView trapFocusRight>{children}</TVFocusGuideView>;
}

function getMediaTitle(item: any) {
  let title = item?.media_title;
  if (item?.release_date && item.release_date.length >= 4) {
    title += " (" + item.release_date.slice(0, 4) + ")";
  }
  return title;
}
