import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useIPTVProviders } from "@/services/iptv";
import IPTVScreenTV from "@/screens/live_tv/IPTVScreen.tv";

export interface LiveTVProps {
  iptvProviders: any;
  iptvProviderID: number | null;
  setIPTVProviderID: (iptvProviderID: number) => void;
}

export default function LiveTV() {
  const { data: providers, isLoading, error } = useIPTVProviders();
  const [iptvProviderID, setIPTVProviderID] = useState<number | null>(null);

  useEffect(() => {
    if (!iptvProviderID && providers && providers.length > 0) {
      setIPTVProviderID(providers[0].iptv_provider_id);
    }
  }, [providers]);

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
      {Platform.isTV ? (
        <IPTVScreenTV
          iptvProviders={providers}
          iptvProviderID={iptvProviderID}
          setIPTVProviderID={setIPTVProviderID}
        />
      ) : null}
    </SafeAreaView>
  );
}
