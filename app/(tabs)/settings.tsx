import { View, Text, Button } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/services/ctx";

export default function Settings() {
  const { signOut } = useSession();
  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Text className="text-blue-500 font-bold text-3xl">Settings!</Text>
      <Button title="Sign Out" onPress={signOut} />
    </SafeAreaView>
  );
}
