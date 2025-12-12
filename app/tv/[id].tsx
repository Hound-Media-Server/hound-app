import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TVDetails() {
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
          <Text className="text-white">TV Details: {id}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
