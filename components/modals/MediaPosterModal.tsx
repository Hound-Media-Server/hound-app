import { RelativePathString, useRouter } from "expo-router";
import { ContextModal, ModalAction } from "./Modal";
import { getAddToCollectionUrl, getMediaPageUrl } from "@/utils/navigation";

export default function MediaPosterModal({
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

  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={modalTitle}
      autoFocus={autoFocus}
    >
      <ModalAction
        label={`Open ${
          mediaItem.media_type === "movie" ? "Movie" : "Show"
        } Page`}
        hasTVPreferredFocus
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
      <ModalAction
        label="Add to Collection"
        onPress={() => {
          const addToCollectionUrl = getAddToCollectionUrl(
            mediaItem.media_type,
            mediaItem.media_source,
            mediaItem.source_id,
          );
          router.navigate(addToCollectionUrl as RelativePathString);
          onClose();
        }}
      />
    </ContextModal>
  );
}
