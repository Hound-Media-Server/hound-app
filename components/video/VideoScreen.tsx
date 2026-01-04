import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useWindowDimensions } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect } from "react";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoScreen(props: { src: string }) {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(props.src, (player) => {
    player.loop = true;
    player.play();
    player.timeUpdateEventInterval = 1;
  });
  useLayoutEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);
  useEventListener(player, "timeUpdate", (payload) => {
    // console.log("Player status changed: ", payload.currentTime);
  });
  return (
    <>
      <StatusBar hidden />
      <VideoView
        style={{ width, height }}
        player={player}
        nativeControls
        fullscreenOptions={{
          enable: false,
        }}
        allowsPictureInPicture
      />
    </>
  );
}
