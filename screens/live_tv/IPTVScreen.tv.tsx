import { LiveTVProps } from "@/app/(tabs)/live_tv";
import { ThemedText } from "@/components/ThemedText";
import { useIPTVProviders } from "@/services/iptv";
import { Platform, Pressable, View } from "react-native";

export default function IPTVScreenTV({
  iptvProviders,
  iptvProviderID,
  setIPTVProviderID,
}: LiveTVProps) {
  const selectedProvider = iptvProviders?.find(
    (provider: any) => provider.iptv_provider_id === iptvProviderID,
  );
  return (
    <View className={"px-5 md:px-12 " + (Platform.isTV ? "mt-20" : "mt-5")}>
      <ThemedText className="ps-2 text-2xl text-white mb-3">Live TV</ThemedText>
      <Pressable
        key={`provider-${selectedProvider?.iptv_provider_id}`}
        className="bg-white/10 p-4 rounded-xl mb-3 active:bg-white/20 border-2 focus:border-white"
        focusable={Platform.isTV}
      >
        <ThemedText className="text-xl font-semibold text-white">
          {selectedProvider?.name}
        </ThemedText>
      </Pressable>
    </View>
  );
}
