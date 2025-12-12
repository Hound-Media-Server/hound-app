import { View, Text, ScrollView, Button } from "react-native";
import React from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MovieDetails() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <ScrollView
          className="flex-1 ps-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 10,
          }}
        >
          <Text className="text-white">Movie Details: {id}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
