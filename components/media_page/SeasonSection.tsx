import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
  TVFocusGuideView,
} from "react-native";
import { Image } from "expo-image";
import React, { useRef, useEffect, useState } from "react";
import { ThemedText } from "../ThemedText";
import { useSeasonDetails } from "@/services/mediaDetailsService";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import {
  useShowWatchData,
  useShowWatchProgress,
  WatchProgress,
} from "@/services/watchDataService";
import { router } from "expo-router";
import { getSelectStreamUrl } from "@/utils/navigation";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const isTV = Platform.isTV;

export default function SeasonSection({
  sourceID,
  seasons,
  defaultSeason,
  mediaTitle,
}: {
  sourceID: string;
  seasons: any;
  defaultSeason: number;
  mediaTitle?: string;
}) {
  const [selectedSeasonNum, setSelectedSeasonNum] =
    React.useState(defaultSeason);
  const {
    data: seasonDetails,
    isLoading,
    error,
  } = useSeasonDetails(sourceID, selectedSeasonNum);
  const { data: watchedEpisodeData } = useShowWatchData(
    sourceID,
    selectedSeasonNum,
  );
  const { data: watchProgress } = useShowWatchProgress(
    sourceID,
    selectedSeasonNum,
  );
  const [focusedEpisode, setFocusedEpisode] = useState<any | null>(null);
  const [focusedWatchedAt, setFocusedWatchedAt] = useState<string | null>(null);
  const seasonsListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (seasons && seasons.length > 0) {
      const index = seasons.findIndex(
        (s: any) => s.season_number === defaultSeason,
      );
      if (index !== -1) {
        seasonsListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.25,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!focusedEpisode && seasonDetails?.episodes?.[0]) {
      setFocusedEpisode(seasonDetails?.episodes?.[0]);
    }
  }, [seasonDetails]);

  if (error) {
    return (
      <ThemedText className="pt-2 text-white">
        Error grabbing season data.
      </ThemedText>
    );
  }
  return wrapTVFocusGuideView(
    <>
      <View>
        <View className="mb-5 -mx-5">
          {wrapTVFocusGuideView(
            <FlatList
              data={seasons}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              renderItem={({ item }: { item: any }) => (
                <TouchableOpacity
                  focusable
                  onPress={() => setSelectedSeasonNum(item.season_number)}
                  onFocus={() =>
                    isTV && setSelectedSeasonNum(item.season_number)
                  }
                  className={
                    "items-center justify-center rounded-xl p-2" +
                    (item?.season_number === selectedSeasonNum
                      ? isTV
                        ? " bg-secondary/50"
                        : " bg-secondary"
                      : isTV
                        ? " bg-gray-600"
                        : " bg-gray-400") +
                    (isTV ? " h-[40px] w-[100px] focus:bg-secondary" : "")
                  }
                  activeOpacity={isTV ? 1 : 0.75}
                >
                  {
                    <ThemedText
                      className={"text-primary" + (isTV ? " text-lg" : "")}
                    >
                      {item.season_number === 0
                        ? "Specials"
                        : "Season " + item.season_number}
                    </ThemedText>
                  }
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.source_id}
              ref={seasonsListRef}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  seasonsListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: false,
                    viewPosition: 0.5,
                  });
                }, 100);
              }}
            />,
          )}
        </View>
        <View>
          {isLoading ? (
            <View className="h-[200px] justify-center items-center">
              <ActivityIndicator color="white" size="large" />
            </View>
          ) : (
            wrapTVFocusGuideView(
              <EpisodeSection
                seasonDetails={seasonDetails}
                watchedEpisodeData={watchedEpisodeData}
                watchProgress={watchProgress}
                sourceID={sourceID}
                mediaTitle={mediaTitle}
                focusedEpisode={focusedEpisode}
                focusedWatchedAt={focusedWatchedAt}
                setFocusedEpisode={setFocusedEpisode}
                setFocusedWatchedAt={setFocusedWatchedAt}
              />,
            )
          )}
        </View>
      </View>
    </>,
  );
}

