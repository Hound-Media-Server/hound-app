import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getName as getLanguageName } from "@cospired/i18n-iso-languages";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import {
  MpvPlayerViewRef,
  SubtitleTrack,
  AudioTrack,
} from "@/modules/mpv-player";

interface VideoControlsProps {
  videoRef: React.RefObject<MpvPlayerViewRef | null>;
  player: "mpv" | "exoplayer";
  paused: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
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
}

export default function VideoControls({
  videoRef,
  player,
  paused,
  onPlayPause,
  currentTime,
  duration,
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
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
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

  return (
    <>
      <Pressable
        style={styles.overlay}
        onPress={handleScreenPress}
        accessible={false}
      >
        {showControls && (
          <View style={styles.controlsContainer}>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>

              <View style={styles.topBarRight}>
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
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration || 1}
                  value={currentTime}
                  onValueChange={handleSliderChange}
                  onSlidingComplete={handleSliderComplete}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FF6B6B"
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
              </View>
            </View>
          </View>
        )}
      </Pressable>

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
            <Text style={styles.modalItemText}>Player: {player}</Text>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (isZoomedToFill) onChangeResizeMode();
                  setShowSettingsModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Fit to Screen</Text>
                {!isZoomedToFill && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (!isZoomedToFill) onChangeResizeMode();
                  setShowSettingsModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Fill Screen</Text>
                {isZoomedToFill && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>

              {onChangePlayer && (
                <TouchableOpacity
                  style={styles.modalItem}
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
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
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
