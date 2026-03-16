import {
  View,
  Platform,
  Pressable,
  Animated,
  TVFocusGuideView,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  MediaTypeMovie,
  MediaTypeTVShow,
  MediaType,
} from "@/constants/MediaTypes";
import PosterGrid from "@/components/PosterGrid";
import { ThemedText } from "@/components/ThemedText";

interface CollectionViewProps {
  useCollection: (
    mediaType?: MediaType,
    limit?: number,
    offset?: number,
  ) => any;
  header?: string;
  autoFocus?: boolean;
}

export default function CollectionView({
  useCollection,
  header,
  autoFocus = false,
}: CollectionViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [mediaType, setMediaType] = useState<MediaType | undefined>(undefined);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(Platform.isTV ? 0.4 : 1)).current;
  const buttonRefs = useRef<any[]>([]);

  useEffect(() => {
    if (!Platform.isTV) return;
    Animated.timing(fadeAnim, {
      toValue: focusedIndex === null ? 0.5 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [focusedIndex, fadeAnim]);

  const { width } = useWindowDimensions();

  let cardWidth = 120;
  const horizontalGap = 15;
  let numColumns = 3;

  // for phones, fill width to screen
  if (width < 600) {
    numColumns = 3;
    cardWidth = (width - 40 - (numColumns - 1) * horizontalGap) / numColumns;
  } else {
    // for bigger devices, lock to 120
    const calculatedColumns = Math.floor(
      (width - 40) / (cardWidth + horizontalGap),
    );
    numColumns = Math.min(6, Math.max(3, calculatedColumns));
  }

  const limit = numColumns * 5;

  const { data, isLoading, isFetching, error } = useCollection(
    mediaType,
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
    <View className={"flex-1 " + (Platform.isTV ? "mt-20" : "mt-5")}>
      <PosterGrid
        header={
          header
            ? header
            : data?.collection?.collection_title
              ? "Collections  >  " + data?.collection?.collection_title
              : ""
        }
        renderHeader={() => {
          if (!header) return null;
          const buttons: { type: "all" | MediaType; active: boolean }[] = [
            { type: "all", active: mediaType === undefined },
            {
              type: MediaTypeMovie,
              active: mediaType === MediaTypeMovie,
            },
            { type: MediaTypeTVShow, active: mediaType === MediaTypeTVShow },
          ];

          const activeIdx = buttons.findIndex((b) => b.active);
          const selectedRef = buttonRefs.current[activeIdx] ?? null;

          const children = (
            <Animated.View
              className="flex-row gap-2 pt-2 pb-2"
              style={{ opacity: fadeAnim }}
            >
              {buttons.map((btn, idx) => (
                <MediaTypeFilterButton
                  key={btn.type}
                  ref={(ref) => {
                    buttonRefs.current[idx] = ref;
                  }}
                  type={btn.type}
                  isActive={btn.active}
                  onFocus={() => {
                    if (!Platform.isTV) return;
                    setFocusedIndex(idx);
                    if (btn.active) return;
                    setMediaType(
                      btn.type === "all" ? undefined : (btn.type as MediaType),
                    );
                    setOffset(0);
                    setItems([]);
                  }}
                  onBlur={() => {
                    if (!Platform.isTV) return;
                    if (focusedIndex === idx) setFocusedIndex(null);
                  }}
                  onPress={() => {
                    if (btn.active) return;
                    setMediaType(
                      btn.type === "all" ? undefined : (btn.type as MediaType),
                    );
                    setOffset(0);
                    setItems([]);
                  }}
                />
              ))}
            </Animated.View>
          );
          if (Platform.isTV) {
            return (
              <TVFocusGuideView
                autoFocus
                destinations={selectedRef ? [selectedRef] : undefined}
              >
                {children}
              </TVFocusGuideView>
            );
          }
          return children;
        }}
        itemData={items}
        isLoading={isLoading || isFetching}
        error={error}
        onEndReached={loadMore}
        numColumns={numColumns}
        cardWidth={cardWidth}
        horizontalGap={horizontalGap}
        autoFocus={autoFocus}
      />
    </View>
  );
}

const MediaTypeFilterButton = forwardRef(
  (
    {
      type,
      isActive,
      onFocus,
      onBlur,
      onPress,
    }: {
      type: "all" | MediaType;
      isActive: boolean;
      onFocus: () => void;
      onBlur?: () => void;
      onPress?: () => void;
    },
    ref: any,
  ) => {
    return (
      <Pressable
        className="group"
        onFocus={onFocus}
        onBlur={onBlur}
        onPress={onPress}
        ref={ref}
      >
        <View
          className={
            "rounded-full px-4 py-2 " +
            (isActive ? "bg-white" : "bg-white/10 group-focus:bg-white")
          }
        >
          <ThemedText
            className={
              isActive ? "text-black" : "text-white group-focus:text-black"
            }
          >
            {type === "all"
              ? "All"
              : type === MediaTypeMovie
                ? "Movies"
                : "TV Shows"}
          </ThemedText>
        </View>
      </Pressable>
    );
  },
);
