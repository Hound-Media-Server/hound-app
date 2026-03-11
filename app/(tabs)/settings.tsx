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
  const [playAction, setPlayAction] = useState<"direct" | "select" | undefined>(
    undefined,
  );
  const [defaultShowResizeMode, setDefaultShowResizeMode] = useState<
    "cover" | "contain" | undefined
  >(undefined);
  const [defaultMovieResizeMode, setDefaultMovieResizeMode] = useState<
    "cover" | "contain" | undefined
  >(undefined);
  const [subtitleSize, setSubtitleSize] = useState<number>(24);
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState<
    string | undefined
  >(undefined);

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
    setPlayAction(getSetting("defaultPlayAction"));
    setDefaultShowResizeMode(getSetting("defaultShowResizeMode"));
    setDefaultMovieResizeMode(getSetting("defaultMovieResizeMode"));
    setSubtitleSize(getSetting("subtitleSize") || 24);
    setDefaultAudioLanguage(getSetting("audioLanguage"));
  }, []);

  const handleSetPlayer = (newPlayer: "mpv" | "exoplayer") => {
    setSetting("defaultPlayer", newPlayer);
    setPlayer(newPlayer);
  };

  const handleTogglePlayAction = () => {
    if (!playAction) return;
    const newPlayAction = playAction === "direct" ? "select" : "direct";
    setSetting("defaultPlayAction", newPlayAction);
    setPlayAction(newPlayAction);
  };

  const handleToggleShowResizeMode = () => {
    if (!defaultShowResizeMode) return;
    const newResizeMode =
      defaultShowResizeMode === "cover" ? "contain" : "cover";
    setSetting("defaultShowResizeMode", newResizeMode);
    setDefaultShowResizeMode(newResizeMode);
  };

  const handleToggleMovieResizeMode = () => {
    if (!defaultMovieResizeMode) return;
    const newResizeMode =
      defaultMovieResizeMode === "cover" ? "contain" : "cover";
    setSetting("defaultMovieResizeMode", newResizeMode);
    setDefaultMovieResizeMode(newResizeMode);
  };

  const handleAdjustSubtitleSize = (adjustment: number) => {
    const newSize = subtitleSize + adjustment;
    if (newSize < 10 || newSize > 64) return;
    setSetting("subtitleSize", newSize);
    setSubtitleSize(newSize);
  };

  const handleAudioLanguage = () => {
    setDefaultAudioLanguage(defaultAudioLanguage === "en" ? "original" : "en");
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
      <Text className="text-white">PlayAction: {playAction}</Text>
      <Text className="text-white">
        Default Show Resize: {defaultShowResizeMode}
      </Text>
      <Text className="text-white">
        Default Movie Resize: {defaultMovieResizeMode}
      </Text>
      <Text className="text-white">Subtitle Size: {subtitleSize}</Text>
      <TouchableOpacity
        onPress={() => onFetchUpdateAsync()}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">Fetch Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleAudioLanguage()}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">Audio Lang: {defaultAudioLanguage}</Text>
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
        onPress={() => handleTogglePlayAction()}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">toggle play action</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleToggleShowResizeMode()}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">toggle show resize mode</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleToggleMovieResizeMode()}
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
      >
        <Text className="text-white">toggle movie resize mode</Text>
      </TouchableOpacity>
      <View className="flex-row mt-3">
        <TouchableOpacity
          onPress={() => handleAdjustSubtitleSize(-2)}
          className={`p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white mr-2`}
        >
          <Text className="text-white">Sub Size -</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAdjustSubtitleSize(2)}
          className={`p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
        >
          <Text className="text-white">Sub Size +</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className={`mt-3 p-2 rounded-lg bg-blue-500 border-2 border-transparent focus:border-white`}
        onPress={signOut}
      >
        <Text className="text-white">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
