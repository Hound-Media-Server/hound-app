import { Pressable } from "react-native";
import { ThemedText } from "./ThemedText";

export default function FocusButton({
  onPress,
  label,
  hasTVPreferredFocus,
}: {
  onPress: () => void;
  label: string;
  hasTVPreferredFocus?: boolean;
}) {
  return (
    <Pressable
      onPress={() => onPress()}
      hasTVPreferredFocus={hasTVPreferredFocus}
      focusable
      className="p-2 bg-gray-600 focus:bg-secondary/85 rounded-2xl w-[120px] sm:w-[150px] items-center"
    >
      <ThemedText className="text-primary text-md sm:text-lg">
        {label}
      </ThemedText>
    </Pressable>
  );
}
