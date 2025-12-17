import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

export default function Library() {
  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Text className="text-blue-500 font-bold text-3xl">Library!</Text>
      <Link href="/tv/tmdb-30983">
        <ThemedText className="text-white">Detective Conan</ThemedText>
      </Link>
    </SafeAreaView>
  );
}
