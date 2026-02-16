import {
  View,
  Text,
  Button,
  Platform,
  Pressable,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/services/ctx";
import { getSetting, setSetting } from "@/stores/settingsStore";
import * as Updates from "expo-updates";

export default function Settings() {
  const { signOut } = useSession();
  const [player, setPlayer] = useState<string>("exoplayer");

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        Alert.alert("Update applied successfully!");
      } else {
        Alert.alert("No updates found");
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    const val = getSetting("defaultPlayer");
    if (val) setPlayer(val);
  }, []);

  const handleSetPlayer = (newPlayer: "mpv" | "exoplayer") => {
    setSetting("defaultPlayer", newPlayer);
    setPlayer(newPlayer);
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Text className="text-blue-500 font-bold text-3xl">Settings!</Text>
      <Text className="text-white">
        Platform ISTV: {Platform.isTV ? "yes" : "no"}
      </Text>
      <Text className="text-white">
        Platform ISTVos: {Platform.isTVOS ? "yes" : "no"}
      </Text>
      <Text className="text-white">Platform: {Platform.OS}</Text>
      <Text className="text-white">Player: {player}</Text>
      <TouchableOpacity
        onPress={() => onFetchUpdateAsync()}
        hasTVPreferredFocus
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">Fetch Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSetPlayer("mpv")}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">set mpv</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSetPlayer("exoplayer")}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">set exoplayer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
        onPress={signOut}
      >
        <Text className="text-white">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
