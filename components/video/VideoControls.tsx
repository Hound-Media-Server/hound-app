import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getName as getLanguageName } from "@cospired/i18n-iso-languages";
import { useRouter } from "expo-router";
import {
  MpvPlayerViewRef,
  SubtitleTrack,
  AudioTrack,
} from "@/modules/mpv-player";
import { ThemedText } from "../ThemedText";
import { DisplayInfo } from "@/app/stream/[encoded_data]";
import { SegmentAction } from "@/utils/videoSegments";

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
  skipSegment?: SegmentAction | null;
  playbackBusy?: boolean;
  streamData?: any;
}

function SeekBar({
  value,
  max,
  onChange,
  onComplete,
  style,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  onComplete: () => void;
  style?: any;
}) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const width = useRef(0);
  const startX = useRef(0);
  const latest = useRef({ max, onChange, onComplete });
  latest.current = { max, onChange, onComplete };
  const seekTo = (x: number) => {
    if (!width.current) return;
    const ratio = Math.min(Math.max(x / width.current, 0), 1);
    const next = ratio * latest.current.max;
    setDragValue(next);
    latest.current.onChange(next);
  };
  const finish = () => {
    setDragValue(null);
    latest.current.onComplete();
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        startX.current = e.nativeEvent.locationX;
        seekTo(startX.current);
      },
      onPanResponderMove: (_, g) => seekTo(startX.current + g.dx),
      onPanResponderRelease: () => finish(),
      onPanResponderTerminate: () => finish(),
    }),
  ).current;
  return (
    <View
      style={[styles.seekBarTouch, style]}
      onLayout={(e: LayoutChangeEvent) => {
        width.current = e.nativeEvent.layout.width;
      }}
      {...pan.panHandlers}
    >
      <View style={styles.seekBarTrack} pointerEvents="none">
        <View
          style={[
            styles.seekBarFill,
            { width: `${Math.min(((dragValue ?? value) / (max || 1)) * 100, 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}

export default function VideoControls({
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
  skipSegment,
  playbackBusy,
  streamData,
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [renderControls, setRenderControls] = useState(true);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [autoplayCanceled, setAutoplayCanceled] = useState(false);
  const autoplayStarted = useRef(false);
  const router = useRouter();
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (showControls && !paused && !isSeeking) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [showControls, paused, isSeeking]);

  useEffect(() => {
    if (showControls) setRenderControls(true);
  }, [showControls]);

  useEffect(() => {
    if (showControls && !renderControls) return;
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !showControls) setRenderControls(false);
    });
  }, [showControls, renderControls, controlsOpacity]);

  // Autoplay
  const remainingTime = Math.floor(duration - currentTime);
  const showAutoplay =
    autoplayEnabled &&
    duration >= 60 &&
    hasNextEpisode &&
    !autoplayCanceled &&
    !paused &&
    !playbackBusy &&
    !isSeeking &&
    remainingTime <= 5 &&
    remainingTime > 0;

  useEffect(() => {
    if (remainingTime > 5) autoplayStarted.current = false;
    if (showAutoplay && remainingTime <= 1 && !autoplayStarted.current) {
      autoplayStarted.current = true;
      onNextEpisode?.();
    }
  }, [showAutoplay, remainingTime, onNextEpisode]);

  const handleScreenPress = () => {
    setShowControls(!showControls);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

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
  const showSkip =
    !!skipSegment &&
    !playbackBusy &&
    !isSeeking &&
    !isModalOpen &&
    !showAutoplay;
  const skipButton = showSkip && skipSegment && (
    <Pressable
      className="bg-black/40 py-3 px-4 rounded-full"
      style={
        renderControls ? styles.skipButtonInline : styles.skipButtonFloating
      }
      onPress={() => {
        if (skipSegment.nextEpisode) onNextEpisode?.();
        else onSeek(skipSegment.end);
      }}
      focusable
    >
      <ThemedText className="text-white">{skipSegment.label}</ThemedText>
    </Pressable>
  );

  return (
    <>
      <Pressable
        style={styles.overlay}
        onPress={handleScreenPress}
        accessible={false}
      >
        {renderControls && (
          <Animated.View
            style={[styles.controlsContainer, { opacity: controlsOpacity }]}
            pointerEvents={showControls ? "auto" : "none"}
          >
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.topBarRight}>
                {streamData && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowInfoModal(true)}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowSettingsModal(true)}
                >
                  <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              {/* Dummy button to center buttons */}
              {hasNextEpisode && (
                <TouchableOpacity style={styles.placeholderButton} disabled>
                  <Ionicons name="play-skip-forward" size={40} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={onSeekBackward}
              >
                <Ionicons name="play-back" size={40} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.playButton]}
                onPress={onPlayPause}
              >
                <Ionicons
                  name={paused ? "play" : "pause"}
                  size={50}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={onSeekForward}
              >
                <Ionicons name="play-forward" size={40} color="white" />
              </TouchableOpacity>
              {hasNextEpisode && (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={onNextEpisode}
                >
                  <Ionicons name="play-skip-forward" size={40} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
              {skipButton}
              <View style={styles.progressContainer}>
                <Text style={[styles.timeText, styles.currentTimeText]}>
                  {formatTime(currentTime)}
                </Text>
                <SeekBar
                  style={styles.slider}
                  max={duration || 1}
                  value={currentTime}
                  onChange={handleSliderChange}
                  onComplete={handleSliderComplete}
                />
                <Text style={[styles.timeText, styles.durationTimeText]}>
                  {formatTime(duration)}
                </Text>
              </View>

              <View style={styles.bottomButtons}>
                {textTracks.length > 0 && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowSubtitlesModal(true)}
                  >
                    <Ionicons name="chatbox-outline" size={24} color="white" />
                  </TouchableOpacity>
                )}

                {audioTracks.length > 0 && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowAudioModal(true)}
                  >
                    <Ionicons name="volume-high" size={24} color="white" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onChangeResizeMode}
                >
                  <Ionicons
                    name={isZoomedToFill ? "contract" : "expand"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </Pressable>

      {!renderControls && skipButton}

      {/* Autoplay Overlay */}
      {showAutoplay && (
        <View className="absolute top-[15px] right-[15px] bg-black/40 py-3 px-4 rounded-full">
          <View className="flex-row items-center justify-between">
            <Ionicons name="play-skip-forward" size={16} color="white" />
            <ThemedText className="text-white ml-3">
              Next Episode in {Math.ceil(remainingTime)}s
            </ThemedText>
            <Pressable
              onPress={() => setAutoplayCanceled(true)}
              className="bg-white/20 rounded-full"
            >
              <Ionicons name="close" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Subtitles Modal */}
      <Modal
        supportedOrientations={["portrait", "landscape"]}
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
        supportedOrientations={["portrait", "landscape"]}
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
        supportedOrientations={["portrait", "landscape"]}
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInfoModal(false)}
        >
          <TouchableWithoutFeedback>
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
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      {/* Settings Modal */}
      <Modal
        supportedOrientations={["portrait", "landscape"]}
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettingsModal(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Settings</Text>
              <Text style={styles.modalItemText}>Player: {player}</Text>
              <ScrollView>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSeek(0);
                    setShowSettingsModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      Start From Beginning
                    </Text>
                  </View>
                  <Ionicons name="play-skip-back" size={24} color="white" />
                </TouchableOpacity>
                {onChangePlayer && (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      const otherPlayer =
                        player === "mpv" ? "exoplayer" : "mpv";
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
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  bottomBar: {
    padding: 20,
  },
  skipButtonInline: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  skipButtonFloating: {
    position: "absolute",
    right: 20,
    bottom: 20,
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
  seekBarTouch: {
    height: 30,
    justifyContent: "center",
  },
  seekBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  seekBarFill: {
    height: "100%",
    backgroundColor: "white",
  },
  timeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 60,
  },
  currentTimeText: {
    textAlign: "right",
  },
  durationTimeText: {
    textAlign: "left",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
  },
  controlButton: {
    padding: 10,
  },
  placeholderButton: {
    padding: 10,
    opacity: 0,
  },
  playButton: {
    borderRadius: 50,
    padding: 20,
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
