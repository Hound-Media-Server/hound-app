import * as ScreenOrientation from "expo-screen-orientation";

export function lockLandscape() {
  void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
}

export function unlockOrientation() {
  void ScreenOrientation.unlockAsync();
}
