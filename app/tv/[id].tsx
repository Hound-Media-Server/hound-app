import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useShowDetails } from "@/services/mediaDetailsService";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import SelectStreamModal from "@/components/SelectStreamModal";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import SeasonSection from "@/components/media_page/SeasonSection";

export default function TVDetails() {
  const [selectStreamModalVisible, setSelectStreamModalVisible] =
    React.useState(false);
  const { id } = useLocalSearchParams();
  // fetch show details
  const { data: details, isLoading, error } = useShowDetails(id as string);

  if (isLoading) {
    return (
      <View className="w-full h-full bg-primary justify-center items-center">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  const creators = details?.created_by
    ?.map((item: any) => item.name)
    .join(", ");
  return (
    <>
      <View className="flex-1 relative bg-primary">
        <ParallaxScrollView
          headerHeight={300}
          headerImage={
            <ImageBackground
              source={{ uri: details?.backdrop_url }}
              className="absolute w-full h-96"
              resizeMode="cover"
            />
          }
        >
          <View className="ms-5 me-5 sm:px-8 md:px-24">
            <TouchableOpacity
              onPress={() => setSelectStreamModalVisible(true)}
              activeOpacity={0.75}
              className="p-2 mb-3 bg-secondary rounded-2xl w-[70px] items-center sm:w-[80px] sm:rounded-3xl"
            >
              <ThemedText className="text-primary text-[14px] md:text-[18px]">
                ▶︎ Play
              </ThemedText>
            </TouchableOpacity>
            <View className="me-5">
              <ThemedText className="text-white text-3xl leading-[36px]">
                {details?.media_title}
                <ThemedText className="text-gray-400 text-2xl leading-[32px]">
                  {" (" + details?.first_air_date?.split("-")[0] + ")"}
                </ThemedText>
              </ThemedText>
              <ThemedText className="text-secondary mt-1 opacity-80 sm:text-lg">
                {details?.genres?.map((item: any) => item.name).join(", ")}
              </ThemedText>
              <ThemedText className="text-gray-400 mt-1 sm:text-lg">
                {creators}
              </ThemedText>
              <ThemedText className="text-gray-300 text-md sm:text-lg mt-1">
                {details?.overview}
              </ThemedText>
            </View>
            {details?.credits?.cast?.length > 0 && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Cast
                </ThemedText>
                <HorizontalList
                  itemData={details?.credits?.cast}
                  itemType="cast"
                  showDescription={true}
                />
              </View>
            )}
            {details?.seasons?.length > 0 && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl sm:text-3xl sm:pb-2">
                  Seasons
                </ThemedText>
                <SeasonSection
                  tmdbID={id as string}
                  seasons={details?.seasons}
                  defaultSeason={details?.seasons[0].season_number}
                />
              </View>
            )}
          </View>
        </ParallaxScrollView>
        <View className="ms-5 me-5 sm:px-8 md:px-24"></View>
      </View>
      <SelectStreamModal
        id={id as string}
        mediaType="tv"
        modalVisible={selectStreamModalVisible}
        setModalVisible={setSelectStreamModalVisible}
      />
    </>
  );
}
