import { create } from "zustand";

/*
    mediaItem -> regular posters, for root media items such as tv shows and movies
    watchEvent -> continue watching tiles, episode tiles give play options
*/
type ModalType = "mediaItem" | "watchEvent" | "playOptions";

type ModalState =
  | {
      type: "mediaItem";
      props: {
        mediaItem: any;
        modalTitle: string;
        autoFocus?: boolean;
      };
    }
  | {
      type: "watchEvent";
      props: {
        mediaItem: any;
        modalTitle: string;
        autoFocus?: boolean;
      };
    }
  | {
      type: "playOptions";
      props: {
        mediaItem: any;
        modalTitle: string;
        autoFocus?: boolean;
      };
    }
  | null;

type ModalStore = {
  modal: ModalState;
  open: (modal: Exclude<ModalState, null>) => void;
  close: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (modal) => set({ modal }),
  close: () => set({ modal: null }),
}));