function EpisodeSection({
  seasonDetails,
  watchedEpisodeData,
  watchProgress,
  sourceID,
  mediaTitle,
  focusedEpisode,
  focusedWatchedAt,
  setFocusedEpisode,
  setFocusedWatchedAt,
}: {
  seasonDetails: any;
  watchedEpisodeData: any;
  watchProgress: any;
  sourceID: string;
  mediaTitle?: string;
  focusedEpisode: any;
  focusedWatchedAt: string | null;
  setFocusedEpisode: (episode: any) => void;
  setFocusedWatchedAt: (watchedAt: string | null) => void;
}) {
  const flashlistRef = useRef<FlashListRef<any>>(null);
  const flatlistRef = useRef<FlatList<any>>(null);

  // flashlist nagivation seems  less smooth on react-native-tvos (?), so we default to flatlist for now
  // performance will suffer on larger lists, need to find a better solution, probably
  // pagination since it's not good UX to have to scroll through too many episodes anyway
  return (
    <View focusable className={isTV ? "opacity-50 focus:opacity-100" : ""}>
      {seasonDetails?.episodes.length <= 50 ? (
        <FlatList
          ref={flatlistRef}
          data={seasonDetails?.episodes}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          horizontal={isTV}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <EpisodeCard
              index={index}
              episode={item}
              watchedAt={watchedEpisodeData?.get(item.source_id) || null}
              watchProgress={watchProgress?.get(item.source_id) || null}
              sourceID={sourceID}
              mediaTitle={mediaTitle}
              focusedEpisode={focusedEpisode}
              setFocusedEpisode={setFocusedEpisode}
              setFocusedWatchedAt={setFocusedWatchedAt}
              episodeListRef={flatlistRef}
              animateScroll={false}
            />
          )}
          keyExtractor={(item) => item.source_id}
        />
      ) : (
        <FlashList
          ref={flashlistRef}
          data={seasonDetails?.episodes}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          horizontal={isTV}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <EpisodeCard
              index={index}
              episode={item}
              watchedAt={watchedEpisodeData?.get(item.source_id) || null}
              watchProgress={watchProgress?.get(item.source_id) || null}
              sourceID={sourceID}
              mediaTitle={mediaTitle}
              focusedEpisode={focusedEpisode}
              setFocusedEpisode={setFocusedEpisode}
              setFocusedWatchedAt={setFocusedWatchedAt}
              episodeListRef={flashlistRef}
              animateScroll={true}
            />
          )}
          keyExtractor={(item) => item.source_id}
        />
      )}

      {isTV && (
        <View className="h-[80px] mt-3">
          <EpisodeInfo episode={focusedEpisode} watchedAt={focusedWatchedAt} />
        </View>
      )}
    </View>
  );
}

