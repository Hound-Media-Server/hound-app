import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    return (
        <SafeAreaView>
            <View className="">
                <Text className="font-bold text-red-500 text-3xl">Index</Text>
            </View>
        </SafeAreaView>
    );
}
