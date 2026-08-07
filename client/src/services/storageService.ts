import type { SelectionMode, SpreadMode } from '../features/tarot/types/tarot';
import type { ApiSettings, SavedReading } from '../types';
import { DEFAULT_API_SETTINGS } from '../constants/aiSettings';
import { apiClient } from './apiClient';

const SETTINGS_KEY = 'tarot_api_settings';
const HISTORY_KEY = 'tarot_saved_readings';
const DECK_PREFS_KEY = 'tarot_deck_preferences';
const ENCYCLOPEDIA_PREFS_KEY = 'tarot_encyclopedia_preferences';

export interface DeckPreferences {
  selectionMode: SelectionMode;
  deckFilter: 'all' | 'major' | 'minor';
  useAi: boolean;
  spreadMode?: SpreadMode;
}

export interface EncyclopediaPreferences {
  selectedArcana: 'all' | 'major' | 'minor';
  selectedSuit: 'all' | 'wands' | 'cups' | 'swords' | 'pentacles';
  selectedElement: 'all' | 'fire' | 'water' | 'air' | 'earth';
  sortBy: 'number' | 'nameAsc' | 'nameDesc';
}

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
    // Synchronous local get for initial render
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

  /**
   * Async sync with backend to get latest saved readings
   */
  async fetchSavedReadingsAsync(): Promise<SavedReading[]> {
    try {
      const data = await apiClient.get<SavedReading[]>('/api/readings');
      const readings: SavedReading[] = Array.isArray(data) ? data : (data as any).data || [];
      if (Array.isArray(readings)) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(readings));
        return readings;
      }
    } catch (e) {
      console.warn('Backend sync failed, using localStorage readings');
    }
    return this.getSavedReadings();
  },

  getReadingById(id: string): SavedReading | undefined {
    const readings = this.getSavedReadings();
    return readings.find((r) => r.id === id);
  },

  async getReadingByIdAsync(id: string): Promise<SavedReading | undefined> {
    const local = this.getReadingById(id);
    if (local) return local;
    try {
      const response = await apiClient.get<any>(`/api/readings/${id}`);
      const reading: SavedReading = response?.data || response;
      if (reading && reading.id) return reading;
    } catch (e) {
      console.warn('Failed to fetch reading from server DB:', e);
    }
    return undefined;
  },

  saveReading(reading: SavedReading): SavedReading[] {
    const current = this.getSavedReadings();
    const existingIndex = current.findIndex((r) => r.id === reading.id);
    let updated: SavedReading[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = reading;
    } else {
      updated = [reading, ...current];
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // Async sync to Backend database
    apiClient.post('/api/readings', reading).catch((err: any) => console.warn('Failed to sync reading to backend database:', err));

    return updated;
  },

  clearSavedReadings(): void {
    localStorage.removeItem(HISTORY_KEY);

    apiClient.delete('/api/readings').catch((err: any) => console.warn('Failed to clear readings on backend:', err));
  },

  deleteReading(id: string): SavedReading[] {
    const current = this.getSavedReadings();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    apiClient.delete(`/api/readings/${id}`).catch((err: any) => console.warn('Failed to delete reading on backend:', err));

    return updated;
  },

  // Deck Preferences Storage
  getDeckPreferences(): DeckPreferences {
    const saved = localStorage.getItem(DECK_PREFS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          selectionMode: parsed.selectionMode || 'manual',
          deckFilter: parsed.deckFilter || 'all',
          useAi: parsed.useAi ?? true,
          spreadMode: parsed.spreadMode || 'three',
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      selectionMode: 'manual',
      deckFilter: 'all',
      useAi: true,
      spreadMode: 'three',
    };
  },

  saveDeckPreferences(prefs: Partial<DeckPreferences>): void {
    const current = this.getDeckPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(DECK_PREFS_KEY, JSON.stringify(updated));
  },

  // Encyclopedia Preferences Storage
  getEncyclopediaPreferences(): EncyclopediaPreferences {
    const saved = localStorage.getItem(ENCYCLOPEDIA_PREFS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          selectedArcana: parsed.selectedArcana || 'all',
          selectedSuit: parsed.selectedSuit || 'all',
          selectedElement: parsed.selectedElement || 'all',
          sortBy: parsed.sortBy || 'number',
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      selectedArcana: 'all',
      selectedSuit: 'all',
      selectedElement: 'all',
      sortBy: 'number',
    };
  },

  saveEncyclopediaPreferences(prefs: Partial<EncyclopediaPreferences>): void {
    const current = this.getEncyclopediaPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(ENCYCLOPEDIA_PREFS_KEY, JSON.stringify(updated));
  },
};
