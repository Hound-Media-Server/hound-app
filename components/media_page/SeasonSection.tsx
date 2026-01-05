import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useRef, useEffect } from "react";
import { ThemedText } from "../ThemedText";
import { useSeasonDetails } from "@/services/mediaDetailsService";
import { FlashList } from "@shopify/flash-list";
import {
  useShowWatchData,
  useShowWatchProgress,
  WatchProgress,
} from "@/services/watchDataService";
import { Ionicons } from "@expo/vector-icons";

export default function SeasonSection({
  tmdbID,
  seasons,
  defaultSeason,
  setSelectStreamModalVisible,
  setStreamSeasonNum,
  setStreamEpisodeNum,
}: {
  tmdbID: string;
  seasons: any;
  defaultSeason: number;
  setSelectStreamModalVisible: (visible: boolean) => void;
  setStreamSeasonNum: (num: number | undefined) => void;
  setStreamEpisodeNum: (num: number | undefined) => void;
}) {
  const [selectedSeasonNum, setSelectedSeasonNum] =
    React.useState(defaultSeason);
  const [episodeListHeight, setEpisodeListHeight] = React.useState<
    number | null
  >(null);
  const {
    data: seasonDetails,
    isLoading,
    error,
  } = useSeasonDetails(tmdbID, selectedSeasonNum);
  const { data: watchedEpisodeData } = useShowWatchData(
    tmdbID,
    selectedSeasonNum
  );
  const { data: watchProgress } = useShowWatchProgress(
    tmdbID,
    selectedSeasonNum
  );
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const index = seasons.findIndex(
        (s: any) => s.season_number === defaultSeason
      );
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.25,
        });
      }
    }
  }, []);

  if (error) {
    return (
      <ThemedText className="pt-2 text-white">
        Error grabbing season data.
      </ThemedText>
    );
  }
  return (
    <>
      <View>
        <View className="mb-5 -mx-5">
          <FlatList
            data={seasons}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }: { item: any }) => (
              <TouchableOpacity
                onPress={() => setSelectedSeasonNum(item.season_number)}
                className={
                  "rounded-xl p-2 opacity-85 " +
                  (item?.season_number === selectedSeasonNum
                    ? "bg-secondary"
                    : "bg-gray-200")
                }
                activeOpacity={0.75}
              >
                {
                  <ThemedText className="text-primary">
                    {item.season_number === 0
                      ? "Specials"
                      : "Season " + item.season_number}
                  </ThemedText>
                }
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            ref={flatListRef}
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
        <View
          style={{ minHeight: episodeListHeight ?? undefined }}
          onLayout={(e) => {
            if (!episodeListHeight) {
              setEpisodeListHeight(e.nativeEvent.layout.height);
            }
          }}
        >
          <FlashList
            data={seasonDetails?.season?.episodes}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: any }) => (
              <EpisodeCard
                episode={item}
                watchedAt={watchedEpisodeData?.get(item.id) || null}
                watchProgress={watchProgress?.get(item.id.toString()) || null}
                setSelectStreamModalVisible={setSelectStreamModalVisible}
                setStreamSeasonNum={setStreamSeasonNum}
                setStreamEpisodeNum={setStreamEpisodeNum}
              />
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              isLoading ? (
                <View className="h-[200px] justify-center items-center">
                  <ActivityIndicator color="white" size="large" />
                </View>
              ) : (
                <></>
              )
            }
          />
        </View>
      </View>
    </>
  );
}

function EpisodeCard({
  episode,
  watchedAt,
  watchProgress,
  setSelectStreamModalVisible,
  setStreamSeasonNum,
  setStreamEpisodeNum,
}: {
  episode: any;
  watchedAt: string | null;
  watchProgress: WatchProgress | null;
  setSelectStreamModalVisible: (visible: boolean) => void;
  setStreamSeasonNum: (seasonNumber: number | undefined) => void;
  setStreamEpisodeNum: (episodeNumber: number | undefined) => void;
}) {
  var info: string[] = [];
  if (episode.runtime) {
    info.push(episode.runtime + " m");
  }
  if (episode.air_date) {
    info.push(episode.air_date);
  }
  return (
    <>
      <View className="flex-row mb-3">
        <View className="relative rounded-md bg-black me-3">
          <TouchableOpacity
            onPress={() => {
              setStreamSeasonNum(episode.season_number);
              setStreamEpisodeNum(episode.episode_number);
              setSelectStreamModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Image
              className="w-[140px] h-[105px] rounded-md sm:w-[160px] sm:h-[120px] opacity-90"
              source={{
                uri: episode.still_path,
              }}
              resizeMode="cover"
            />
            <View className="absolute inset-0 flex items-center justify-center rounded-md">
              <Ionicons
                name="play"
                size={38}
                color="white"
                style={{ opacity: 0.65 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center">
          <ThemedText>
            <ThemedText className="text-secondary">
              {episode.episode_number + " • "}
            </ThemedText>
            <ThemedText className="text-white text-base">
              {episode.name}
            </ThemedText>
          </ThemedText>
          <ThemedText className="text-gray-400 sm:text-sm">
            {info.join(" ⸱ ")}
          </ThemedText>
          {watchProgress ? (
            <ThemedText className="text-secondary opacity-85 text-sm">
              {Math.ceil(
                (watchProgress.total_duration_seconds -
                  watchProgress.current_progress_seconds) /
                  60
              ) + "m left"}
            </ThemedText>
          ) : watchedAt ? (
            <ThemedText className="text-gray-200 text-sm opacity-85">
              {"Last watched " + watchedAt}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <ThemedText className="text-gray-400 mb-4 text-sm">
        {episode.overview}
      </ThemedText>
    </>
  );
}
