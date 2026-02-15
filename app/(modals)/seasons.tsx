import { View, ActivityIndicator, Dimensions } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import SeasonSection from "@/components/media_page/SeasonSection";

export default function SeasonsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: showDetails, isLoading } = useShowDetails(id);
  const SCREEN_HEIGHT = Dimensions.get("window").height;

  if (isLoading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  const seasonsData =
    showDetails?.seasons?.[0]?.season_number === 0
      ? [...showDetails.seasons.slice(1), showDetails.seasons[0]]
      : showDetails?.seasons;
  return (
    <View
      className="flex-1 bg-primary p-5"
      style={{ paddingTop: SCREEN_HEIGHT / 5 }}
    >
      <SeasonSection
        sourceID={id}
        seasons={seasonsData}
        defaultSeason={seasonsData?.[0]?.season_number}
        mediaTitle={showDetails?.media_title}
      />
    </View>
  );
}
