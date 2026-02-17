import { useModalStore } from "@/stores/modalStore";
import { WatchEventModal } from "./WatchEventModal";
import { MediaItemModal } from "./MediaItemModal";

export function GlobalModalHost() {
  const modal = useModalStore((s) => s.modal);
  const close = useModalStore((s) => s.close);

  if (!modal) return null;

  switch (modal.type) {
    case "mediaItem":
      return <MediaItemModal {...modal.props} visible onClose={close} />;

    case "watchEvent":
      return <WatchEventModal {...modal.props} visible onClose={close} />;

    default:
      return null;
  }
}
