import { useState } from "react";
import { AppState } from "react-native";

export function usePictureInPicture(onClosed: () => void) {
  const [isPip, setIsPip] = useState(false);
  const onPipChange = (isActive: boolean) => {
    setIsPip(isActive);
    // AppState can lag behind the PiP event when the window is expanded
    if (!isActive)
      setTimeout(() => AppState.currentState !== "active" && onClosed(), 500);
  };
  return [isPip, onPipChange] as const;
}
