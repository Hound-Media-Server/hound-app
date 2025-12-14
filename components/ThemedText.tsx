import { Alert, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useFonts } from "@expo-google-fonts/cabin/useFonts";
import { Cabin_400Regular } from "@expo-google-fonts/cabin/400Regular";
import { Cabin_500Medium } from "@expo-google-fonts/cabin/500Medium";
import { Cabin_600SemiBold } from "@expo-google-fonts/cabin/600SemiBold";
import { Cabin_700Bold } from "@expo-google-fonts/cabin/700Bold";
import { Cabin_400Regular_Italic } from "@expo-google-fonts/cabin/400Regular_Italic";
import { Cabin_500Medium_Italic } from "@expo-google-fonts/cabin/500Medium_Italic";
import { Cabin_600SemiBold_Italic } from "@expo-google-fonts/cabin/600SemiBold_Italic";
import { Cabin_700Bold_Italic } from "@expo-google-fonts/cabin/700Bold_Italic";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  let [fontsLoaded] = useFonts({
    Cabin_400Regular,
    Cabin_500Medium,
    Cabin_600SemiBold,
    Cabin_700Bold,
    Cabin_400Regular_Italic,
    Cabin_500Medium_Italic,
    Cabin_600SemiBold_Italic,
    Cabin_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  // edit to support dark/light mode switching in the future
  return (
    <Text
      className={className}
      style={[
        type === "default" ? { fontFamily: "Cabin_400Regular" } : undefined,
        type === "title" ? { fontFamily: "Cabin_700Bold" } : undefined,
        type === "defaultSemiBold"
          ? { fontFamily: "Cabin_600SemiBold" }
          : undefined,
        type === "subtitle" ? { fontFamily: "Cabin_700Bold" } : undefined,
        type === "link" ? { fontFamily: "Cabin_400Regular" } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
