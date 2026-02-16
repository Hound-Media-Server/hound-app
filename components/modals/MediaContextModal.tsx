import {
  getAddToCollectionUrl,
  getMediaPageUrl,
  getSelectStreamUrl,
} from "@/utils/navigation";
import { RelativePathString, useRouter } from "expo-router";
import {
  Modal,
  StyleSheet,
  Pressable,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export function MediaItemContextModal({
  mediaItem,
  modalTitle,
  visible,
  setVisible,
  onClose,
}: {
  mediaItem: any;
  modalTitle: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              const mediaPageUrl = getMediaPageUrl(
                mediaItem.media_type,
                mediaItem.media_source,
                mediaItem.source_id,
              );
              router.navigate(mediaPageUrl as RelativePathString);
              setVisible(false);
            }}
          >
            <Text
              style={styles.modalItemText}
            >{`Open ${mediaItem.media_type === "movie" ? "Movie" : "Show"} Page`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              const addToCollectionUrl = getAddToCollectionUrl(
                mediaItem.media_type,
                mediaItem.media_source,
                mediaItem.source_id,
              );
              router.navigate(addToCollectionUrl as RelativePathString);
              setVisible(false);
            }}
          >
            <Text style={styles.modalItemText}>Add to Collection</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

export function WatchEventContextModal({
  mediaItem,
  modalTitle,
  visible,
  setVisible,
  onClose,
}: {
  mediaItem: any;
  modalTitle: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const mediaType = mediaItem.media_type.replace("tvshow", "tv");
  const mediaSourceID = mediaItem.media_source + "-" + mediaItem.source_id;

  async function handlePlay(forceSelect?: boolean) {
    let params: any = {
      id: mediaSourceID,
      type: mediaType,
      title: modalTitle,
    };

    if (mediaItem.watch_action_type === "resume") {
      const wp = mediaItem.watch_progress;
      params = {
        ...params,
        season: wp.season_number,
        episode: wp.episode_number,
        startTime: wp.current_progress_seconds,
        playerSettings: JSON.stringify(wp.player_settings),
      };
    } else if (mediaItem.watch_action_type === "next_episode") {
      const nextEp = mediaItem.next_episode;
      params = {
        ...params,
        season: nextEp.season_number,
        episode: nextEp.episode_number,
      };
    }
    const url = await getSelectStreamUrl(params, forceSelect);
    router.navigate(url as RelativePathString);
    setVisible(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => handlePlay(false)}
          >
            <Text style={styles.modalItemText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => handlePlay(true)}
          >
            <Text style={styles.modalItemText}>Select Stream...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
              const mediaPageUrl = getMediaPageUrl(
                mediaItem.media_type,
                mediaItem.media_source,
                mediaItem.source_id,
              );
              router.navigate(mediaPageUrl as RelativePathString);
              setVisible(false);
            }}
          >
            <Text
              style={styles.modalItemText}
            >{`Open ${mediaItem.media_type === "movie" ? "movie" : "Show"} Page`}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    maxWidth: 460,
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
