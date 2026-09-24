/** Persisted audio preferences. UI sounds are on until the visitor turns them off; ambient music never autoplays. */
export const PREF_SOUNDS = "vp.settings.uiSounds";
export const PREF_AMBIENT = "vp.settings.ambient";

function read(key: string, fallback = false) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === "1";
  } catch {
    return fallback;
  }
}

function write(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* private mode */
  }
}

export const audioPrefs = {
  soundsEnabled: () => read(PREF_SOUNDS, true),
  setSoundsEnabled: (v: boolean) => write(PREF_SOUNDS, v),
  ambientWanted: () => read(PREF_AMBIENT),
  setAmbientWanted: (v: boolean) => write(PREF_AMBIENT, v),
};
