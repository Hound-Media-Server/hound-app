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
import { MpvPlayerView, MpvPlayerViewRef } from "@/modules/mpv-player";
import VideoControls from "./VideoControls";
import VideoControlsTV from "./VideoControls.tv";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";
import { getAllSettings, SettingsSchema } from "@/stores/settingsStore";
import { get2LetterLangCode } from "@/utils/locale";
import { MediaType } from "@/constants/MediaTypes";
import { DisplayInfo } from "@/app/stream/[encoded_data]";

export default function MPVVideoScreen(props: {
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const videoRef = useRef<MpvPlayerViewRef>(null);
  const updatePlaybackProgress = useUpdatePlaybackProgress();
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState<number>(0);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(1);
  const [isZoomedToFill, setIsZoomedToFill] = useState(
    props.playerSettings?.resize_mode === "cover",
  );
  const [isReady, setIsReady] = useState(false);
  const [appSettings] = useState<SettingsSchema>(getAllSettings());
  const defaultAudioSelected = useRef(false);
  const defaultSubtitleSelected = useRef(false);
  const embeddedTracksCount = useRef<number | null>(null);

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

  useEffect(() => {
    if (!isReady || paused) return;
    const interval = setInterval(async () => {
      try {
        const position = await videoRef.current?.getCurrentPosition();
        const dur = await videoRef.current?.getDuration();

        if (position !== undefined) setCurrentTime(position);
        if (dur !== undefined) setDuration(dur);

        // don't set playback progress if below 2 minutes
        if (position && position > 120) {
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

  useEffect(() => {
    setIsZoomedToFill(props.playerSettings?.resize_mode === "cover");
  }, [props.playerSettings?.resize_mode]);

  useEffect(() => {
    if (!isReady) return;
    const applyResizeMode = async () => {
      try {
        await videoRef.current?.setZoomedToFill(isZoomedToFill);
      } catch (error) {
        console.error("Error applying resize mode:", error);
      }
    };
    applyResizeMode();
  }, [isReady, isZoomedToFill]);

  useEffect(() => {
    if (
      props.onTrackChange &&
      (defaultAudioSelected.current || defaultSubtitleSelected.current)
    ) {
      props.onTrackChange(selectedTextTrack, selectedAudioTrack);
    }
  }, [selectedTextTrack, selectedAudioTrack]);

  useEffect(() => {
    if (!isReady) return;
    const applySubtitleSize = async () => {
      try {
        // different font scale for mpv, this seems to work best for now
        const size = appSettings?.subtitleSize || 24;
        const scale = (720 / windowHeight) * 1.25;
        await videoRef.current?.setSubtitleFontSize(Math.round(size * scale));
      } catch (error) {
        console.error("Error applying subtitle size:", error);
      }
    };
    applySubtitleSize();
  }, [isReady, appSettings?.subtitleSize]);

  const handleLoad = async () => {
    // don't seem to need this yet
  };

  /*
    If external subs are loaded, handleTracksReady() seems to be called twice:
    once with just the embedded subs, second with all subs, including external subs.
    We want to set the subtitle track on the second run or it seems like the first
    subtitle call is ignored/overwritten.

    Tested on Android, need to test on iOS.
  */
  const handleTracksReady = async () => {
    try {
      const subtitles = await videoRef.current?.getSubtitleTracks();
      const audio = await videoRef.current?.getAudioTracks();
      if (subtitles && embeddedTracksCount.current === null) {
        embeddedTracksCount.current = subtitles.length;
      }
      const convertedSubtitles = subtitles?.map((track, index) => {
        let lang = track.lang;
        let title = track.title;
        // If it's an external track, should be at end of list
        const embeddedCount = embeddedTracksCount.current ?? 0;
        if (props.externalSubtitles && index >= embeddedCount) {
          const extSub = props.externalSubtitles[index - embeddedCount];
          if (extSub) {
            lang = extSub.lang;
            title = extSub.title;
          }
        }
        return {
          ...track,
          lang: lang ? get2LetterLangCode(lang) : undefined,
          title: title,
        };
      });

      const convertedAudio = audio?.map((track) => ({
        ...track,
        lang: track.lang ? get2LetterLangCode(track.lang) : undefined,
      }));

      if (convertedSubtitles) setTextTracks(convertedSubtitles);
      if (convertedAudio) setAudioTracks(convertedAudio);

      // Handle Subtitle tracks
      const currentSub = await videoRef.current?.getCurrentSubtitleTrack();
      let targetSub: number | undefined = selectedTextTrack;

      // check if this is the final call after external subs are loaded (if there are any)
      // there might be an issue where props.externalSubtitles have a certain amount of tracks
      // but not all of them are successfully read by mpv, but impact should be minor.
      const externalCount = props.externalSubtitles?.length || 0;
      const hasExternalTracks =
        externalCount > 0 &&
        subtitles &&
        subtitles.length > (embeddedTracksCount.current ?? 0);
      const isComplete = externalCount === 0 || hasExternalTracks;

      console.log("ext", externalCount);
      console.log("converted", convertedSubtitles);

      if (!defaultSubtitleSelected.current) {
        targetSub = currentSub;
        if (
          props.defaultSubtitleIdx !== null &&
          props.defaultSubtitleIdx !== undefined
        ) {
          targetSub = props.defaultSubtitleIdx;
        } else {
          // Fallback, match by language from playerSettings or app defaults
          const targetLang =
            props.playerSettings?.subtitle_lang ||
            appSettings?.defaultSubtitleLanguage;
          const matchByLang = convertedSubtitles?.find(
            (t: any) => t.lang === targetLang,
          );
          if (matchByLang) targetSub = matchByLang.id;
        }
      }

      // in first handleTracksReady() call, it's possible we try to set
      // embedded subs but they're overwritten/not shown, we want to re-apply
      // on second run
      if (targetSub !== undefined && targetSub !== currentSub) {
        const exists =
          convertedSubtitles?.find((t: any) => t.id === targetSub) ||
          targetSub === 0;
        if (exists) {
          if (targetSub === 0) await videoRef.current?.disableSubtitles();
          else await videoRef.current?.setSubtitleTrack(targetSub);
          setSelectedTextTrack(targetSub);
          if (isComplete) defaultSubtitleSelected.current = true;
        }
      } else if (currentSub !== undefined && !defaultSubtitleSelected.current) {
        setSelectedTextTrack(currentSub);
        if (isComplete) defaultSubtitleSelected.current = true;
      }

      // Handle audio tracks
      const currentAudio = await videoRef.current?.getCurrentAudioTrack();
      let targetAudio: number | undefined = selectedAudioTrack;
      if (!defaultAudioSelected.current) {
        targetAudio = currentAudio;
        if (
          props.defaultAudioIdx !== null &&
          props.defaultAudioIdx !== undefined &&
          convertedAudio?.find((t: any) => t.id === props.defaultAudioIdx)
        ) {
          targetAudio = props.defaultAudioIdx;
        } else {
          const targetLang =
            props.playerSettings?.audio_lang || props.defaultAudioLang;
          const matchByLang = convertedAudio?.find(
            (t: any) => t.lang === targetLang,
          );
          if (matchByLang) targetAudio = matchByLang.id;
        }
      }

      if (targetAudio !== undefined && targetAudio !== currentAudio) {
        const exists = convertedAudio?.find((t: any) => t.id === targetAudio);
        if (exists) {
          await videoRef.current?.setAudioTrack(targetAudio);
          setSelectedAudioTrack(targetAudio);
          defaultAudioSelected.current = true;
        }
      } else if (currentAudio !== undefined && !defaultAudioSelected.current) {
        setSelectedAudioTrack(currentAudio);
        defaultAudioSelected.current = true;
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

    if (isReadyToSeek) {
      setIsReady(true);
      // seek to start time
      if (props.startTime) {
        try {
          await videoRef.current?.seekTo(props.startTime);
        } catch (error) {
          console.error("Error seeking to start time:", error);
        }
      }
    }
  };

  const handleProgress = (event: any) => {
    const { position, duration: dur } = event.nativeEvent;
    setCurrentTime(position);
    if (dur) setDuration(dur);
    if (props.onProgress) {
      props.onProgress(position, dur || duration);
    }
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
      if (id === 0) {
        await videoRef.current?.disableSubtitles();
      } else {
        await videoRef.current?.setSubtitleTrack(id);
      }
      setSelectedTextTrack(id);
      props.onTrackChange?.(id, selectedAudioTrack);
    } catch (error) {
      console.error("Error selecting text track:", error);
    }
  };

  const handleSelectAudioTrack = async (id: number) => {
    try {
      await videoRef.current?.setAudioTrack(id);
      setSelectedAudioTrack(id);
      props.onTrackChange?.(selectedTextTrack, id);
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
      <View
        style={{
          width: windowWidth,
          height: windowHeight,
          backgroundColor: "black",
        }}
      >
        <MpvPlayerView
          ref={videoRef}
          source={{
            url: props.src,
            startPosition: props.startTime,
            autoplay: true,
            externalSubtitles: props.externalSubtitles?.map((s) => s.url),
          }}
          style={{ width: windowWidth, height: windowHeight }}
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
            videoRef={videoRef}
            player="mpv"
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
      <ThemedText className="text-white mb-2">Loading MPV...</ThemedText>
    </View>
  );
};
