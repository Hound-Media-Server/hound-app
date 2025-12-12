import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Library() {
    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text className="text-blue-500 font-bold text-3xl">Library!</Text>
        </SafeAreaView>
    );
}
