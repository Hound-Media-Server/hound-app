import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableHighlight,
} from "react-native";
import {
  useMovieProviders,
  useShowProviders,
} from "@/services/providerService";
import React from "react";
import { Link, router } from "expo-router";

export default function SelectStreamModal({
  id,
  media_type,
  season_number,
  episode_number,
  modalVisible,
  setModalVisible,
}: {
  id: string;
  media_type: string;
  season_number?: number;
  episode_number?: number;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}) {
  const {
    data: providers,
    isLoading,
    error,
  } = media_type === "movie"
    ? useMovieProviders(id, modalVisible)
    : useShowProviders(id, modalVisible);
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
      <View className="flex-1 justify-center items-center opacity-95">
        <View className="bg-white p-4 rounded-lg w-full min-h-10">
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
          </ScrollView>
          <Pressable onPress={() => setModalVisible(!modalVisible)}>
            <Text className="text-lg">Hide Modal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
