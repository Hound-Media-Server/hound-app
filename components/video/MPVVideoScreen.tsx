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
import { MpvPlayerView, MpvPlayerViewRef } from "@/modules/mpv-player";
import VideoControls from "./VideoControls";
import VideoControlsTV from "./VideoControls.tv";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";

export default function MPVVideoScreen(props: {
  src: string;
  startTime?: number;
  id: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number;
  episodeNumber?: number;
  encodedData: string;
  streamsMatch: boolean;
  playerSettings?: PlayerSettings | null;
  onChangePlayer?: (
    player: "exoplayer" | "mpv",
    currentTime: number,
    settings?: any,
  ) => void;
}) {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<MpvPlayerViewRef>(null);
  const updatePlaybackProgress = useUpdatePlaybackProgress();
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(-1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(1);
  const [isZoomedToFill, setIsZoomedToFill] = useState(
    props.playerSettings?.resize_mode === "cover",
  );
  const [isReady, setIsReady] = useState(false);
  const tracksInitialized = useRef(false);

  useEffect(() => {
    if (!isReady || paused) return;

    const interval = setInterval(async () => {
      try {
        const position = await videoRef.current?.getCurrentPosition();
        const dur = await videoRef.current?.getDuration();

        if (position !== undefined) setCurrentTime(position);
        if (dur !== undefined) setDuration(dur);

        // don't set playback progress if below 5 minutes
        if (position && position > 300) {
          updatePlaybackProgress.mutate({
            id: props.id,
            mediaType: props.mediaType,
            data: {
              season_number: props.seasonNumber,
              episode_number: props.episodeNumber,
              encoded_data: props.encodedData,
              current_progress_seconds: Math.floor(position),
              total_duration_seconds: Math.floor(dur || 0),
              player_settings: {
                player: "mpv",
                resize_mode: isZoomedToFill ? "cover" : "contain",
                audio_idx: selectedAudioTrack,
                audio_lang:
                  audioTracks.find((t: any) => t.id === selectedAudioTrack)
                    ?.lang || "",
                subtitle_idx: selectedTextTrack,
                subtitle_lang:
                  textTracks.find((t: any) => t.id === selectedTextTrack)
                    ?.lang || "",
              },
            },
          });
        }
      } catch (error) {
        console.error("Error getting playback position:", error);
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

  const handleLoad = async () => {
    // seems like current implementation triggers onReady faster
    // than expected, duration/etc. not available yet
    try {
      const dur = await videoRef.current?.getDuration();
      setIsReady(true);
      if (dur) setDuration(dur);
    } catch (error) {
      setIsReady(true);
      console.error("Error getting duration:", error);
    }
  };

  const handleTracksReady = async () => {
    try {
      const subtitles = await videoRef.current?.getSubtitleTracks();
      const audio = await videoRef.current?.getAudioTracks();

      if (subtitles) setTextTracks(subtitles);
      if (audio) setAudioTracks(audio);

      const currentSub = await videoRef.current?.getCurrentSubtitleTrack();
      const currentAudio = await videoRef.current?.getCurrentAudioTrack();

      let targetSub = currentSub;
      let targetAudio = currentAudio;

      if (tracksInitialized.current) return;
      tracksInitialized.current = true;

      if (props.playerSettings) {
        const { player, subtitle_idx, subtitle_lang, audio_idx, audio_lang } =
          props.playerSettings;
        console.log("player settings");
        console.log(props.playerSettings);

        // if streams match continue watching data, use subtitle_idx
        if (
          subtitle_idx !== undefined &&
          subtitle_idx !== -1 &&
          props.streamsMatch &&
          subtitles?.find((t: any) => t.id === subtitle_idx)
        ) {
          targetSub = subtitle_idx;
        }
        // otherwise fallback to subtitle_lang
        else {
          const matchByLang = subtitles?.find(
            (t: any) => t.lang === subtitle_lang,
          );
          if (matchByLang) {
            targetSub = matchByLang.id;
          }
        }

        if (
          audio &&
          (selectedAudioTrack === 1 || selectedAudioTrack === undefined)
        ) {
          // if streams match continue watching data, use audio_idx
          if (
            audio_idx !== undefined &&
            audio_idx !== -1 &&
            props.streamsMatch &&
            audio.find((t: any) => t.id === audio_idx)
          ) {
            targetAudio = audio_idx;
          }
          // otherwise fallback to audio_lang
          else {
            const matchByLang = audio.find((t: any) => t.lang === audio_lang);
            if (matchByLang) {
              targetAudio = matchByLang.id;
            }
          }
        }
      }

      if (targetSub !== undefined && targetSub !== currentSub) {
        if (targetSub === -1) {
          await videoRef.current?.disableSubtitles();
        } else {
          await videoRef.current?.setSubtitleTrack(targetSub);
        }
        setSelectedTextTrack(targetSub);
      } else if (currentSub !== undefined) {
        setSelectedTextTrack(currentSub);
      }
      if (targetAudio !== undefined && targetAudio !== currentAudio) {
        await videoRef.current?.setAudioTrack(targetAudio);
        setSelectedAudioTrack(targetAudio);
      } else if (currentAudio !== undefined) {
        setSelectedAudioTrack(currentAudio);
      }
    } catch (error) {
      console.error("Error getting tracks:", error);
    }
  };

  const handlePlaybackStateChange = async (event: any) => {
    const { isPaused, isReadyToSeek } = event.nativeEvent;

    if (isPaused !== undefined) {
      setPaused(isPaused);
    }

    // seek to start time
    if (isReadyToSeek && props.startTime) {
      try {
        await videoRef.current?.seekTo(props.startTime);
      } catch (error) {
        console.error("Error seeking to start time:", error);
      }
    }
  };

  const handleProgress = (event: any) => {
    const { position, duration: dur } = event.nativeEvent;
    setCurrentTime(position);
    if (dur) setDuration(dur);
  };

  const handleError = (error: any) => {
    console.error("MPV Video Player error:", error);

    let errorMessage = "An unknown MPV error occurred.";
    if (typeof error === "string") {
      errorMessage = error;
    } else if (error?.nativeEvent?.error) {
      errorMessage = error.nativeEvent.error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }

    Alert.alert("MPV Player Error", `${errorMessage}`, [
      {
        text: "OK",
        onPress: () => router.back(),
        style: "cancel",
      },
    ]);
  };

  const handlePlayPause = async () => {
    try {
      if (paused) {
        await videoRef.current?.play();
      } else {
        await videoRef.current?.pause();
      }
      setPaused(!paused);
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const handleSeek = async (time: number) => {
    try {
      await videoRef.current?.seekTo(time);
      setCurrentTime(time);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const handleSeekForward = async () => {
    try {
      await videoRef.current?.seekBy(10);
    } catch (error) {
      console.error("Error seeking forward:", error);
    }
  };

  const handleSeekBackward = async () => {
    try {
      await videoRef.current?.seekBy(-10);
    } catch (error) {
      console.error("Error seeking backward:", error);
    }
  };

  const handleSelectTextTrack = async (id: number) => {
    try {
      if (id === -1) {
        await videoRef.current?.disableSubtitles();
      } else {
        await videoRef.current?.setSubtitleTrack(id);
      }
      setSelectedTextTrack(id);
    } catch (error) {
      console.error("Error selecting text track:", error);
    }
  };

  const handleSelectAudioTrack = async (id: number) => {
    try {
      await videoRef.current?.setAudioTrack(id);
      setSelectedAudioTrack(id);
    } catch (error) {
      console.error("Error selecting audio track:", error);
    }
  };

  const handleChangeResizeMode = async () => {
    try {
      const newZoomed = !isZoomedToFill;
      await videoRef.current?.setZoomedToFill(newZoomed);
      setIsZoomedToFill(newZoomed);
    } catch (error) {
      console.error("Error changing resize mode:", error);
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
      <View style={{ width, height, backgroundColor: "black" }}>
        <MpvPlayerView
          ref={videoRef}
          source={{
            url: props.src,
            // url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            startPosition: props.startTime,
            autoplay: true,
          }}
          style={{ width, height }}
          onLoad={handleLoad}
          onPlaybackStateChange={handlePlaybackStateChange}
          onProgress={handleProgress}
          onError={handleError}
          onTracksReady={handleTracksReady}
        />
        {Platform.isTV ? (
          <VideoControlsTV
            videoRef={videoRef}
            player="mpv"
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
          />
        ) : (
          <VideoControls
            videoRef={videoRef}
            player="mpv"
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
      <ThemedText className="text-white mb-2">Loading MPV...</ThemedText>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
};
