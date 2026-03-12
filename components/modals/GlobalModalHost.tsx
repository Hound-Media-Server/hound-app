import { useModalStore } from "@/stores/modalStore";
import MediaPosterModal from "./MediaPosterModal";
import ContinueWatchingModal from "./ContinueWatchingModal";
import PlayOptionsModal from "./PlayOptionsModal";
import ConfirmModal from "./ConfirmModal";

export function GlobalModalHost() {
  const modal = useModalStore((s) => s.modal);
  const close = useModalStore((s) => s.close);

  if (!modal) return null;

  switch (modal.type) {
    case "mediaItem":
      return <MediaPosterModal {...modal.props} visible onClose={close} />;

    case "watchEvent":
      return <ContinueWatchingModal {...modal.props} visible onClose={close} />;

    case "playOptions":
      return <PlayOptionsModal {...modal.props} visible onClose={close} />;

    case "confirm":
      return <ConfirmModal {...modal.props} visible onClose={close} />;

    default:
      return null;
  }
}
