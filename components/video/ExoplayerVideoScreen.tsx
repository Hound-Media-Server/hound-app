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
import {
  useUpdatePlaybackProgress,
  PlayerSettings,
} from "@/services/watchDataService";
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
  streamsMatch?: boolean;
  playerSettings?: PlayerSettings | null;
  onChangePlayer?: (
    player: "exoplayer" | "mpv",
    currentTime: number,
    settings?: any,
  ) => void;
  hasNextEpisode?: boolean;
  onNextEpisode?: (settings: any) => void;
}) {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<VideoRef>(null);
  const updatePlaybackProgress = useUpdatePlaybackProgress();
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0); // for setInterval, refs don't get stale
  const durationRef = useRef(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(-1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(1);
  const [isZoomedToFill, setIsZoomedToFill] = useState(
    props.playerSettings?.resize_mode === "cover",
  );
  const [isReady, setIsReady] = useState(false);
  const initialSeekDone = useRef(false);
  const audioInitialized = useRef(false);
  const subtitleInitialized = useRef(false);

  const handleNextEpisode = () => {
    if (props.onNextEpisode) {
      props.onNextEpisode({
        subtitle_lang:
          textTracks.find((t: any) => t.id === selectedTextTrack)?.lang || "",
        audio_lang:
          audioTracks.find((t: any) => t.id === selectedAudioTrack)?.lang || "",
        resize_mode: isZoomedToFill ? "cover" : "contain",
      });
    }
  };

  // Update playback progress every 5 seconds
  useEffect(() => {
    if (!isReady || paused) return;
    const interval = setInterval(() => {
      // Don't set playback progress if below 5 minutes
      if (currentTimeRef.current > 300) {
        updatePlaybackProgress.mutate({
          id: props.id,
          mediaType: props.mediaType,
          data: {
            season_number: props.seasonNumber,
            episode_number: props.episodeNumber,
            encoded_data: props.encodedData,
            current_progress_seconds: Math.floor(currentTimeRef.current),
            total_duration_seconds: Math.floor(durationRef.current),
            player_settings: {
              player: "exoplayer",
              resize_mode: isZoomedToFill ? "cover" : "contain",
              audio_idx: selectedAudioTrack,
              audio_lang:
                audioTracks.find((t: any) => t.id === selectedAudioTrack)
                  ?.lang || "",
              subtitle_idx: selectedTextTrack,
              subtitle_lang:
                textTracks.find((t: any) => t.id === selectedTextTrack)?.lang ||
                "",
            },
          },
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
    isZoomedToFill,
    selectedAudioTrack,
    selectedTextTrack,
    audioTracks,
    textTracks,
  ]);

  const handleLoad = (data: OnLoadData) => {
    setIsReady(true);
    setDuration(data.duration);
    durationRef.current = data.duration;

    // Seek to start time if provided
    if (props.startTime && !initialSeekDone.current) {
      videoRef.current?.seek(props.startTime);
      currentTimeRef.current = props.startTime;
      initialSeekDone.current = true;
    }
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    currentTimeRef.current = data.currentTime;
  };

  const handleTextTracks = (data: OnTextTracksData) => {
    // Convert react-native-video track format to MPV format for controls compatibility
    // 1-indexed to follow mpv
    const tracks = data.textTracks.map((track) => ({
      id: track.index + 1,
      title: track.title,
      lang: track.language,
      selected: track.index + 1 === selectedTextTrack,
    }));
    setSelectedTextTrack((prev) => {
      if (subtitleInitialized.current) return prev;
      subtitleInitialized.current = true;

      const context = props.playerSettings;
      let targetSub = prev;
      if (context) {
        const { subtitle_idx, subtitle_lang } = context;
        // if streams match continue watching data, use subtitle_idx
        if (
          subtitle_idx !== undefined &&
          subtitle_idx !== -1 &&
          props.streamsMatch &&
          tracks.find((t: any) => t.id === subtitle_idx)
        ) {
          targetSub = subtitle_idx;
        }
        // otherwise fallback to subtitle_lang
        else {
          const matchByLang = tracks.find((t: any) => t.lang === subtitle_lang);
          if (matchByLang) {
            targetSub = matchByLang.id;
          }
        }
      }
      return targetSub;
    });
    setTextTracks(tracks);
  };

  const handleAudioTracks = (data: OnAudioTracksData) => {
    // Convert react-native-video track format to MPV format for controls compatibility
    // 1-indexed to follow mpv
    const tracks = data.audioTracks.map((track) => ({
      id: track.index + 1,
      title: track.title,
      lang: track.language,
      selected: track.index + 1 === selectedAudioTrack,
    }));
    setSelectedAudioTrack((prev) => {
      if (audioInitialized.current) return prev;
      audioInitialized.current = true;

      const context = props.playerSettings;
      let targetAudio = prev;
      if (context) {
        const { audio_idx, audio_lang } = context;
        // if streams match continue watching data, use audio_idx
        if (
          audio_idx !== undefined &&
          audio_idx !== -1 &&
          props.streamsMatch &&
          tracks.find((t: any) => t.id === audio_idx)
        ) {
          targetAudio = audio_idx;
        }
        // otherwise fallback to audio_lang
        else {
          const matchByLang = tracks.find((t: any) => t.lang === audio_lang);
          if (matchByLang) {
            targetAudio = matchByLang.id;
          }
        }
      }
      return targetAudio;
    });
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
            // exoplayer is zero-indexed, but we store one-indexed to fit mpv
            selectedTextTrack === -1
              ? { type: SelectedTrackType.DISABLED }
              : { type: SelectedTrackType.INDEX, value: selectedTextTrack - 1 }
          }
          selectedAudioTrack={
            // exoplayer is zero-indexed, but we store one-indexed to fit mpv
            selectedAudioTrack >= 1
              ? { type: SelectedTrackType.INDEX, value: selectedAudioTrack - 1 }
              : undefined
          }
        />
        {Platform.isTV ? (
          <VideoControlsTV
            videoRef={videoRef as any}
            player={"exoplayer"}
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
            onChangePlayer={props.onChangePlayer}
            hasNextEpisode={props.hasNextEpisode}
            onNextEpisode={handleNextEpisode}
          />
        ) : (
          <VideoControls
            videoRef={videoRef as any}
            player="exoplayer"
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
            onChangePlayer={props.onChangePlayer}
            hasNextEpisode={props.hasNextEpisode}
            onNextEpisode={handleNextEpisode}
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
