import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { ThemedText } from "../ThemedText";
import { useSeasonDetails } from "@/services/mediaDetailsService";
import SelectStreamModal from "../SelectStreamModal";
import { FlashList } from "@shopify/flash-list";

export default function SeasonSection({
  tmdbID,
  seasons,
  defaultSeason,
}: {
  tmdbID: string;
  seasons: any;
  defaultSeason: number;
}) {
  const [selectedSeasonNum, setSelectedSeasonNum] =
    React.useState(defaultSeason);
  const [streamSeasonNum, setStreamSeasonNum] = React.useState(0);
  const [streamEpisodeNum, setStreamEpisodeNum] = React.useState(0);
  const {
    data: seasonDetails,
    isLoading,
    error,
  } = useSeasonDetails(tmdbID, selectedSeasonNum);
  const [selectStreamModalVisible, setSelectStreamModalVisible] =
    React.useState(false);

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
        <FlashList
          data={seasons}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              onPress={() => setSelectedSeasonNum(item.season_number)}
              className={
                "me-3 rounded-xl p-2 opacity-85 " +
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
        />
        {!isLoading ? (
          <FlashList
            data={seasonDetails.season.episodes}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: any }) => (
              <EpisodeCard
                episode={item}
                setSelectStreamModalVisible={setSelectStreamModalVisible}
                setStreamSeasonNum={setStreamSeasonNum}
                setStreamEpisodeNum={setStreamEpisodeNum}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View className="h-[500px] justify-center items-center">
            <ActivityIndicator color="white" size="large" />
          </View>
        )}
      </View>
      <SelectStreamModal
        id={tmdbID}
        mediaType="tv"
        modalVisible={selectStreamModalVisible}
        setModalVisible={setSelectStreamModalVisible}
        seasonNumber={streamSeasonNum}
        episodeNumber={streamEpisodeNum}
      />
    </>
  );
}

function EpisodeCard({
  episode,
  setSelectStreamModalVisible,
  setStreamSeasonNum,
  setStreamEpisodeNum,
}: {
  episode: any;
  setSelectStreamModalVisible: (visible: boolean) => void;
  setStreamSeasonNum: (seasonNumber: number) => void;
  setStreamEpisodeNum: (episodeNumber: number) => void;
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
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => {
            setStreamSeasonNum(episode.season_number);
            setStreamEpisodeNum(episode.episode_number);
            setSelectStreamModalVisible(true);
          }}
        >
          <Image
            className="w-[90px] h-[90px] me-3 rounded-md sm:w-[120px] sm:h-[120px] bg-gray-300"
            source={{
              uri: episode.still_path,
            }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View className="flex-1 justify-center">
          <ThemedText>
            <ThemedText className="text-secondary">
              {episode.episode_number + " • "}
            </ThemedText>
            <ThemedText className="text-white text-md sm:text-lg">
              {episode.name}
            </ThemedText>
          </ThemedText>
          <ThemedText className="text-gray-400 text-xs sm:text-sm">
            {info.join(" ⸱ ")}
          </ThemedText>
          <ThemedText
            className="text-gray-300 text-xs sm:text-sm"
            numberOfLines={3}
          >
            {episode.overview}
          </ThemedText>
        </View>
      </View>
    </>
  );
}
