const NAMESPACE = 'tma';

/**
 * Safely access localStorage, with graceful fallback when not available.
 */
function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// PUBLIC_INTERFACE
export function getKey(key) {
  /** Get namespaced key for storage. */
  return `${NAMESPACE}:${key}`;
}

// PUBLIC_INTERFACE
export function getJSON(key, defaultValue = null) {
  /** Read and parse JSON from localStorage safely. */
  const store = getStorage();
  if (!store) return defaultValue;
  try {
    const raw = store.getItem(getKey(key));
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error('storage.getJSON error', e);
    return defaultValue;
  }
}

// PUBLIC_INTERFACE
export function setJSON(key, value) {
  /** Stringify and save JSON to localStorage safely. */
  const store = getStorage();
  if (!store) return false;
  try {
    store.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('storage.setJSON error', e);
    return false;
  }
}

// PUBLIC_INTERFACE
export function remove(key) {
  /** Remove a key from localStorage. */
  const store = getStorage();
  if (!store) return false;
  try {
    store.removeItem(getKey(key));
    return true;
  } catch (e) {
    console.error('storage.remove error', e);
    return false;
  }
}
