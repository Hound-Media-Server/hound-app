import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import {
  useIPTVProviders,
  IPTVProvider,
  useXtreamCategories,
} from "@/services/iptvService";
import IPTVScreenTV from "@/screens/live_tv/IPTVScreen.tv";
import { useFocusEffect } from "expo-router";
import { Platform } from "react-native";

export interface LiveTVProps {
  iptvProviders: IPTVProvider[] | undefined;
  selectedProvider: IPTVProvider | null;
  setIPTVProviderID: (iptvProviderID: number) => void;
  categories: any;
}

export default function LiveTV() {
  const [iptvProviderID, setIPTVProviderID] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<IPTVProvider | null>(
    null,
  );
  const { data: providers, isLoading, error } = useIPTVProviders();
  const { data: xtreamCategories } = useXtreamCategories(
    selectedProvider?.iptv_provider_id,
    selectedProvider?.iptv_provider_type,
  );

  // use landscape for non-tv devices
  useFocusEffect(
    useCallback(() => {
      if (Platform.isTV) return;
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, []),
  );

  useEffect(() => {
    if (!iptvProviderID && providers && providers.length > 0) {
      setIPTVProviderID(providers[0].iptv_provider_id);
    }
  }, [providers]);

  useEffect(() => {
    if (iptvProviderID) {
      const provider = providers?.find(
        (provider: IPTVProvider) =>
          provider.iptv_provider_id === iptvProviderID,
      );
      setSelectedProvider(provider || null);
    }
  }, [iptvProviderID]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ThemedText>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ThemedText>Error: {error.message}</ThemedText>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-black">
      <IPTVScreenTV
        iptvProviders={providers}
        selectedProvider={selectedProvider}
        setIPTVProviderID={setIPTVProviderID}
        categories={xtreamCategories}
      />
    </SafeAreaView>
  );
}
