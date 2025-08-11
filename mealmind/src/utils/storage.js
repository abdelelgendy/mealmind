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
