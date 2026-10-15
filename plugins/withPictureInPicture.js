const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");

// PiP is mobile-only, TV builds are prebuilt with EXPO_TV=1
const withPictureInPicture = (config) => {
  if (process.env.EXPO_TV === "1") return config;
  return withAndroidManifest(config, (config) => {
    AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults).$[
      "android:supportsPictureInPicture"
    ] = "true";
    return config;
  });
};

module.exports = withPictureInPicture;
