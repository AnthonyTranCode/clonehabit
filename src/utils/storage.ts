// Local storage service with future cloud sync capability

import type { Habit, Completion } from '@/types';

const STORAGE_KEYS = {
  HABITS: 'peerstreak_habits',
  COMPLETIONS: 'peerstreak_completions',
  LAST_SYNC: 'peerstreak_last_sync',
} as const;

export interface StorageData {
  habits: Habit[];
  completions: Completion[];
  lastSync: string | null;
}

// Load all data from localStorage
export function loadFromStorage(): StorageData {
  try {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]') as Habit[];
    const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]') as Completion[];
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    return { habits, completions, lastSync };
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return { habits: [], completions: [], lastSync: null };
  }
}

// Save habits to localStorage
export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (error) {
    console.error('Failed to save habits:', error);
  }
}

// Save completions to localStorage
export function saveCompletions(completions: Completion[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (error) {
    console.error('Failed to save completions:', error);
  }
}

// Get completions for a specific habit within a date range
export function getCompletionsForHabit(
  completions: Completion[],
  habitId: string,
  startDate: Date,
  endDate: Date
): Completion[] {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  return completions.filter(
    (c) => c.habitId === habitId && c.date >= start && c.date <= end
  );
}

// Check if a habit is completed on a specific date
export function isCompletedOnDate(
  completions: Completion[],
  habitId: string,
  date: Date
): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return completions.some((c) => c.habitId === habitId && c.date === dateStr);
}

// Future cloud sync placeholder
export async function syncToCloud(): Promise<void> {
  // TODO: Implement cloud sync
  // This would:
  // 1. Upload local changes since lastSync
  // 2. Download remote changes
  // 3. Resolve conflicts
  // 4. Update lastSync timestamp
  console.log('Cloud sync not yet implemented');
}

// Export data for backup
export function exportData(): string {
  const data = loadFromStorage();
  return JSON.stringify(data, null, 2);
}

// Import data from backup
export function importData(jsonString: string): StorageData | null {
  try {
    const data = JSON.parse(jsonString) as StorageData;
    if (Array.isArray(data.habits) && Array.isArray(data.completions)) {
      saveHabits(data.habits);
      saveCompletions(data.completions);
      return data;
    }
    return null;
  } catch {
    console.error('Failed to import data');
    return null;
  }
}
