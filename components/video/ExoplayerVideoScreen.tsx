import {
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { updatePlaybackProgress } from "@/services/watchDataService";
import Video, {
  VideoRef,
  OnLoadData,
  OnProgressData,
  OnTextTracksData,
  OnAudioTracksData,
  ResizeMode,
  SelectedTrackType,
  TextTrackType,
} from "react-native-video";
import VideoControls from "./VideoControls";
import VideoControlsTV from "./VideoControls.tv";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";

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
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(-1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0);
  const [isZoomedToFill, setIsZoomedToFill] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initialSeekDone = useRef(false);

  // Update playback progress every 5 seconds
  useEffect(() => {
    if (!isReady || paused) return;

    const interval = setInterval(() => {
      // Don't set playback progress if below 5 minutes
      if (currentTime > 300) {
        updatePlaybackProgress(props.id, props.mediaType, {
          season_number: props.seasonNumber,
          episode_number: props.episodeNumber,
          encoded_data: props.encodedData,
          current_progress_seconds: Math.floor(currentTime),
          total_duration_seconds: Math.floor(duration),
        }).catch((err) => {
          console.error("Failed to update playback progress:", err);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    isReady,
    paused,
    props.id,
    props.mediaType,
    props.seasonNumber,
    props.episodeNumber,
    props.encodedData,
  ]);

  const handleLoad = (data: OnLoadData) => {
    setIsReady(true);
    setDuration(data.duration);

    // Seek to start time if provided
    if (props.startTime && !initialSeekDone.current) {
      videoRef.current?.seek(props.startTime);
      initialSeekDone.current = true;
    }
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
  };

  const handleTextTracks = (data: OnTextTracksData) => {
    // Convert react-native-video track format to MPV format for controls compatibility
    const tracks = data.textTracks.map((track) => ({
      id: track.index,
      title: track.title,
      lang: track.language,
      selected: track.index === selectedTextTrack,
    }));
    setTextTracks(tracks);
  };

  const handleAudioTracks = (data: OnAudioTracksData) => {
    // Convert react-native-video track format to MPV format for controls compatibility
    const tracks = data.audioTracks.map((track) => ({
      id: track.index,
      title: track.title,
      lang: track.language,
      selected: track.index === selectedAudioTrack,
    }));
    setAudioTracks(tracks);
  };

  const handleError = (error: any) => {
    console.error("ExoPlayer error:", JSON.stringify(error, null, 2));

    let errorMessage = "An unknown playback error occurred.";

    if (error?.error?.errorString) {
      errorMessage = error.error.errorString;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }

    Alert.alert("ExoPlayer Error", `${errorMessage}`, [
      {
        text: "OK",
        onPress: () => router.back(),
        style: "cancel",
      },
    ]);
  };

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const handleSeek = (time: number) => {
    videoRef.current?.seek(time);
    setCurrentTime(time);
  };

  const handleSeekForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    handleSeek(newTime);
  };

  const handleSeekBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    handleSeek(newTime);
  };

  const handleSelectTextTrack = (id: number) => {
    setSelectedTextTrack(id);
  };

  const handleSelectAudioTrack = (id: number) => {
    setSelectedAudioTrack(id);
  };

  const handleChangeResizeMode = () => {
    setIsZoomedToFill(!isZoomedToFill);
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
      <View style={{ width, height, backgroundColor: "black" }}>
        <Video
          ref={videoRef}
          source={{ uri: props.src }}
          style={{ width, height }}
          paused={paused}
          resizeMode={isZoomedToFill ? ResizeMode.COVER : ResizeMode.CONTAIN}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onTextTracks={handleTextTracks}
          onAudioTracks={handleAudioTracks}
          onError={handleError}
          progressUpdateInterval={1000}
          selectedTextTrack={
            selectedTextTrack === -1
              ? { type: SelectedTrackType.DISABLED }
              : { type: SelectedTrackType.INDEX, value: selectedTextTrack }
          }
          selectedAudioTrack={
            selectedAudioTrack >= 0
              ? { type: SelectedTrackType.INDEX, value: selectedAudioTrack }
              : undefined
          }
        />
        {Platform.isTV ? (
          <VideoControlsTV
            videoRef={videoRef as any}
            paused={paused}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            onSeekForward={handleSeekForward}
            onSeekBackward={handleSeekBackward}
            textTracks={textTracks}
            audioTracks={audioTracks}
            selectedTextTrack={selectedTextTrack}
            selectedAudioTrack={selectedAudioTrack}
            onSelectTextTrack={handleSelectTextTrack}
            onSelectAudioTrack={handleSelectAudioTrack}
            isZoomedToFill={isZoomedToFill}
            onChangeResizeMode={handleChangeResizeMode}
          />
        ) : (
          <VideoControls
            videoRef={videoRef as any}
            paused={paused}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            onSeekForward={handleSeekForward}
            onSeekBackward={handleSeekBackward}
            textTracks={textTracks}
            audioTracks={audioTracks}
            selectedTextTrack={selectedTextTrack}
            selectedAudioTrack={selectedAudioTrack}
            onSelectTextTrack={handleSelectTextTrack}
            onSelectAudioTrack={handleSelectAudioTrack}
            isZoomedToFill={isZoomedToFill}
            onChangeResizeMode={handleChangeResizeMode}
          />
        )}
        {!isReady && <LoadingOverlay />}
      </View>
    </>
  );
}

const LoadingOverlay = () => {
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 w-100 h-100 bg-black flex items-center justify-center">
      <ThemedText className="text-white mb-2">Loading Exoplayer...</ThemedText>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};
