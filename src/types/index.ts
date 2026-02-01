// Core data models for Peerstreak habit tracker

export type HabitFrequency = 'daily' | 'weekly';

export type HabitColor =
  | 'purple'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'orange'
  | 'cyan'
  | 'red';

export type HabitIcon =
  | 'meditation'
  | 'exercise'
  | 'reading'
  | 'water'
  | 'sleep'
  | 'journal'
  | 'code'
  | 'music'
  | 'food'
  | 'study'
  | 'walk'
  | 'custom';

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: HabitIcon;
  color: HabitColor;
  frequency: HabitFrequency;
  createdAt: string; // ISO date string
  archived: boolean;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completedAt: string; // ISO timestamp
}

export interface HabitWithStats extends Habit {
  completions: Completion[];
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

// Color theme mapping for UI
export const HABIT_COLORS: Record<HabitColor, { primary: string; secondary: string; muted: string }> = {
  purple: { primary: '#a855f7', secondary: '#c084fc', muted: '#581c87' },
  yellow: { primary: '#eab308', secondary: '#facc15', muted: '#713f12' },
  blue: { primary: '#3b82f6', secondary: '#60a5fa', muted: '#1e3a8a' },
  green: { primary: '#22c55e', secondary: '#4ade80', muted: '#14532d' },
  pink: { primary: '#ec4899', secondary: '#f472b6', muted: '#831843' },
  orange: { primary: '#f97316', secondary: '#fb923c', muted: '#7c2d12' },
  cyan: { primary: '#06b6d4', secondary: '#22d3ee', muted: '#164e63' },
  red: { primary: '#ef4444', secondary: '#f87171', muted: '#7f1d1d' },
};

// Icon mapping for Lucide icons
export const HABIT_ICONS: Record<HabitIcon, string> = {
  meditation: 'Sparkles',
  exercise: 'Dumbbell',
  reading: 'BookOpen',
  water: 'Droplets',
  sleep: 'Moon',
  journal: 'PenLine',
  code: 'Code',
  music: 'Music',
  food: 'Apple',
  study: 'GraduationCap',
  walk: 'Footprints',
  custom: 'Star',
};
