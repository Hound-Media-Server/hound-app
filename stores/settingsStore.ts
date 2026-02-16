import { createMMKV } from "react-native-mmkv";

export type SettingsSchema = {
  subtitlesLanguage?: string;
  audioLanguage?: string;
  defaultPlayer?: "exoplayer" | "mpv";
};

const DEFAULTS: SettingsSchema = {
  subtitlesLanguage: "en",
  audioLanguage: "en",
  defaultPlayer: "exoplayer",
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