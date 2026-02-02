import AsyncStorage from "@react-native-async-storage/async-storage";

export type SettingsSchema = {
  subtitlesLanguage?: string;
  audioLanguage?: string;
  player?: "exoplayer" | "mpv";
};

const DEFAULTS: SettingsSchema = {
  subtitlesLanguage: "en",
  audioLanguage: "en",
  player: "exoplayer",
};

const STORAGE_KEY = "@app_settings";

let cache: SettingsSchema | null = null;
let loadingPromise: Promise<SettingsSchema> | null = null;

async function load(): Promise<SettingsSchema> {
  if (cache) return cache;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        cache = { ...DEFAULTS, ...(typeof parsed === "object" ? parsed : {}) };
      } catch (e) {
        console.error("Failed to load settings:", e);
        cache = { ...DEFAULTS };
      }
      return cache as SettingsSchema;
    })();
  }
  return loadingPromise;
}

// get one setting
export async function getSetting<K extends keyof SettingsSchema>(
  key: K
): Promise<SettingsSchema[K]> {
  const settings = await load();
  return settings[key];
}

/**
 * Set one setting
 */
export async function setSetting<K extends keyof SettingsSchema>(
  key: K,
  value: SettingsSchema[K]
) {
  const settings = await load();
  const updated = { ...settings, [key]: value };

  cache = updated;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save setting:", e);
  }
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<SettingsSchema> {
  return load();
}