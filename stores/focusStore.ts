import { create } from "zustand";

export type FocusItem = {
  media_type: string;
  source_id: string;
  media_title: string;
  media_subtitle?: string;
  season_number?: number;
  episode_number?: number;
  genres?: any[];
  status?: string;
  release_date?: string;
  backdrop_uri?: string;
  overview?: string;
};

type FocusState = {
  focusedItem: FocusItem | null;
  setFocusedItem: (item: FocusItem) => void;
  clearFocusedItem: () => void;
};

export const useFocusStore = create<FocusState>((set) => ({
  focusedItem: null,
  setFocusedItem: (item) => set({ focusedItem: item }),
  clearFocusedItem: () => set({ focusedItem: null }),
}));