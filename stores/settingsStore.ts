import { useSyncExternalStore } from "react";
import { createMMKV } from "react-native-mmkv";
/*
  playAction: whether pressing play should show select-stream or directly play top stream
*/
export type SettingsSchema = {
  defaultSubtitleLanguage?: string;
  defaultAudioLanguage?: string;
  defaultPlayer?: "exoplayer" | "mpv";
  defaultPlayAction?: "direct" | "select";
  defaultShowResizeMode?: "cover" | "contain";
  defaultMovieResizeMode?: "cover" | "contain";
  subtitleSize?: number;
  autoplayNextEpisode?: boolean;
  enableExternalSubtitles?: boolean;
  hideLiveTV?: boolean;
};

const DEFAULTS: SettingsSchema = {
  defaultSubtitleLanguage: "en",
  defaultAudioLanguage: "original",
  defaultPlayer: "mpv",
  defaultPlayAction: "direct",
  defaultShowResizeMode: "contain",
  defaultMovieResizeMode: "contain",
  subtitleSize: 24,
  autoplayNextEpisode: true,
  enableExternalSubtitles: false,
  hideLiveTV: false,
};

const STORAGE_KEY = "@app_settings";

const storage = createMMKV();

function load(): SettingsSchema {
  try {
    const raw = storage.getString(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...(typeof parsed === "object" ? parsed : {}) };
  } catch (e) {
    console.error("Failed to load settings:", e);
    return { ...DEFAULTS };
  }
}

// get one setting
export function getSetting<K extends keyof SettingsSchema>(
  key: K
): SettingsSchema[K] {
  const settings = load();
  return settings[key];
}

// reactive version of getSetting
export function useSetting<K extends keyof SettingsSchema>(
  key: K
): SettingsSchema[K] {
  return useSyncExternalStore(
    (onChange) => {
      const listener = storage.addOnValueChangedListener((k) => {
        if (k === STORAGE_KEY) onChange();
      });
      return () => listener.remove();
    },
    () => load()[key]
  );
}

/**
 * Set one setting
 */
export function setSetting<K extends keyof SettingsSchema>(
  key: K,
  value: SettingsSchema[K]
) {
  const settings = load();
  const updated = { ...settings, [key]: value };

  try {
    storage.set(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save setting:", e);
  }
}

/**
 * Get all settings
 */
export function getAllSettings(): SettingsSchema {
  return load();
}
