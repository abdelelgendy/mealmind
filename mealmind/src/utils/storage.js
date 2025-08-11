const KEY = 'mealmind_pantry_v1';

export function loadPantry() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePantry(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

const PREFS_KEY = 'mealmind_prefs_v1';

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { calories: 2200, diet: '', allergies: '' };
  } catch {
    return { calories: 2200, diet: '', allergies: '' };
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
