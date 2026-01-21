import {
  View,
  Pressable,
  ScrollView,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useMovieProviders,
  useShowProviders,
} from "@/services/providerService";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { getStreamUrl } from "@/utils/navigation";

export default function SelectStreamScreen() {
  const { id, type, season, episode, startTime, title } = useLocalSearchParams<{
    id: string;
    type: string;
    season?: string;
    episode?: string;
    startTime?: string;
    title?: string;
  }>();

  const seasonNumber = season ? parseInt(season) : undefined;
  const episodeNumber = episode ? parseInt(episode) : undefined;
  const startTimeNum = startTime ? parseInt(startTime) : undefined;

  if (type !== "movie" && type !== "tv") {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ThemedText className="text-white">Invalid media type</ThemedText>
      </View>
    );
  }

  const {
    data: providers,
    isLoading,
    error,
  } = type === "movie"
    ? useMovieProviders(id as string, true)
    : useShowProviders(id as string, true, seasonNumber, episodeNumber);
  if (error) {
    Alert.alert("Error", error.message);
    router.back();
  }
  let displayTitle = title;
  if (seasonNumber && episodeNumber) {
    displayTitle += ` S${seasonNumber}E${episodeNumber}`;
  }
  return (
    <View className="flex-1 bg-primary">
      <ScrollView className="p-5 opacity-95">
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
          <Pressable onPress={() => router.back()} className="p-1">
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="white" size="large" className="mt-10" />
        ) : (
          <View>
            {providers?.providers?.some(
              (p: any) => p.streams && p.streams.length > 0
            ) ? (
              providers.providers.map((provider: any) => (
                <View key={provider.provider} className="mb-4">
                  <ThemedText className="text-white mb-2 text-lg">
                    {provider.provider}
                  </ThemedText>
                  {provider.streams?.map((stream: any) => (
                    <TouchableHighlight
                      key={stream.info_hash}
                      underlayColor="#1e293b"
                      className="rounded-lg mb-2"
                      onPress={() => {
                        router.replace(
                          getStreamUrl(stream.encoded_data, {
                            id: id as string,
                            type: type as string,
                            season: seasonNumber,
                            episode: episodeNumber,
                            startTime: startTimeNum,
                            title: title,
                          })
                        );
                      }}
                    >
                      <View className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <ThemedText className="text-white text-[16px] mb-1">
                          {stream.title}
                        </ThemedText>
                        <ThemedText className="text-gray-300 text-sm">
                          {stream.description}
                        </ThemedText>
                      </View>
                    </TouchableHighlight>
                  ))}
                </View>
              ))
            ) : (
              <ThemedText className="text-white text-lg mt-10 text-center">
                No streams available
              </ThemedText>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
