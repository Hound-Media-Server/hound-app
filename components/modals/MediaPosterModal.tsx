import { RelativePathString, useRouter, usePathname } from "expo-router";
import { ContextModal, ModalAction } from "./Modal";
import { getAddToCollectionUrl, getMediaPageUrl } from "@/utils/navigation";
import { MediaTypeMovie } from "@/constants/MediaTypes";
import { useDeleteFromCollection } from "@/services/collectionService";
import { Toast } from "toastify-react-native";

export default function MediaPosterModal({
  mediaItem,
  modalTitle,
  visible,
  onClose,
  autoFocus,
  collectionID,
}: {
  mediaItem: any;
  modalTitle: string;
  visible: boolean;
  onClose: () => void;
  autoFocus?: boolean;
  collectionID?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: deleteFromCollection, isPending } = useDeleteFromCollection();
  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={modalTitle}
      autoFocus={autoFocus}
    >
      <ModalAction
        label={`Open ${
          mediaItem.media_type === MediaTypeMovie ? "Movie" : "Show"
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
      {collectionID && collectionID >= 0 && (
        <ModalAction
          label="Delete From Collection"
          onPress={() => {
            deleteFromCollection(
              {
                collectionID: collectionID,
                mediaType: mediaItem.media_type,
                mediaSource: mediaItem.media_source,
                sourceID: mediaItem.source_id,
              },
              {
                onSuccess: () => {
                  Toast.success("Deleted from collection");
                  onClose();
                  router.replace(pathname as any); // refresh page
                },
                onError: (error: any) => {
                  Toast.error(
                    error?.message || "Failed to delete from collection",
                  );
                },
              },
            );
          }}
        />
      )}
    </ContextModal>
  );
}
