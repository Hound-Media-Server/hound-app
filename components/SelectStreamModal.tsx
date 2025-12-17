import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableHighlight,
  Alert,
} from "react-native";
import {
  useMovieProviders,
  useShowProviders,
} from "@/services/providerService";
import React from "react";
import { Link, router } from "expo-router";

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
  if (isLoading) {
    return (
      <View className="w-full h-full bg-primary">
        <Text className="text-white">Loading providers...</Text>
      </View>
    );
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }
  if (!isLoading && providers?.data?.providers[0].streams.length === 0) {
    return <Text>No streams available</Text>;
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
      <View className="flex-1 justify-center items-center opacity-95 bg-white p-4 rounded-lg w-full min-h-10">
        <ScrollView>
          <Text className="text-lg font-bold">Select Stream</Text>
          {providers?.data?.providers[0].streams
            .slice(0, 20)
            .map((stream: any) => (
              <TouchableHighlight
                key={stream.infohash}
                onPress={() => {
                  router.navigate(`/stream/${stream.encoded_data}`);
                  setModalVisible(false);
                }}
                className="mb-10"
              >
                <Text>{stream.file_name}</Text>
              </TouchableHighlight>
            ))}
          <Pressable onPress={() => setModalVisible(!modalVisible)}>
            <Text className="text-lg">Hide Modal</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
