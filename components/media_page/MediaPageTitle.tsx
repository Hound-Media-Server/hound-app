import { useTVScale } from "@/hooks/useTVScale";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function MediaPageTitle({
  title,
  logoUri,
}: {
  title?: string;
  logoUri?: string;
}) {
  const scale = useTVScale();

  if (!logoUri) {
    return (
      <ThemedText className="text-white text-3xl leading-[36px]">
        {title}
      </ThemedText>
    );
  }

  return (
    <Image
      source={logoUri}
      contentFit="contain"
      contentPosition="left bottom"
      transition={300}
      style={{
        width: Platform.isTV ? 300 * scale : "100%",
        maxWidth: Platform.isTV ? undefined : 320,
        height: Platform.isTV ? 140 * scale : 140,
        marginBottom: 8 * scale,
      }}
    />
  );
}
