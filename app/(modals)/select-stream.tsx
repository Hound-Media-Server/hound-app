import {
  View,
  Pressable,
  FlatList,
  TouchableHighlight,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMediaFiles, useProviders } from "@/services/providerService";
import React, { useRef, useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { getStreamUrl } from "@/utils/navigation";
import { MediaTypeMovie, MediaTypeTVShow } from "@/constants/MediaTypes";

export default function SelectStreamScreen() {
  const { id, mediaType, season, episode, startTime, modalTitle } =
    useLocalSearchParams<{
      id: string;
      mediaType: string;
      season?: string;
      episode?: string;
      startTime?: string;
      modalTitle?: string;
    }>();

  const flatListRef = useRef<FlatList>(null);

  const seasonNumber = season ? parseInt(season) : undefined;
  const episodeNumber = episode ? parseInt(episode) : undefined;
  const startTimeNum = startTime ? parseInt(startTime) : undefined;

  const { data: mediaFilesData, isLoading: isMediaFilesLoading } =
    useMediaFiles(
      mediaType as string,
      id as string,
      seasonNumber,
      episodeNumber,
    );

  const { data: providersData, isLoading: isProvidersLoading } = useProviders(
    mediaType as string,
    id as string,
    seasonNumber,
    episodeNumber,
  );

  const streams = useMemo(() => {
    const mediaFilesProvidersList =
      (mediaFilesData as any)?.data?.providers || [];
    const externalProvidersList = (providersData as any)?.data?.providers || [];

    const mediaFilesStreams = mediaFilesProvidersList.flatMap(
      (p: any) => p.streams || [],
    );
    const externalStreams = externalProvidersList.flatMap(
      (p: any) => p.streams || [],
    );
    return [...mediaFilesStreams, ...externalStreams];
  }, [mediaFilesData, providersData]);

  const isLoading = isMediaFilesLoading || isProvidersLoading;

  if (mediaType !== MediaTypeMovie && mediaType !== MediaTypeTVShow) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ThemedText className="text-white">Invalid media type</ThemedText>
      </View>
    );
  }

  let displayTitle = modalTitle;
  if (seasonNumber && episodeNumber) {
    displayTitle += ` S${seasonNumber}E${episodeNumber}`;
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "header") {
      return (
        <View className="ml-2 mb-2 mt-2">
          <ThemedText className="text-white text-lg">{item?.title}</ThemedText>
        </View>
      );
    }
    return (
      <TouchableHighlight
        focusable
        hasTVPreferredFocus={index === 0}
        key={item.provider + "-" + item.info_hash}
        underlayColor="#1e293b"
        activeOpacity={Platform.isTV ? 1 : 0.7}
        className="rounded-lg mb-2 border-2 border-transparent focus:border-white"
        onPress={() => {
          router.replace(
            getStreamUrl(item.encoded_data, false, {
              id: id as string,
              mediaType: mediaType as string,
              season: seasonNumber,
              episode: episodeNumber,
              startTime: startTimeNum,
            }),
          );
        }}
        onFocus={() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.25,
          });
        }}
      >
        <View className="bg-slate-800 p-3 rounded-lg border border-slate-700">
          <ThemedText className="text-white text-[16px] mb-1">
            {item?.title}
          </ThemedText>
          <ThemedText className="text-gray-300 text-sm">
            {item?.description}
          </ThemedText>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <FlatList
        ref={flatListRef}
        data={streams}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === "header"
            ? `header-${item.title}`
            : `stream-${item.provider}-${item.info_hash}-${index}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View className="flex-row justify-between items-center mb-4 mt-6">
            <View>
              <ThemedText className="text-xl text-white">
                Select Stream
              </ThemedText>
              {displayTitle && (
                <ThemedText className="text-gray-400 text-sm">
                  {displayTitle}
                </ThemedText>
              )}
            </View>
            {!Platform.isTV && (
              <Pressable onPress={() => router.back()} className="p-1">
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <ThemedText className="text-white text-lg mt-10 text-center">
              No streams available
            </ThemedText>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator color="white" size="large" className="my-4" />
          ) : null
        }
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.25,
            });
          }, 100);
        }}
      />
    </View>
  );
}
