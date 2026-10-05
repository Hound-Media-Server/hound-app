import { Platform, useWindowDimensions } from "react-native";
import { getTVScale } from "@/utils/tvScale";

// Use for fixed design dimensions only
export function useTVScale(): number {
  const { width, height } = useWindowDimensions();
  return getTVScale(Platform.OS === "ios" && Platform.isTV, width, height);
}
