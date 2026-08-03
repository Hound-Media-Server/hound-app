import { create } from "zustand";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};  

type LiveTVStore = {
  rect: Rect | null;
  setRect: (rect: Rect) => void;
}

export const useLiveTVStore = create<LiveTVStore>((set) => ({
  rect: null,
  setRect: (rect) => set({ rect }),
}));