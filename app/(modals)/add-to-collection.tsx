import { ThemedText } from "@/components/ThemedText";
import {
  useAllCollections,
  useAddToCollection,
} from "@/services/collectionService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Toast } from "toastify-react-native";
import {
  View,
  ScrollView,
  TouchableHighlight,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";

export default function AddToCollectionScreen() {
  const { data, isLoading, error } = useAllCollections();
  const { mutate, isPending } = useAddToCollection();
  const { media_type, media_source, source_id } = useLocalSearchParams<{
    media_type: string;
    media_source: string;
    source_id: string;
  }>();
  const handleAddToCollection = (collectionId: number | string) => {
    if (!media_type || !media_source || !source_id) {
      Toast.error("Invalid media params, contact developer");
      return;
    }
    mutate(
      {
        collectionId,
        payload: {
          media_type: media_type as any,
          media_source,
          source_id,
        },
      },
      {
        onSuccess: () => {
          Toast.success("Item added to collection");
          router.back();
        },
        onError: (error: any) => {
          if (error?.status === 409) {
            Toast.error("Item already exists in collection");
          } else {
            Toast.error(error?.message || "Failed to add to collection");
          }
          router.back();
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <ScrollView className="p-5 opacity-95">
        <View className="flex-row justify-between items-center mb-4 mt-6">
          <View>
            <ThemedText className="text-xl text-white">
              Add to Collection
            </ThemedText>
          </View>
          {!Platform.isTV && (
            <Pressable onPress={() => router.back()} className="p-1">
              <Ionicons name="close" size={28} color="white" />
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color="white" size="large" className="mt-10" />
        ) : (
          <View>
            {data?.map((collection: any, index: number) => (
              <View key={collection.collection_id} className="mb-4">
                <Pressable
                  disabled={isPending}
                  className={`bg-white/10 p-3 rounded-xl active:bg-white/20 border-2 focus:border-white ${isPending ? "opacity-50" : ""}`}
                  onPress={() =>
                    handleAddToCollection(collection.collection_id)
                  }
                  focusable={Platform.isTV}
                  hasTVPreferredFocus={Platform.isTV && index === 0}
                >
                  <View className="flex-row justify-between items-center">
                    <ThemedText className="text-white text-lg">
                      {collection.collection_title}
                    </ThemedText>
                    {/* {isPending && (
                      <ActivityIndicator color="white" size="small" />
                    )} */}
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
