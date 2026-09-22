/** Persisted audio preferences. Cuelume and the ambient engine read these; nothing autoplays. */
export const PREF_SOUNDS = "vp.settings.uiSounds";
export const PREF_AMBIENT = "vp.settings.ambient";

function read(key: string) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
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
  soundsEnabled: () => read(PREF_SOUNDS),
  setSoundsEnabled: (v: boolean) => write(PREF_SOUNDS, v),
  ambientWanted: () => read(PREF_AMBIENT),
  setAmbientWanted: (v: boolean) => write(PREF_AMBIENT, v),
};
