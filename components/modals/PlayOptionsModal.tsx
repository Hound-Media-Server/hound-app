import { RelativePathString, useRouter } from "expo-router";
import { ContextModal, ModalAction } from "./Modal";
import { getSelectStreamUrl, StreamUrlParams } from "@/utils/navigation";
import {
  useAddWatchHistory,
  useCreateRewatch,
} from "@/services/watchDataService";
import { Toast } from "toastify-react-native";
import { MediaTypeTVShow } from "@/constants/MediaTypes";
import { useModalStore } from "@/stores/modalStore";

export default function PlayOptionsModal({
  mediaItem,
  modalTitle,
  visible,
  onClose,
  autoFocus,
  showRewatch = false,
}: {
  mediaItem: any;
  modalTitle: string;
  visible: boolean;
  onClose: () => void;
  autoFocus?: boolean;
  showRewatch?: boolean;
}) {
  const router = useRouter();
  const openModal = useModalStore((s) => s.open);
  const { mutate: addHistory, isPending: isAddingHistory } =
    useAddWatchHistory();
  const { mutateAsync: rewatchMutation, isPending: isCreatingRewatch } =
    useCreateRewatch();

  if (!mediaItem) return null;
  const targetSeason =
    mediaItem?.season_number ||
    mediaItem.watch_progress?.season_number ||
    mediaItem.next_episode?.season_number ||
    1;
  const targetEpisode =
    mediaItem.episode_number ||
    mediaItem.watch_progress?.episode_number ||
    mediaItem.next_episode?.episode_number ||
    1;

  async function handleMarkAsWatched() {
    if (isAddingHistory) return;
    const mediaType = mediaItem.media_type || "";
    const mediaSourceID = mediaItem.media_source + "-" + mediaItem.source_id;
    const payload: any = {
      action_type: "watch",
    };

    if (mediaType === MediaTypeTVShow) {
      payload.season_number = targetSeason;
      payload.episode_number = targetEpisode;
    }

    addHistory(
      {
        id: mediaSourceID,
        mediaType: mediaType as any,
        data: payload,
      },
      {
        onSuccess: () => {
          Toast.success("Marked as watched");
          onClose();
        },
        onError: (error: any) => {
          Toast.error(error?.message || "Failed to mark as watched");
        },
      },
    );
  }

  async function handlePlay(forceSelect?: boolean) {
    const mediaType = mediaItem.media_type || mediaItem.type || "";
    const mediaSourceID = mediaItem.source_id
      ? mediaItem.media_source + "-" + mediaItem.source_id
      : mediaItem.id;

    let params: StreamUrlParams = {
      mediaType: mediaType,
      id: mediaSourceID,
      modalTitle: modalTitle,
      startTime: 0,
    };

    if (mediaType === MediaTypeTVShow) {
      params.season = targetSeason;
      params.episode = targetEpisode;
    }

    // Handle watch progress if available
    const wp = mediaItem.watch_progress;
    if (wp) {
      params.startTime = wp.current_progress_seconds;
      params.playerSettings = JSON.stringify(wp.player_settings);
    } else if (
      mediaType === MediaTypeTVShow &&
      (!params.season || !params.episode)
    ) {
      // first watch of a show, no watch progress, on main screen
      params.season = 1;
      params.episode = 1;
    }

    const url = getSelectStreamUrl(params, forceSelect);
    router.navigate(url as RelativePathString);
    onClose();
  }

  async function handleRewatch() {
    if (isCreatingRewatch) return;
    const mediaSourceID = mediaItem?.media_source + "-" + mediaItem?.source_id;
    try {
      await rewatchMutation({ id: mediaSourceID });
      Toast.success("New Rewatch Started");
    } catch (e: any) {
      if (e?.status === 400) {
        Toast.error("Your current rewatch is already empty!");
      } else {
        Toast.error("Error creating rewatch");
      }
    }
    onClose();
  }

  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={
        mediaItem.media_type === MediaTypeTVShow &&
        targetSeason &&
        targetEpisode
          ? `S${targetSeason}E${targetEpisode} | ` + modalTitle
          : modalTitle
      }
      autoFocus={autoFocus}
    >
      <ModalAction
        label={"Play"}
        onPress={() => {
          handlePlay(false);
        }}
        hasTVPreferredFocus
      />
      <ModalAction
        label="Select Stream..."
        onPress={() => {
          handlePlay(true);
        }}
      />
      <ModalAction
        label={"Mark as Watched"}
        onPress={() => {
          handleMarkAsWatched();
        }}
      />
      {showRewatch && mediaItem?.media_type === MediaTypeTVShow && (
        <ModalAction
          label={"Rewatch Show"}
          onPress={() => {
            openModal({
              type: "confirm",
              props: {
                modalTitle: "Rewatch Show",
                message:
                  "Are you sure you want to rewatch this show? This will archive your current progress.",
                autoFocus: true,
                onPress: handleRewatch,
              },
            });
          }}
        />
      )}
    </ContextModal>
  );
}
