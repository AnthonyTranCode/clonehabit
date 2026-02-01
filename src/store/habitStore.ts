// Zustand store for habit state management

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type { Habit, Completion, HabitWithStats } from '@/types';
import { loadFromStorage, saveHabits, saveCompletions } from '@/utils/storage';
import { calculateCurrentStreak, calculateLongestStreak, isStreakActive } from '@/utils/streaks';

interface HabitStore {
  habits: Habit[];
  completions: Completion[];
  isLoading: boolean;

  // Actions
  initialize: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date?: Date) => void;
  getHabitWithStats: (habitId: string) => HabitWithStats | null;
  getAllHabitsWithStats: () => HabitWithStats[];
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  completions: [],
  isLoading: true,

  initialize: () => {
    const { habits, completions } = loadFromStorage();
    set({ habits, completions, isLoading: false });
  },

  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      archived: false,
    };

    set((state) => {
      const newHabits = [...state.habits, newHabit];
      saveHabits(newHabits);
      return { habits: newHabits };
    });
  },

  updateHabit: (id, updates) => {
    set((state) => {
      const newHabits = state.habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      );
      saveHabits(newHabits);
      return { habits: newHabits };
    });
  },

  deleteHabit: (id) => {
    set((state) => {
      const newHabits = state.habits.filter((h) => h.id !== id);
      const newCompletions = state.completions.filter((c) => c.habitId !== id);
      saveHabits(newHabits);
      saveCompletions(newCompletions);
      return { habits: newHabits, completions: newCompletions };
    });
  },

  archiveHabit: (id) => {
    set((state) => {
      const newHabits = state.habits.map((h) =>
        h.id === id ? { ...h, archived: true } : h
      );
      saveHabits(newHabits);
      return { habits: newHabits };
    });
  },

  toggleCompletion: (habitId, date = new Date()) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    set((state) => {
      const existing = state.completions.find(
        (c) => c.habitId === habitId && c.date === dateStr
      );

      let newCompletions: Completion[];

      if (existing) {
        // Remove completion
        newCompletions = state.completions.filter((c) => c.id !== existing.id);
      } else {
        // Add completion
        const newCompletion: Completion = {
          id: uuidv4(),
          habitId,
          date: dateStr,
          completedAt: new Date().toISOString(),
        };
        newCompletions = [...state.completions, newCompletion];
      }

      saveCompletions(newCompletions);
      return { completions: newCompletions };
    });
  },

  getHabitWithStats: (habitId) => {
    const { habits, completions } = get();
    const habit = habits.find((h) => h.id === habitId);

    if (!habit) return null;

    const habitCompletions = completions.filter((c) => c.habitId === habitId);

    return {
      ...habit,
      completions: habitCompletions,
      currentStreak: calculateCurrentStreak(completions, habitId),
      longestStreak: calculateLongestStreak(completions, habitId),
      completedToday: isStreakActive(completions, habitId),
    };
  },

  getAllHabitsWithStats: () => {
    const { habits, completions } = get();
    const today = format(new Date(), 'yyyy-MM-dd');

    return habits
      .filter((h) => !h.archived)
      .map((habit) => {
        const habitCompletions = completions.filter((c) => c.habitId === habit.id);

        return {
          ...habit,
          completions: habitCompletions,
          currentStreak: calculateCurrentStreak(completions, habit.id),
          longestStreak: calculateLongestStreak(completions, habit.id),
          completedToday: habitCompletions.some((c) => c.date === today),
        };
      });
  },
}));

// Initialize store on load
if (typeof window !== 'undefined') {
  useHabitStore.getState().initialize();
}
