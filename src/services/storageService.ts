import type { ApiSettings, SavedReading } from '../types/tarot';
import { DEFAULT_API_SETTINGS } from './aiService';

const SETTINGS_KEY = 'tarot_api_settings';
const HISTORY_KEY = 'tarot_saved_readings';

export const storageService = {
  getApiSettings(): ApiSettings {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return DEFAULT_API_SETTINGS;
  },

  saveApiSettings(settings: ApiSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getSavedReadings(): SavedReading[] {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore fallback
      }
    }
    return [];
  },

  getReadingById(id: string): SavedReading | undefined {
    const readings = this.getSavedReadings();
    return readings.find((r) => r.id === id);
  },

  saveReading(reading: SavedReading): SavedReading[] {
    const current = this.getSavedReadings();
    const updated = [reading, ...current];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  },

  clearSavedReadings(): void {
    localStorage.removeItem(HISTORY_KEY);
  }
};
