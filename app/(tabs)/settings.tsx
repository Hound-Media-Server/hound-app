import {
  View,
  Text,
  Button,
  Platform,
  Pressable,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/services/ctx";
import { getSetting, setSetting } from "@/stores/settingsStore";

export default function Settings() {
  const { signOut } = useSession();
  const [player, setPlayer] = useState<string>("exoplayer");

  useEffect(() => {
    getSetting("player").then((val) => {
      if (val) setPlayer(val);
    });
  }, []);

  const handleSetPlayer = async (newPlayer: "mpv" | "exoplayer") => {
    await setSetting("player", newPlayer);
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
        onPress={() => handleSetPlayer("mpv")}
        hasTVPreferredFocus
        className={`mt-3 p-2 rounded-lg border-2 ${player === "mpv" ? "bg-blue-700 border-white" : "bg-blue-500 border-transparent"} focus:border-white`}
      >
        <Text className="text-white">set mpv</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSetPlayer("exoplayer")}
        className={`mt-3 p-2 rounded-lg border-2 ${player === "exoplayer" ? "bg-blue-700 border-white" : "bg-blue-500 border-transparent"} focus:border-white`}
      >
        <Text className="text-white">set exoplayer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-3 bg-blue-500 p-2 rounded-lg border-2 border-transparent focus:border-white"
        onPress={signOut}
      >
        <Text className="text-white">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
