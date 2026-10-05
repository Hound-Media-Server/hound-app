import { useTVScale } from "@/hooks/useTVScale";
import {
  View,
  ActivityIndicator,
  FlatList,
  Platform,
  Text,
  useWindowDimensions,
} from "react-native";
import React, { useRef } from "react";
import MediaItemCard, { MediaItemCardPlaceholder } from "./MediaItemCard";
import { ThemedText } from "./ThemedText";
import ContinueWatchingCard, {
  ContinueWatchingCardPlaceholder,
} from "./ContinueWatchingCard";
import { TVFocusGuideView } from "react-native";
import { FocusItem, useFocusStore } from "@/stores/focusStore";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchMediaDetails } from "@/services/mediaDetailsService";

interface HorizontalListProps {
  useQuery?: () => any;
  itemType?: string;
  isLoading?: boolean;
  header?: string;
  itemData?: any;
  showDescription?: boolean;
  rowIndex?: number;
  onRowFocus?: (rowIndex: number) => void;
  hasPreferredFocus?: boolean;
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
  hasPreferredFocus,
}: HorizontalListProps) {
  const scale = useTVScale();
  const horizontalPadding = Platform.isTV ? 40 * scale : 20;
  const flatListRef = useRef<FlatList<any> | null>(null);
  const queryClient = useQueryClient();
  const setFocusedItem = useFocusStore((s) => s.setFocusedItem);
  const handleFocus = (index: number) => {
    if (!Platform.isTV) return;
    if (itemType !== "search") {
      prefetchMediaDetails(queryClient, data?.[index + 1]);
    }
    // vertical scroll in parent
    onRowFocus?.(rowIndex ?? 0);
    // scroll within row
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0,
      viewOffset: horizontalPadding,
    });
  };
  const { width: winWidth } = useWindowDimensions();
  let posterWidth = Platform.isTV ? 120 * scale : winWidth / 4;
  if (!Platform.isTV) {
    posterWidth = Math.min(Math.max(posterWidth, 120), 150);
  }
  let landscapeWidth = Platform.isTV ? 200 * scale : posterWidth * 2;
  if (!Platform.isTV) {
    landscapeWidth = Math.max(landscapeWidth, 200);
  }

  let data = itemData;
  if (!data && useQuery) {
    const { data: queryData, isLoading: queryLoading, error } = useQuery();
    if (error) {
      return (
        <View className="me-5 md:me-10 flex-1">
          {!!header && (
            <ThemedText className="text-white text-2xl mb-3">
              {header}
            </ThemedText>
          )}
          <View className="w-full h-list-min-height justify-center items-center">
            <ThemedText className="text-white bg-black">
              Error fetching {header}: {error.message}
            </ThemedText>
          </View>
        </View>
      );
    }
    isLoading = queryLoading || isLoading;
    data = queryData;
  }

  if (isLoading) {
    return (
      <View className="flex-1" style={{ paddingHorizontal: horizontalPadding }}>
        {!!header && (
          <ThemedText className="text-white text-2xl mb-3">{header}</ThemedText>
        )}
        <View className="flex-row gap-list-gap">
          {[...Array(7)].map((_, index) =>
            itemType === "episode" ? (
              <ContinueWatchingCardPlaceholder
                key={index}
                width={landscapeWidth}
              />
            ) : (
              <MediaItemCardPlaceholder key={index} width={posterWidth} />
            ),
          )}
        </View>
      </View>
    );
  }

  if (!data?.length) {
    return null;
  }

  // only wrap tv focus guide view if platform is tv
  // prevents errors on other platforms (web)
  return wrapTVFocusGuideView(
    <View>
      <View className="min-h-list-min-height">
        {!!header && data && (
          <ThemedText
            className="text-white text-2xl mb-3"
            style={{ paddingHorizontal: horizontalPadding }}
          >
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
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
          }}
          ItemSeparatorComponent={() => <View className="w-list-gap" />}
          renderItem={({ item, index }) => {
            if (itemType === "cast") {
              return (
                <MediaItemCard
                  mediaItem={item}
                  title={item.name}
                  subtitle={item.character}
                  showDescription={showDescription}
                  width={posterWidth}
                />
              );
            }
            if (itemType === "search") {
              return (
                <MediaItemCard
                  mediaItem={item}
                  title={getMediaTitle(item)}
                  imgAlt={getMediaTitle(item)}
                  showDescription={showDescription}
                  onFocus={() => handleFocus(index)}
                  hasTVPreferredFocus={hasPreferredFocus && index === 0}
                  width={posterWidth}
                />
              );
            }
            if (itemType === "episode") {
              return (
                <ContinueWatchingCard
                  item={item}
                  onFocus={() => handleFocus(index)}
                  hasTVPreferredFocus={hasPreferredFocus && index === 0}
                  rowIndex={rowIndex}
                  width={landscapeWidth}
                />
              );
            }
            return (
              <MediaItemCard
                mediaItem={item}
                title={getMediaTitle(item)}
                subtitle={""}
                imgAlt={getMediaTitle(item)}
                showDescription={showDescription}
                onFocus={() => {
                  const focusItem: FocusItem = {
                    media_type: item.media_type,
                    media_source: item.media_source,
                    source_id: item.source_id,
                    media_title: item.media_title,
                    logo_uri: item.logo_uri,
                    overview: item.overview,
                    backdrop_uri: item.backdrop_uri,
                    release_date: item.release_date,
                    status: item.status,
                    duration: item.duration,
                    genres: item.genres,
                  };
                  setFocusedItem(focusItem);
                  handleFocus(index);
                }}
                hasTVPreferredFocus={hasPreferredFocus && index === 0}
                width={posterWidth}
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
  return (
    <TVFocusGuideView autoFocus trapFocusRight>
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
