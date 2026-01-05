import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useWindowDimensions } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useEffect } from "react";
import { updatePlaybackProgress } from "@/services/watchDataService";

export default function VideoScreen(props: {
  src: string;
  startTime?: number;
  id: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number;
  episodeNumber?: number;
  encodedData: string;
}) {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(props.src, (player) => {
    player.loop = false;
    player.play();
    player.timeUpdateEventInterval = 1;
    if (props.startTime) {
      player.currentTime = props.startTime;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 5 minute grace
      if (player.playing && player.currentTime > 300) {
        updatePlaybackProgress(props.id, props.mediaType, {
          season_number: props.seasonNumber,
          episode_number: props.episodeNumber,
          encoded_data: props.encodedData,
          current_progress_seconds: Math.floor(player.currentTime),
          total_duration_seconds: Math.floor(player.duration),
        }).catch((err) => {
          console.error("Failed to update playback progress:", err);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    player,
    props.id,
    props.mediaType,
    props.seasonNumber,
    props.episodeNumber,
    props.encodedData,
    props.src,
  ]);

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
