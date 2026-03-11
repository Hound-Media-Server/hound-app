import { RelativePathString, useRouter } from "expo-router";
import { ContextModal, ModalAction } from "./Modal";
import {
  getMediaPageUrl,
  getSelectStreamUrl,
  StreamUrlParams,
} from "@/utils/navigation";
import {
  MediaTypeMovie,
  MediaTypeTVShow,
  MediaType,
} from "@/constants/MediaTypes";

export default function ContinueWatchingModal({
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
    const mediaType = mediaItem.media_type || "";
    const mediaSourceID = mediaItem.media_source + "-" + mediaItem.source_id;

    let params: StreamUrlParams = {
      mediaType: mediaType,
      id: mediaSourceID,
      modalTitle: modalTitle,
    };

    if (mediaItem.watch_action_type === "resume") {
      const wp = mediaItem.watch_progress;
      if (wp) {
        params = {
          ...params,
          season: wp.season_number,
          episode: wp.episode_number,
          startTime: wp.current_progress_seconds,
          playerSettings: JSON.stringify(wp.player_settings),
        };
      }
    } else if (mediaItem.watch_action_type === "next_episode") {
      const nextEp = mediaItem.next_episode;
      if (nextEp) {
        params = {
          ...params,
          season: nextEp.season_number,
          episode: nextEp.episode_number,
        };
      }
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
          onClose();
        }}
        hasTVPreferredFocus
      />
      <ModalAction
        label="Select Stream..."
        onPress={() => {
          handlePlay(true);
          onClose();
        }}
      />
      <ModalAction
        label={`Open ${
          mediaItem.media_type === MediaTypeMovie ? "Movie" : "Show"
        } Page`}
        onPress={() => {
          const mediaPageUrl = getMediaPageUrl(
            mediaItem.media_type,
            mediaItem.media_source,
            mediaItem.source_id,
          );
          router.navigate(mediaPageUrl as RelativePathString);
          onClose();
        }}
      />
    </ContextModal>
  );
}
