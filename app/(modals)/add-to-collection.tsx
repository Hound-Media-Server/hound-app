import { ThemedText } from "@/components/ThemedText";
import { useCollections } from "@/services/collectionService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  ScrollView,
  TouchableHighlight,
  ActivityIndicator,
  Pressable,
} from "react-native";

export default function AddToCollectionScreen() {
  const { data, isLoading, error } = useCollections();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  return (
    <View className="flex-1 bg-primary">
      <ScrollView className="p-5 opacity-95">
        <View className="flex-row justify-between items-center mb-4 mt-6">
          <View>
            <ThemedText className="text-xl text-white">
              Add to Collection
            </ThemedText>
          </View>
          <Pressable onPress={() => router.back()} className="p-1">
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator color="white" size="large" className="mt-10" />
        ) : (
          <View>
            {data?.map((collection: any) => (
              <View key={collection.collection_id} className="mb-4">
                <TouchableHighlight
                  underlayColor="#1e293b"
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700"
                  onPress={() => {}}
                >
                  <ThemedText className="text-white text-lg">
                    {collection.collection_title}
                  </ThemedText>
                </TouchableHighlight>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
