import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet, View } from "react-native";
import { useWindowDimensions } from "react-native";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoScreen() {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
    player.timeUpdateEventInterval = 1;
  });
  useEventListener(player, "timeUpdate", (payload) => {
    // console.log("Player status changed: ", payload.currentTime);
  });
  return (
    <VideoView
      style={{ width, height }}
      player={player}
      nativeControls
      fullscreenOptions={{
        enable: true,
      }}
      allowsPictureInPicture
    />
  );
}
