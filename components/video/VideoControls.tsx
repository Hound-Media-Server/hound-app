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
import Slider from "@react-native-community/slider";
import { VideoRef, TextTrackType } from "react-native-video";

interface VideoControlsProps {
  videoRef: React.RefObject<VideoRef | null>;
  paused: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  textTracks?: Array<{
    index: number;
    title: string;
    language: string;
    type: TextTrackType;
  }>;
  audioTracks?: Array<{
    index: number;
    title: string;
    language: string;
  }>;
  selectedTextTrack?: number;
  selectedAudioTrack?: number;
  onSelectTextTrack: (index: number) => void;
  onSelectAudioTrack: (index: number) => void;
  resizeMode: "contain" | "cover" | "stretch";
  onChangeResizeMode: (mode: "contain" | "cover" | "stretch") => void;
}

export default function VideoControls({
  videoRef,
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
  resizeMode,
  onChangeResizeMode,
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isTVOS = Platform.isTV;

  // Auto-hide controls after 3 seconds of inactivity
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

  const cycleResizeMode = () => {
    const modes: Array<"contain" | "cover" | "stretch"> = [
      "contain",
      "cover",
      "stretch",
    ];
    const currentIndex = modes.indexOf(resizeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onChangeResizeMode(modes[nextIndex]);
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
                onPress={cycleResizeMode}
              >
                <Ionicons name="expand" size={24} color="white" />
                <Text style={styles.smallText}>
                  {resizeMode === "contain"
                    ? "Fit"
                    : resizeMode === "cover"
                      ? "Fill"
                      : "Stretch"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSettingsModal(true)}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
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
                  onSelectTextTrack(-1);
                  setShowSubtitlesModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Off</Text>
                {selectedTextTrack === -1 && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
              {textTracks.map((track) => (
                <TouchableOpacity
                  key={track.index}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelectTextTrack(track.index);
                    setShowSubtitlesModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      {track.language
                        ? track.language.toUpperCase()
                        : "Unknown"}
                    </Text>
                    {track.title && track.title !== track.language && (
                      <Text style={styles.modalItemSubtext}>
                        {track.type
                          ? `${track.type.split("/").pop()?.toUpperCase()} • `
                          : ""}
                        {track.title}
                      </Text>
                    )}
                    {(!track.title || track.title === track.language) &&
                      track.type && (
                        <Text style={styles.modalItemSubtext}>
                          {track.type.split("/").pop()?.toUpperCase()}
                        </Text>
                      )}
                  </View>
                  {selectedTextTrack === track.index && (
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
                  key={track.index}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelectAudioTrack(track.index);
                    setShowAudioModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemText}>
                      {track.language
                        ? track.language.toUpperCase()
                        : "Unknown"}
                    </Text>
                    {track.title && track.title !== track.language && (
                      <Text style={styles.modalItemSubtext}>{track.title}</Text>
                    )}
                  </View>
                  {selectedAudioTrack === track.index && (
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
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onChangeResizeMode("contain");
                  setShowSettingsModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Fit to Screen</Text>
                {resizeMode === "contain" && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onChangeResizeMode("cover");
                  setShowSettingsModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Fill Screen</Text>
                {resizeMode === "cover" && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onChangeResizeMode("stretch");
                  setShowSettingsModal(false);
                }}
              >
                <Text style={styles.modalItemText}>Stretch</Text>
                {resizeMode === "stretch" && (
                  <Ionicons name="checkmark" size={24} color="#FF6B6B" />
                )}
              </TouchableOpacity>
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
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
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
