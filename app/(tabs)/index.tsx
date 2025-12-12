import { View, Text, ScrollView, FlatList } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTrendingMovies,
  useTrendingShows,
} from "./../../api/catalogService";
import HorizontalList from "@/components/HorizontalList";
import { Link } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <ScrollView
          className="flex-1 ps-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 10,
          }}
        >
          <Text className="font-bold text-red-500 text-3xl">Hound</Text>
          <Link href="/stream">
            <Text className="text-white text-xl">Stream</Text>
          </Link>
          <HorizontalList useQuery={useTrendingShows} title="Trending Shows" />
          <HorizontalList
            useQuery={useTrendingMovies}
            title="Trending Movies"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
