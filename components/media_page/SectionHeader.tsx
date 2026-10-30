import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function SectionHeader({ children }: { children: string }) {
  return (
    <View className="flex-row items-center mt-3 mb-3">
      <View className="w-1 h-6 me-2 bg-red-500" />
      <ThemedText className="text-gray-200 text-2xl sm:text-3xl">
        {children}
      </ThemedText>
    </View>
  );
}
