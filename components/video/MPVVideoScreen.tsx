import { useWindowDimensions, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { updatePlaybackProgress } from "@/services/watchDataService";
import { MpvPlayerView, MpvPlayerViewRef } from "@/modules/mpv-player";
import MPVVideoControls from "./MPVVideoControls";

export default function MPVVideoScreen(props: {
  src: string;
  startTime?: number;
  id: string;
  mediaType: "movie" | "tv";
  seasonNumber?: number;
  episodeNumber?: number;
  encodedData: string;
}) {
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<MpvPlayerViewRef>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(-1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(1);
  const [isZoomedToFill, setIsZoomedToFill] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Progress tracking interval
  useEffect(() => {
    if (!isReady || paused) return;

    const interval = setInterval(async () => {
      try {
        const position = await videoRef.current?.getCurrentPosition();
        const dur = await videoRef.current?.getDuration();

        if (position !== undefined) setCurrentTime(position);
        if (dur !== undefined) setDuration(dur);

        // 5 minute grace period before tracking
        if (position && position > 300) {
          updatePlaybackProgress(props.id, props.mediaType, {
            season_number: props.seasonNumber,
            episode_number: props.episodeNumber,
            encoded_data: props.encodedData,
            current_progress_seconds: Math.floor(position),
            total_duration_seconds: Math.floor(dur || 0),
          }).catch((err) => {
            console.error("Failed to update playback progress:", err);
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
  ]);

  const handleLoad = async () => {
    setIsReady(true);

    // Get initial duration
    try {
      const dur = await videoRef.current?.getDuration();
      if (dur) setDuration(dur);
    } catch (error) {
      console.error("Error getting duration:", error);
    }
  };

  const handleTracksReady = async () => {
    try {
      const subtitles = await videoRef.current?.getSubtitleTracks();
      const audio = await videoRef.current?.getAudioTracks();

      if (subtitles) setTextTracks(subtitles);
      if (audio) setAudioTracks(audio);

      // Get current selections
      const currentSub = await videoRef.current?.getCurrentSubtitleTrack();
      const currentAudio = await videoRef.current?.getCurrentAudioTrack();

      if (currentSub !== undefined) setSelectedTextTrack(currentSub);
      if (currentAudio !== undefined) setSelectedAudioTrack(currentAudio);
    } catch (error) {
      console.error("Error getting tracks:", error);
    }
  };

  const handlePlaybackStateChange = async (event: any) => {
    const { isPaused, isReadyToSeek } = event.nativeEvent;

    if (isPaused !== undefined) {
      setPaused(isPaused);
    }

    // Seek to start time when ready
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

  const handleError = (event: any) => {
    console.error("MPV Player error:", event.nativeEvent.error);
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
        <MPVVideoControls
          videoRef={videoRef}
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
      </View>
    </>
  );
}
