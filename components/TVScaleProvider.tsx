import { PropsWithChildren, useLayoutEffect } from "react";
import { Platform } from "react-native";
import { rem } from "nativewind";
import { useTVScale } from "@/hooks/useTVScale";

// scale rem for tvOS only
export function TVScaleProvider({ children }: PropsWithChildren) {
  const scale = useTVScale();
  useLayoutEffect(() => {
    if (Platform.OS !== "ios" || !Platform.isTV) return;
    rem.set(14 * scale);
    return () => rem.set(14);
  }, [scale]);
  return children;
}
