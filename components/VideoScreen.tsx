import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Video } from "react-native-video";

export default function VideoScreen({ uri }: { uri: string }) {
  return (
    <>
      <ActivityIndicator style={styles.activityIndicator} size={"large"} />
      <Video
        source={{
          uri: uri,
          metadata: {
            title: "Custom Title",
            subtitle: "Custom Subtitle",
            description: "Custom Description",
            imageUri:
              "https://pbs.twimg.com/profile_images/1498641868397191170/6qW2XkuI_400x400.png",
          },
        }}
        style={[styles.fullScreen, StyleSheet.absoluteFillObject]}
        muted={false}
        controls
        fullscreen
        resizeMode={"contain"}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  activityIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
