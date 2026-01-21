import { useWindowDimensions, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useRef, useState } from "react";
import { updatePlaybackProgress } from "@/services/watchDataService";
import Video, {
  VideoRef,
  OnLoadData,
  OnProgressData,
  OnTextTracksData,
  OnAudioTracksData,
  ResizeMode,
  SelectedTrackType,
} from "react-native-video";
import VideoControls from "./VideoControls";

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(-1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0);
  const [resizeMode, setResizeMode] = useState<"contain" | "cover" | "stretch">(
    "contain",
  );

  const handleLoad = (data: OnLoadData) => {
    setDuration(data.duration);

    // Seek to start time when video is ready
    if (props.startTime && !initialSeekDone.current) {
      videoRef.current?.seek(props.startTime);
      initialSeekDone.current = true;
    }
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);

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

  const handleTextTracks = (data: OnTextTracksData) => {
    setTextTracks(data.textTracks || []);
  };

  const handleAudioTracks = (data: OnAudioTracksData) => {
    setAudioTracks(data.audioTracks || []);
  };

  const handleSeek = (time: number) => {
    videoRef.current?.seek(time);
  };

  const handleSeekForward = () => {
    videoRef.current?.seek(currentTime + 10);
  };

  const handleSeekBackward = () => {
    videoRef.current?.seek(Math.max(0, currentTime - 10));
  };

  const handleSelectTextTrack = (index: number) => {
    setSelectedTextTrack(index);
  };

  const handleSelectAudioTrack = (index: number) => {
    setSelectedAudioTrack(index);
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
          controls={false}
          paused={paused}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onTextTracks={handleTextTracks}
          onAudioTracks={handleAudioTracks}
          selectedTextTrack={
            selectedTextTrack === -1
              ? { type: SelectedTrackType.DISABLED }
              : {
                  type: SelectedTrackType.LANGUAGE,
                  value:
                    textTracks.find((t) => t.index === selectedTextTrack)
                      ?.language || "",
                }
          }
          selectedAudioTrack={{
            type: SelectedTrackType.LANGUAGE,
            value:
              audioTracks.find((t) => t.index === selectedAudioTrack)
                ?.language || "",
          }}
          resizeMode={resizeMode}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={5000}
        />
        <VideoControls
          videoRef={videoRef}
          paused={paused}
          onPlayPause={() => setPaused(!paused)}
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
          resizeMode={resizeMode}
          onChangeResizeMode={setResizeMode}
        />
      </View>
    </>
  );
}
