import { View, Text, Button, Platform } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/services/ctx";
import HomeDetails from "@/components/home/HomeDetails";

export default function Settings() {
  const { signOut } = useSession();
  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Text className="text-blue-500 font-bold text-3xl">Settings!</Text>
      <Text className="text-white">Platform ISTV: {Platform.isTV}</Text>
      <Text className="text-white">Platform ISTVos: {Platform.isTVOS}</Text>
      <Text className="text-white">Platform: {Platform.OS}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </SafeAreaView>
  );
}
