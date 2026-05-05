import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
  useTVEventHandler,
  HWEvent,
  TVFocusGuideView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getName as getLanguageName } from "@cospired/i18n-iso-languages";
import Slider from "@react-native-community/slider";
import {
  MpvPlayerViewRef,
  SubtitleTrack,
  AudioTrack,
} from "@/modules/mpv-player";
import { ThemedText } from "../ThemedText";
import { DisplayInfo } from "@/app/stream/[encoded_data]";

interface VideoControlsProps {
  videoRef: React.RefObject<MpvPlayerViewRef | null>;
  player: "mpv" | "exoplayer";
  paused: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  displayInfo?: DisplayInfo;
  onSeek: (time: number) => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  textTracks?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  selectedTextTrack?: number;
  selectedAudioTrack?: number;
  onSelectTextTrack: (id: number) => void;
  onSelectAudioTrack: (id: number) => void;
  isZoomedToFill: boolean;
  onChangeResizeMode: () => void;
  onChangePlayer?: (
    player: "exoplayer" | "mpv",
    currentTime: number,
    settings?: any,
  ) => void;
  hasNextEpisode?: boolean;
  onNextEpisode?: () => void;
  autoplayEnabled?: boolean;
  streamData?: any;
}

export default function VideoControlsTV({
  videoRef,
  player,
  paused,
  onPlayPause,
  currentTime,
  duration,
  displayInfo,
  onSeek,
  onSeekForward,
  onSeekBackward,
  textTracks = [],
  audioTracks = [],
  selectedTextTrack,
  selectedAudioTrack,
  onSelectTextTrack,
  onSelectAudioTrack,
  isZoomedToFill,
  onChangeResizeMode,
  onChangePlayer,
  hasNextEpisode,
  onNextEpisode,
  autoplayEnabled,
  streamData,
}: VideoControlsProps) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sliderFocused, setSliderFocused] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [autoplayCanceled, setAutoplayCanceled] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const hideControlsTimeoutRef = useRef<any>(null);
  const controlsOpenTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (!paused) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  }, [paused]);

  useEffect(() => {
    controlsOpenTimer();
  }, [controlsOpenTimer]);

  // Animate fade in/out
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: controlsVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [controlsVisible, fadeAnim]);

  // detect d-pad input
  const myTVEventHandler = (evt: HWEvent) => {
    const { eventType } = evt;
    if (eventType === "playPause") {
      onPlayPause();
    }
    if (
      [
        "playPause",
        "select",
        "up",
        "down",
        "left",
        "right",
        "longLeft",
        "longRight",
      ].includes(eventType)
    ) {
      controlsOpenTimer();
    }

    if (!controlsVisible) return;

    switch (eventType) {
      case "left":
        if (sliderFocused) {
          onSeekBackward();
        }
        break;
      case "right":
        if (sliderFocused) {
          onSeekForward();
        }
        break;
      case "select":
        if (sliderFocused) {
          onPlayPause();
        }
        break;
      default:
        break;
    }
  };

  useTVEventHandler(myTVEventHandler);

  // Autoplay
  const remainingTime = Math.floor(duration - currentTime);
  const showAutoplay =
    autoplayEnabled &&
    hasNextEpisode &&
    !autoplayCanceled &&
    remainingTime <= 5 &&
    remainingTime > 0;

  useEffect(() => {
    if (showAutoplay && remainingTime <= 1) {
      onNextEpisode?.();
    }
  }, [showAutoplay, remainingTime, onNextEpisode]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (value: number) => {
    setIsSeeking(true);
    onSeek(value);
  };

  const handleSliderComplete = () => {
    setIsSeeking(false);
  };

  const isModalOpen =
    showSubtitlesModal || showAudioModal || showInfoModal || showSettingsModal;

  return (
    <View style={styles.overlay}>
      {!controlsVisible && (
        <View
          focusable
          hasTVPreferredFocus={!controlsVisible && !isModalOpen}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Animated.View
        style={[styles.controlsContainer, { opacity: fadeAnim }]}
        pointerEvents={controlsVisible ? "auto" : "none"}
      >
        {/* Display Info (title) */}
        {displayInfo && (
          <View className="absolute top-5 left-5 h-20">
            <ThemedText className="text-white text-xl">
              {displayInfo?.title}
            </ThemedText>
            <ThemedText className="text-gray-300 text-lg">
              {displayInfo?.subtitle}
            </ThemedText>
          </View>
        )}
        <View style={styles.bottomBar}>
          {/* Slider */}
          <TVFocusGuideView
            style={styles.progressContainer}
            autoFocus
            trapFocusUp
            trapFocusLeft
            trapFocusRight
          >
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View
              focusable
              onFocus={() => setSliderFocused(true)}
              onBlur={() => setSliderFocused(false)}
              style={styles.slider}
              className="rounded-full focus:bg-black/20"
            >
              <Slider
                className="h-10"
                minimumValue={0}
                maximumValue={duration || 1}
                value={currentTime}
                onValueChange={handleSliderChange}
                onSlidingComplete={handleSliderComplete}
                minimumTrackTintColor={
                  sliderFocused ? "#FF6B6B" : "rgba(255,255,255,0.5)"
                }
                maximumTrackTintColor={
                  sliderFocused
                    ? "rgba(255,255,255,1)"
                    : "rgba(255,255,255,0.5)"
                }
                thumbTintColor={
                  sliderFocused ? "#FF6B6B" : "rgba(255,255,255,1)"
                }
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </TVFocusGuideView>
          {/* Control Buttons */}
          <TVFocusGuideView
            className="flex flex-row justify-between items-center mt-2"
            autoFocus
            trapFocusLeft
            trapFocusRight
            trapFocusDown
          >
            <View className="flex-row items-center gap-2">
              <FocusablePressable focusable onPress={onSeekBackward}>
                <Ionicons name="play-back" size={25} color="white" />
              </FocusablePressable>
              <FocusablePressable
                focusable
                onPress={onPlayPause}
                hasTVPreferredFocus={controlsVisible && !isModalOpen}
              >
                <Ionicons
                  name={paused ? "play" : "pause"}
                  size={25}
                  color="white"
                />
              </FocusablePressable>
              <FocusablePressable focusable onPress={onSeekForward}>
                <Ionicons name="play-forward" size={25} color="white" />
              </FocusablePressable>
              {hasNextEpisode && (
                <FocusablePressable focusable onPress={onNextEpisode}>
                  <Ionicons name="play-skip-forward" size={25} color="white" />
                </FocusablePressable>
              )}
            </View>

            <View className="flex flex-row items-center gap-2">
              {textTracks.length > 0 && (
                <FocusablePressable
                  focusable
                  onPress={() => setShowSubtitlesModal(true)}
                >
                  <Ionicons name="chatbox-outline" size={24} color="white" />
                </FocusablePressable>
              )}

              {audioTracks.length > 0 && (
                <FocusablePressable
                  focusable
                  onPress={() => setShowAudioModal(true)}
                >
                  <Ionicons name="volume-high" size={24} color="white" />
                </FocusablePressable>
              )}

              <FocusablePressable
                focusable
                style={styles.iconButton}
                onPress={onChangeResizeMode}
              >
                <Ionicons
                  name={isZoomedToFill ? "contract" : "expand"}
                  size={24}
                  color="white"
                />
              </FocusablePressable>

              <FocusablePressable
                focusable
                style={styles.iconButton}
                onPress={() => setShowInfoModal(true)}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="white"
                />
              </FocusablePressable>

              <FocusablePressable
                focusable
                style={styles.iconButton}
                onPress={() => setShowSettingsModal(true)}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </FocusablePressable>
            </View>
          </TVFocusGuideView>
        </View>
      </Animated.View>

      {/* Autoplay Overlay */}
      {showAutoplay && (
        <View className="absolute top-[15px] right-[15px] bg-black/40 py-3 px-4 rounded-full">
          <View className="flex-row items-center justify-between">
            <Ionicons name="play-skip-forward" size={16} color="white" />
            <ThemedText className="text-white ml-3">
              Next Episode in {Math.ceil(remainingTime)}s
            </ThemedText>
            {/* <FocusablePressable
              focusable
              onPress={() => setAutoplayCanceled(true)}
              className="bg-white/20 rounded-full"
            >
              <Ionicons name="close" size={20} color="white" />
            </FocusablePressable> */}
          </View>
        </View>
      )}

      {/* Subtitles Modal */}
      <Modal
        visible={showSubtitlesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubtitlesModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubtitlesModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Subtitles</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelectTextTrack(0);
                  setShowSubtitlesModal(false);
                }}
                focusable
                hasTVPreferredFocus={
                  showSubtitlesModal && selectedTextTrack === 0
                }
              >
                <Text style={styles.modalItemText}>Off</Text>
                {selectedTextTrack === 0 && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
              {textTracks.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelectTextTrack(track.id);
                    setShowSubtitlesModal(false);
                  }}
                  focusable
                  hasTVPreferredFocus={
                    showSubtitlesModal && selectedTextTrack === track.id
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      {track.lang
                        ? getLanguageName(track.lang, "en")
                        : "Unknown"}
                    </Text>
                    {track.title && track.title !== track.lang && (
                      <Text style={styles.modalItemSubtext}>{track.title}</Text>
                    )}
                  </View>
                  {selectedTextTrack === track.id && (
                    <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Audio Track Modal */}
      <Modal
        visible={showAudioModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAudioModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAudioModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Audio Track</Text>
            <ScrollView>
              {audioTracks.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelectAudioTrack(track.id);
                    setShowAudioModal(false);
                  }}
                  focusable
                  hasTVPreferredFocus={
                    showAudioModal && selectedAudioTrack === track.id
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      {track.lang
                        ? getLanguageName(track.lang, "en")
                        : "Unknown"}
                    </Text>
                    {track.title && track.title !== track.lang && (
                      <Text style={styles.modalItemSubtext}>{track.title}</Text>
                    )}
                    {track.codec && (
                      <Text style={styles.modalItemSubtext}>
                        {track.codec.toUpperCase()}
                        {track.channels ? ` • ${track.channels}ch` : ""}
                      </Text>
                    )}
                  </View>
                  {selectedAudioTrack === track.id && (
                    <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stream Info</Text>
            <ScrollView>
              {streamData && (
                <>
                  <Text className="text-gray-200 text-lg">
                    {streamData.title}
                  </Text>
                  <Text className="text-gray-500">
                    {streamData.description}
                  </Text>
                  <Text className="text-gray-300">
                    Provider: {streamData.provider_profile_name}
                  </Text>
                  <Text className="text-gray-300">
                    Protocol: {streamData.stream_protocol}
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <ScrollView>
              {onChangePlayer && (
                <TouchableOpacity
                  style={styles.modalItem}
                  focusable
                  hasTVPreferredFocus={showSettingsModal}
                  onPress={() => {
                    const otherPlayer = player === "mpv" ? "exoplayer" : "mpv";
                    onChangePlayer(otherPlayer, currentTime, {
                      subtitle_idx: selectedTextTrack,
                      audio_idx: selectedAudioTrack,
                      resize_mode: isZoomedToFill ? "cover" : "contain",
                    });
                    setShowSettingsModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      Switch to {player === "mpv" ? "ExoPlayer" : "MPV"}
                    </Text>
                  </View>
                  <Ionicons name="swap-horizontal" size={24} color="white" />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const FocusablePressable = ({ children, ...props }: any) => {
  return (
    <Pressable {...props} className="p-2 focus:bg-white/20 rounded-full">
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  iconButton: {
    padding: 10,
    alignItems: "center",
  },
  smallText: {
    color: "white",
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
    maxHeight: "70%",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalItemSubtext: {
    color: "#999",
    fontSize: 14,
    marginTop: 2,
  },
});