function EpisodeCard({
  index,
  episode,
  watchedAt,
  watchProgress,
  sourceID,
  mediaTitle,
  focusedEpisode,
  setFocusedEpisode,
  setFocusedWatchedAt,
  episodeListRef,
  animateScroll,
}: {
  index: number;
  episode: any;
  watchedAt: string | null;
  watchProgress: WatchProgress | null;
  sourceID: string;
  mediaTitle?: string;
  focusedEpisode: any;
  setFocusedEpisode: (episode: any) => void;
  setFocusedWatchedAt: (watchedAt: string | null) => void;
  episodeListRef:
    | React.RefObject<FlashListRef<any> | null>
    | React.RefObject<FlatList<any> | null>;
  animateScroll: boolean;
}) {
  var info: string[] = [];
  if (episode?.duration) {
    info.push(episode.duration + " m");
  }
  if (episode?.release_date) {
    info.push(episode.release_date);
  }
  return (
    <View>
      <View className={"flex-row " + (isTV ? "" : "mb-3")}>
        <View className="relative rounded-md bg-black me-3">
          <TouchableOpacity
            className="border-2 border-transparent rounded-lg focus:border-white"
            activeOpacity={isTV ? 1 : 0.7}
            focusable
            hasTVPreferredFocus={index === 0}
            onFocus={() => {
              setFocusedEpisode(episode);
              setFocusedWatchedAt(watchedAt);
              episodeListRef?.current?.scrollToIndex({
                index: index,
                animated: animateScroll,
                viewPosition: 0.5,
              });
            }}
            onPress={async () => {
              router.navigate(
                await getSelectStreamUrl({
                  id: sourceID,
                  type: "tv",
                  season: episode.season_number,
                  episode: episode.episode_number,
                  startTime: watchProgress?.current_progress_seconds,
                  title: mediaTitle,
                }),
              );
            }}
          >
            {episode.thumbnail_uri ? (
              <Image
                className="md:w-[240px] md:h-[150px] sm:w-[160px] sm:h-[100px] rounded-md opacity-90"
                source={`${episode.thumbnail_uri.replace("w500", "w300")}`}
                contentFit="cover"
                transition={1000}
              />
            ) : (
              <View className="md:w-[240px] md:h-[150px] sm:w-[160px] sm:h-[100px] rounded-md bg-gray-800" />
            )}
            {watchProgress && (
              <>
                <View className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50 rounded-b-md overflow-hidden">
                  <View
                    className="h-full bg-secondary/80"
                    style={{
                      width: `${Math.min(
                        (watchProgress.current_progress_seconds /
                          watchProgress.total_duration_seconds) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </View>
                <View className="absolute bottom-2 right-1 bg-black/50 px-1.5 py-0.5 rounded-md">
                  <ThemedText className="text-white text-xs">
                    {Math.ceil(
                      (watchProgress.total_duration_seconds -
                        watchProgress.current_progress_seconds) /
                        60,
                    )}
                    m left
                  </ThemedText>
                </View>
              </>
            )}
            {watchedAt && (
              <View className="absolute top-1 left-1 items-center justify-center">
                <View className="absolute w-4 h-4 bg-black/40 rounded-full" />
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color="yellow"
                  className="opacity-75"
                />
              </View>
            )}
            <View className="absolute inset-0 flex items-center justify-center rounded-md">
              <Ionicons
                name="play"
                size={38}
                color="white"
                className="opacity-65"
              />
            </View>
          </TouchableOpacity>
        </View>
        {!isTV && (
          <View className="flex-1 justify-center">
            <EpisodeInfo episode={episode} watchedAt={watchedAt} />
          </View>
        )}
      </View>
      {!isTV && (
        <ThemedText className="text-gray-400 mb-4 text-sm">
          {episode?.overview}
        </ThemedText>
      )}
    </View>
  );
}

function EpisodeInfo({
  episode,
  watchedAt,
}: {
  episode: any;
  watchedAt: string | null;
}) {
  if (!episode) {
    return <></>;
  }
  var info: string[] = [];
  if (episode?.duration) {
    info.push(episode.duration + " m");
  }
  if (episode?.release_date) {
    info.push(episode.release_date);
  }
  return (
    <View>
      <ThemedText>
        <ThemedText className="text-secondary text-lg md:text-2xl">
          {episode?.episode_number + " • "}
        </ThemedText>
        <ThemedText className="text-white text-lg md:text-2xl">
          {episode?.media_title}
        </ThemedText>
      </ThemedText>
      <ThemedText className="text-gray-300 text-base md:text-xl">
        {info.join(" ⸱ ")}
      </ThemedText>
      {watchedAt ? (
        <ThemedText className="text-secondary opacity-85 text-base md:text-xl">
          {"Last watched " + watchedAt}
        </ThemedText>
      ) : null}
      {isTV && (
        <ThemedText className="text-gray-400 mb-4 text-base md:text-xl">
          {episode?.overview}
        </ThemedText>
      )}
    </View>
  );
}

function wrapTVFocusGuideView(children: React.ReactNode) {
  if (!Platform.isTV) return children;
  return <TVFocusGuideView autoFocus>{children}</TVFocusGuideView>;
}
