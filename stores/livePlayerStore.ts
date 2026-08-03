import { create } from "zustand";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};  

type LiveTVStore = {
  sourceURL: string | null;
  rect: Rect | null;
  setRect: (rect: Rect) => void;
  setSource: (sourceURL: string) => void;
}

export const useLiveTVStore = create<LiveTVStore>((set) => ({
  sourceURL: null,
  rect: null,
  setRect: (rect) => set({ rect }),
  setSource: (sourceURL: string) => set({ sourceURL }),
}));