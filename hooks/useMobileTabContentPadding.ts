import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MOBILE_TAB_BAR_HEIGHT = 64;
export const MOBILE_TAB_BAR_BOTTOM_MARGIN = 20;
export const MOBILE_TAB_BAR_CONTENT_GAP = 12;

export function useMobileTabContentPadding() {
  const { bottom } = useSafeAreaInsets();
  return Platform.isTV
    ? 0
    : Math.max(
        0,
        MOBILE_TAB_BAR_HEIGHT +
          MOBILE_TAB_BAR_BOTTOM_MARGIN +
          MOBILE_TAB_BAR_CONTENT_GAP -
          bottom,
      );
}
