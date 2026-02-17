import { RelativePathString, useRouter } from "expo-router";
import { ContextModal, ModalAction } from "./Modal";
import { getSelectStreamUrl } from "@/utils/navigation";

export default function PlayOptionsModal({
  mediaItem,
  modalTitle,
  visible,
  onClose,
  autoFocus,
}: {
  mediaItem: any;
  modalTitle: string;
  visible: boolean;
  onClose: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  if (!mediaItem) return null;

  async function handlePlay(forceSelect?: boolean) {
    const mediaType =
      mediaItem.media_type?.replace("tvshow", "tv") || mediaItem.type || "";
    const mediaSourceID = mediaItem.source_id
      ? mediaItem.media_source + "-" + mediaItem.source_id
      : mediaItem.id;

    let params: any = {
      type: mediaType,
      id: mediaSourceID,
      title: modalTitle,
    };

    // Handle watch progress if available
    const wp = mediaItem.watch_progress;
    if (wp) {
      params = {
        ...params,
        season: wp.season_number,
        episode: wp.episode_number,
        startTime: wp.current_progress_seconds,
        playerSettings: JSON.stringify(wp.player_settings),
      };
    } else if (
      mediaItem.season_number !== undefined &&
      mediaItem.episode_number !== undefined
    ) {
      // Handle direct episode data (e.g. from seasons screen)
      params = {
        ...params,
        season: mediaItem.season_number,
        episode: mediaItem.episode_number,
        startTime: mediaItem.startTime,
      };
    }

    const url = await getSelectStreamUrl(params, forceSelect);
    router.navigate(url as RelativePathString);
    onClose();
  }

  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={modalTitle}
      autoFocus={autoFocus}
    >
      <ModalAction
        label="Play"
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
    </ContextModal>
  );
}
