import { View, Text, TouchableHighlight, Platform } from "react-native";
import React from "react";
import { ImageBackground } from "expo-image";
import { ThemedText } from "../ThemedText";

export default function HomeDetails({ item }: { item: any }) {
  return (
    <View className="flex-1 bg-black items-center justify-items-center">
      <ThemedText className="text-white text-3xl">The Martian</ThemedText>
      <ThemedText className="text-gray-300 text-xl">
        The Martian is a story about a man who is stranded on Mars and must
        survive. The Martian is a story about a man who is stranded on Mars and
        must survive. The Martian is a story about a man who is stranded on Mars
        and must survive.The Martian is a story about a man who is stranded on
        Mars and must survive.
      </ThemedText>
    </View>
  );
}
