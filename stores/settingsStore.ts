import { createMMKV } from "react-native-mmkv";
/*
  playAction: whether pressing play should show select-stream or directly play top stream
*/
export type SettingsSchema = {
  subtitlesLanguage?: string;
  audioLanguage?: string;
  defaultPlayer?: "exoplayer" | "mpv";
  defaultPlayAction?: "direct" | "select";
  defaultShowResizeMode?: "cover" | "contain";
  defaultMovieResizeMode?: "cover" | "contain";
  subtitleSize?: number;
  autoplayNextEpisode?: boolean;
};

const DEFAULTS: SettingsSchema = {
  subtitlesLanguage: "en",
  audioLanguage: "original",
  defaultPlayer: "mpv",
  defaultPlayAction: "direct",
  defaultShowResizeMode: "contain",
  defaultMovieResizeMode: "contain",
  subtitleSize: 24,
  autoplayNextEpisode: true,
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
