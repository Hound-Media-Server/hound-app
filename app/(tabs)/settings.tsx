import {
  View,
  Text,
  Button,
  Platform,
  Pressable,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/services/ctx";
import { getSetting, setSetting } from "@/stores/settingsStore";
import * as Updates from "expo-updates";
import { ThemedText } from "@/components/ThemedText";

export default function Settings() {
  const { signOut } = useSession();
  const [defaultPlayer, setDefaultPlayer] = useState<string | undefined>(
    undefined,
  );
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
  const [autoplayNextEpisode, setAutoplayNextEpisode] = useState<boolean>(true);

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
    setDefaultPlayer(getSetting("defaultPlayer"));
    setPlayAction(getSetting("defaultPlayAction"));
    setDefaultShowResizeMode(getSetting("defaultShowResizeMode"));
    setDefaultMovieResizeMode(getSetting("defaultMovieResizeMode"));
    setSubtitleSize(getSetting("subtitleSize") || 24);
    setDefaultAudioLanguage(getSetting("audioLanguage"));
    const autoplay = getSetting("autoplayNextEpisode");
    setAutoplayNextEpisode(autoplay !== undefined ? autoplay : true);
  }, []);

  const handleSetPlayer = (newPlayer: "mpv" | "exoplayer") => {
    setSetting("defaultPlayer", newPlayer);
    setDefaultPlayer(newPlayer);
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
    const newVal = defaultAudioLanguage === "en" ? "original" : "en";
    setSetting("audioLanguage", newVal);
    setDefaultAudioLanguage(newVal);
  };

  const handleToggleAutoplay = () => {
    const newValue = !autoplayNextEpisode;
    setSetting("autoplayNextEpisode", newValue);
    setAutoplayNextEpisode(newValue);
  };

  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <ScrollView
        className={"mt-20 flex-1 w-full px-5 md:px-12"}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText className="text-white text-2xl ps-2">Settings</ThemedText>
        <PressableSetting onPress={() => onFetchUpdateAsync()}>
          <ThemedText className="text-white">Fetch Updates</ThemedText>
        </PressableSetting>
        <PressableSetting onPress={() => handleAudioLanguage()}>
          <ThemedText className="text-white">
            Audio Lang: {defaultAudioLanguage}
          </ThemedText>
        </PressableSetting>
        {
          // for ios, only use mpv, since the AVPlayer is quite weak
          Platform.OS !== "ios" && (
            <PressableSetting
              onPress={() => {
                defaultPlayer === "mpv"
                  ? handleSetPlayer("exoplayer")
                  : handleSetPlayer("mpv");
              }}
            >
              <ThemedText className="text-white">
                Player: {defaultPlayer}
              </ThemedText>
            </PressableSetting>
          )
        }
        <PressableSetting onPress={() => handleTogglePlayAction()}>
          <ThemedText className="text-white">
            PlayAction: {playAction}
          </ThemedText>
        </PressableSetting>
        <PressableSetting onPress={() => handleToggleShowResizeMode()}>
          <ThemedText className="text-white">
            Show Resize Mode: {defaultShowResizeMode}
          </ThemedText>
        </PressableSetting>
        <PressableSetting onPress={() => handleToggleMovieResizeMode()}>
          <ThemedText className="text-white">
            Movie Resize Mode: {defaultMovieResizeMode}
          </ThemedText>
        </PressableSetting>
        <ThemedText className="text-white mt-3">
          Subtitle Size: {subtitleSize}
        </ThemedText>
        <PressableSetting onPress={() => handleAdjustSubtitleSize(-2)}>
          <ThemedText className="text-white">Sub Size -</ThemedText>
        </PressableSetting>
        <PressableSetting onPress={() => handleAdjustSubtitleSize(2)}>
          <ThemedText className="text-white">Sub Size +</ThemedText>
        </PressableSetting>
        <PressableSetting onPress={() => handleToggleAutoplay()}>
          <ThemedText className="text-white">
            Autoplay Next Episode: {autoplayNextEpisode ? "On" : "Off"}
          </ThemedText>
        </PressableSetting>
        <PressableSetting onPress={signOut}>
          <ThemedText className="text-white">Sign Out</ThemedText>
        </PressableSetting>
      </ScrollView>
    </SafeAreaView>
  );
}

const PressableSetting = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Pressable
      className={`mt-3 bg-white/10 p-3 rounded-xl active:bg-white/20 border-2 focus:border-white`}
      onPress={onPress}
      focusable={Platform.isTV}
    >
      {children}
    </Pressable>
  );
};
