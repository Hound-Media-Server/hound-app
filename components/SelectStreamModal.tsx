import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useMovieProviders,
  useShowProviders,
} from "@/services/providerService";
import React from "react";
import { router } from "expo-router";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";

export default function SelectStreamModal({
  id,
  mediaType,
  seasonNumber,
  episodeNumber,
  modalVisible,
  setModalVisible,
}: {
  id: string;
  mediaType: string;
  seasonNumber?: number;
  episodeNumber?: number;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) {
  if (mediaType != "movie" && mediaType != "tv") {
    Alert.alert("Invalid media type");
    return;
  }
  const {
    data: providers,
    isLoading,
    error,
  } = mediaType === "movie"
    ? useMovieProviders(id, modalVisible)
    : useShowProviders(id, modalVisible, seasonNumber, episodeNumber);
  if (error) {
    Alert.alert("Error", error.message);
    setModalVisible(false);
  }
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <ScrollView className="p-5 bg-primary opacity-95">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText className="text-xl text-white">Select Stream</ThemedText>
          <Pressable onPress={() => setModalVisible(false)} className="p-1">
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>
        {isLoading ? (
          <ActivityIndicator color="white" size="large" className="mt-10" />
        ) : (
          <View>
            {providers?.data?.providers[0]?.streams?.length > 0 ? (
              <View>
                {providers?.data?.providers[0]?.streams.map((stream: any) => (
                  <TouchableHighlight
                    key={stream.info_hash}
                    onPress={() => {
                      router.navigate(`/stream/${stream.encoded_data}`);
                      setModalVisible(false);
                    }}
                  >
                    <View className="bg-slate-800 mb-2 rounded-lg p-3">
                      <ThemedText className="text-white text-[16px] mb-1">
                        {stream.title}
                      </ThemedText>
                      <ThemedText className="text-gray-300">
                        {stream.description}
                      </ThemedText>
                    </View>
                  </TouchableHighlight>
                ))}
              </View>
            ) : (
              <ThemedText className="text-white text-lg">
                No streams available
              </ThemedText>
            )}
          </View>
        )}
      </ScrollView>
    </Modal>
  );
}
