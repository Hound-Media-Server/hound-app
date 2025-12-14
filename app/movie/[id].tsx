import {
  View,
  Text,
  ScrollView,
  Button,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMovieDetails } from "@/services/mediaDetailsService";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import HorizontalList from "@/components/HorizontalList";
import SelectStreamModal from "@/components/SelectStreamModal";

export default function MovieDetails() {
  const [selectStreamModalVisible, setSelectStreamModalVisible] =
    React.useState(false);
  const { id } = useLocalSearchParams();

  const { data: details, isLoading, error } = useMovieDetails(id as string);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  const creators = details?.credits?.crew
    ?.filter((item: any) => item.job === "Director")
    .map((item: any) => item.name)
    .join(", ");
  // create array to render info in a row
  const info = [];
  if (details?.runtime) {
    info.push(
      Math.floor(details?.runtime / 60) + "h " + (details?.runtime % 60) + "m"
    );
  }
  if (creators) {
    info.push(creators);
  }
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          <ImageBackground
            source={{ uri: details?.backdrop_url }}
            className="absolute w-full h-96"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)", "rgba(0,0,0,1)"]}
              className="absolute inset-x-0 bottom-0 h-full"
            />
          </ImageBackground>
          <View className="mt-52 ms-5">
            <TouchableOpacity
              onPress={() => setSelectStreamModalVisible(true)}
              activeOpacity={0.75}
              className="mt-20 p-2 mb-3 bg-secondary rounded-2xl w-20 items-center"
            >
              <ThemedText className="text-primary text-[14px]">
                ▶︎ Play
              </ThemedText>
            </TouchableOpacity>
            <View className="me-5">
              <Text>
                <ThemedText className="text-white text-3xl">
                  {details?.media_title}
                </ThemedText>
                <ThemedText className="text-gray-400 text-2xl">
                  {"  (" + details?.release_date.split("-")[0] + ")"}
                </ThemedText>
              </Text>
              <ThemedText className="text-secondary mt-1 opacity-80">
                {details?.genres?.map((item: any) => item.name).join(", ")}
              </ThemedText>
              <ThemedText className="text-gray-400 mt-1">
                {info.join(" ⸱ ")}
              </ThemedText>
              <ThemedText className="text-gray-300 text-md mt-1">
                {details?.overview}
              </ThemedText>
            </View>
            {details?.credits?.cast?.length > 0 && (
              <View className="mt-2">
                <ThemedText className="text-gray-200 mt-1 mb-2 text-xl">
                  Cast
                </ThemedText>
                <HorizontalList
                  itemData={details?.credits?.cast}
                  showDescription={true}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <SelectStreamModal
        id={id as string}
        modalVisible={selectStreamModalVisible}
        setModalVisible={setSelectStreamModalVisible}
      />
    </SafeAreaView>
  );
}
