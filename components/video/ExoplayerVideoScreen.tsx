import {
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from "react";
import {
  useUpdatePlaybackProgress,
  PlayerSettings,
} from "@/services/watchDataService";
import Video, {
  ResizeMode,
  SelectedTrackType,
  TextTrackType,
} from "react-native-video";
import type {
  VideoRef,
  OnLoadData,
  OnProgressData,
  OnTextTracksData,
  OnAudioTracksData,
} from "react-native-video";
import VideoControls from "./VideoControls";
import VideoControlsTV from "./VideoControls.tv";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";
import { getAllSettings, SettingsSchema } from "@/stores/settingsStore";
import { get2LetterLangCode } from "@/utils/locale";
import { MediaType } from "@/constants/MediaTypes";
import { DisplayInfo } from "@/app/stream/[encoded_data]";

export default function ExoplayerVideoScreen(props: {
  src: string;
  startTime?: number;
  id: string;
  mediaType: MediaType;
  seasonNumber?: number;
  episodeNumber?: number;
  encodedData: string;
  defaultSubtitleIdx?: number | null;
  defaultAudioIdx?: number | null;
  defaultAudioLang?: string | undefined;
  onTrackChange?: (subtitleIdx: number, audioIdx: number) => void;
  displayInfo?: DisplayInfo;
  playerSettings?: PlayerSettings | null;
  onChangePlayer?: (
    player: "exoplayer" | "mpv",
    currentTime: number,
    settings?: any,
  ) => void;
  hasNextEpisode?: boolean;
  onNextEpisode?: (settings: any) => void;
  autoplayEnabled?: boolean;
  onProgress?: (time: number, duration: number) => void;
  externalSubtitles?: { title: string; lang: string; url: string }[];
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
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(0);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(1);
  const [isZoomedToFill, setIsZoomedToFill] = useState(
    props.playerSettings?.resize_mode === "cover",
  );
  const [isReady, setIsReady] = useState(false);
  const initialSeekDone = useRef(false);
  const audioInitialized = useRef(false);
  const subtitleInitialized = useRef(false);
  const [appSettings] = useState<SettingsSchema>(getAllSettings());

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
      // Don't set playback progress if below 2 minutes
      if (currentTimeRef.current > 120) {
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

  useEffect(() => {
    setIsZoomedToFill(props.playerSettings?.resize_mode === "cover");
  }, [props.playerSettings?.resize_mode]);

  useEffect(() => {
    if (!subtitleInitialized.current || !audioInitialized.current) {
      return;
    }
    props.onTrackChange?.(selectedTextTrack, selectedAudioTrack);
  }, [selectedTextTrack, selectedAudioTrack]);

  const handleLoad = (data: OnLoadData) => {
    // Seek to start time if provided
    if (props.startTime && !initialSeekDone.current) {
      videoRef.current?.seek(props.startTime);
      currentTimeRef.current = props.startTime;
      initialSeekDone.current = true;
    }
    setIsReady(true);
    setDuration(data.duration);
    durationRef.current = data.duration;
  };

  const handleProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    currentTimeRef.current = data.currentTime;
    if (props.onProgress) {
      props.onProgress(data.currentTime, duration);
    }
  };

  /*
    As of react-native-video ver. 6.19.0
    selection by index doesn't seem to work properly,
    text tracks that are in different groups can have the same
    id.
    I've had to patch it manually using patch-packages in the meantime
    to make this work
  */
  const handleTextTracks = (data: OnTextTracksData) => {
    const tracks = data.textTracks.map((track) => ({
      id: track.index + 1,
      title: track.title || `Track ${track.index + 1}`,
      lang: track.language ? get2LetterLangCode(track.language) : undefined,
      selected: track.index + 1 === selectedTextTrack,
    }));
    // patched in upstream instead, previously tracks didn't return all tracks
    // const externalTracks = (props.externalSubtitles || []).map((ext, i) => {
    //   const id = embeddedTracks.length + i + 1;
    //   return {
    //     id: id,
    //     title: ext.title,
    //     lang: ext.lang ? get2LetterLangCode(ext.lang) : undefined,
    //     selected: id === selectedTextTrack,
    //   };
    // });
    // const tracks = [...embeddedTracks, ...externalTracks];
    if (!subtitleInitialized.current) {
      subtitleInitialized.current = true;

      setSelectedTextTrack((prev) => {
        let targetSub = prev;
        if (
          props.defaultSubtitleIdx !== null &&
          props.defaultSubtitleIdx !== undefined &&
          tracks.find((t: any) => t.id === props.defaultSubtitleIdx)
        ) {
          targetSub = props.defaultSubtitleIdx;
        } else {
          // Fall back: match by language from playerSettings or app defaults
          const targetLang =
            props.playerSettings?.subtitle_lang ||
            appSettings?.defaultSubtitleLanguage;
          const matchByLang = tracks.find((t: any) => t.lang === targetLang);
          if (matchByLang) {
            targetSub = matchByLang.id;
          }
        }
        return targetSub;
      });
    }
    setTextTracks((prev) => {
      if (
        prev.length === tracks.length &&
        prev.every(
          (track, idx) =>
            track.id === tracks[idx].id &&
            track.title === tracks[idx].title &&
            track.lang === tracks[idx].lang &&
            track.selected === tracks[idx].selected,
        )
      ) {
        return prev;
      }
      return tracks;
    });
  };

  const handleAudioTracks = (data: OnAudioTracksData) => {
    // Convert react-native-video track format to MPV format for controls compatibility
    // 1-indexed to follow mpv
    // convert iso 3-letter to 2-letter
    const tracks = data.audioTracks.map((track) => ({
      id: track.index + 1,
      title: track.title,
      lang: track.language ? get2LetterLangCode(track.language) : undefined,
      selected: track.index + 1 === selectedAudioTrack,
    }));
    setSelectedAudioTrack((prev) => {
      if (audioInitialized.current) return prev;
      audioInitialized.current = true;

      let targetAudio = prev;

      // Parent supplies a pre-resolved index when streamsMatch was true.
      // Use it directly if the track exists.
      if (
        props.defaultAudioIdx !== null &&
        props.defaultAudioIdx !== undefined &&
        tracks.find((t: any) => t.id === props.defaultAudioIdx)
      ) {
        targetAudio = props.defaultAudioIdx;
      } else {
        // Fall back: match by language from playerSettings or app defaults
        const targetLang =
          props.playerSettings?.audio_lang || props.defaultAudioLang;
        const matchByLang = tracks.find((t: any) => t.lang === targetLang);
        if (matchByLang) {
          targetAudio = matchByLang.id;
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
    props.onTrackChange?.(id, selectedAudioTrack);
  };

  const handleSelectAudioTrack = (id: number) => {
    setSelectedAudioTrack(id);
    props.onTrackChange?.(selectedTextTrack, id);
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
          source={{
            uri: props.src,
            textTracks: props.externalSubtitles?.map((s) => ({
              title: s.title,
              language: s.lang as any,
              type: TextTrackType.VTT,
              uri: s.url + "?convert=vtt",
            })),
          }}
          style={{ width, height }}
          paused={paused}
          resizeMode={isZoomedToFill ? ResizeMode.COVER : ResizeMode.CONTAIN}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onTextTracks={handleTextTracks}
          onAudioTracks={handleAudioTracks}
          onError={handleError}
          progressUpdateInterval={1000}
          subtitleStyle={{
            fontSize: appSettings?.subtitleSize || 24,
            paddingBottom: 0,
          }}
          selectedTextTrack={
            selectedTextTrack === 0
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
            displayInfo={props.displayInfo}
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
            autoplayEnabled={props.autoplayEnabled}
          />
        ) : (
          <VideoControls
            videoRef={videoRef as any}
            player="exoplayer"
            paused={paused}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            displayInfo={props.displayInfo}
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
            autoplayEnabled={props.autoplayEnabled}
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
      <ActivityIndicator size="large" color="white" />
      <ThemedText className="text-white mb-2">Loading Exoplayer...</ThemedText>
    </View>
  );
};
