const STORAGE_KEY = 'schengen-days';
const VERSION = 1;

interface StoredData {
  version: number;
  schengenDays: string[];
}

export function loadSchengenDays(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const data: StoredData = JSON.parse(raw);
    if (data.version === VERSION && Array.isArray(data.schengenDays)) {
      return new Set(data.schengenDays);
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export function saveSchengenDays(days: Set<string>): void {
  const data: StoredData = {
    version: VERSION,
    schengenDays: [...days].sort(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
