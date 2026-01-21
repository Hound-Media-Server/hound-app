import { useWindowDimensions } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useRef, useState } from "react";
import { updatePlaybackProgress } from "@/services/watchDataService";
import Video, {
  VideoRef,
  OnLoadData,
  OnProgressData,
} from "react-native-video";

export default function RNVVideoScreen(props: {
  src: string;
  startTime?: number;
  id: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number;
  episodeNumber?: number;
  encodedData: string;
}) {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<VideoRef>(null);
  const initialSeekDone = useRef(false);
  const [paused, setPaused] = useState(false);

  const handleLoad = (data: OnLoadData) => {
    // Seek to start time when video is ready
    if (props.startTime && !initialSeekDone.current) {
      videoRef.current?.seek(props.startTime);
      initialSeekDone.current = true;
    }
  };

  const handleProgress = (data: OnProgressData) => {
    // 5 minute grace period before tracking
    if (data.currentTime > 300) {
      updatePlaybackProgress(props.id, props.mediaType, {
        season_number: props.seasonNumber,
        episode_number: props.episodeNumber,
        encoded_data: props.encodedData,
        current_progress_seconds: Math.floor(data.currentTime),
        total_duration_seconds: Math.floor(data.seekableDuration),
      }).catch((err) => {
        console.error("Failed to update playback progress:", err);
      });
    }
  };

  useLayoutEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <>
      <StatusBar hidden />
      <Video
        ref={videoRef}
        source={{ uri: props.src }}
        style={{ width, height }}
        controls={true}
        paused={paused}
        onLoad={handleLoad}
        onProgress={handleProgress}
        resizeMode="contain"
        playInBackground={false}
        playWhenInactive={false}
        progressUpdateInterval={5000}
      />
    </>
  );
}
