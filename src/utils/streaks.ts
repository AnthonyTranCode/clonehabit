// Streak calculation utilities

import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import type { Completion } from '@/types';

// Calculate current streak for a habit
export function calculateCurrentStreak(
  completions: Completion[],
  habitId: string
): number {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort((a, b) => b.localeCompare(a)); // Sort descending (most recent first)

  if (habitCompletions.length === 0) return 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Check if the streak is active (completed today or yesterday)
  const mostRecent = habitCompletions[0];
  if (mostRecent !== today && mostRecent !== yesterday) {
    return 0; // Streak is broken
  }

  // Count consecutive days going backwards
  let streak = 0;
  let checkDate = mostRecent === today ? new Date() : subDays(new Date(), 1);

  for (const dateStr of habitCompletions) {
    const expectedDate = format(checkDate, 'yyyy-MM-dd');
    if (dateStr === expectedDate) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (dateStr < expectedDate) {
      // There's a gap, streak is broken at this point
      break;
    }
    // If dateStr > expectedDate, we might have duplicates, skip
  }

  return streak;
}

// Calculate longest streak ever achieved
export function calculateLongestStreak(
  completions: Completion[],
  habitId: string
): number {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort((a, b) => a.localeCompare(b)); // Sort ascending (oldest first)

  if (habitCompletions.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < habitCompletions.length; i++) {
    const prevDate = parseISO(habitCompletions[i - 1]);
    const currDate = parseISO(habitCompletions[i]);
    const daysDiff = differenceInDays(currDate, prevDate);

    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      // Gap in dates, reset streak
      currentStreak = 1;
    }
    // If daysDiff === 0, it's a duplicate, ignore
  }

  return longestStreak;
}

// Get completion dates for tile grid (last N days)
export function getCompletionDatesForGrid(
  completions: Completion[],
  habitId: string,
  days: number = 70
): Set<string> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  const startStr = format(startDate, 'yyyy-MM-dd');

  const dates = completions
    .filter((c) => c.habitId === habitId && c.date >= startStr)
    .map((c) => c.date);

  return new Set(dates);
}

// Check if streak is currently active (completed today)
export function isStreakActive(
  completions: Completion[],
  habitId: string
): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return completions.some((c) => c.habitId === habitId && c.date === today);
}

// Generate date array for tile grid
export function generateDateGrid(days: number = 70): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    dates.push(subDays(today, i));
  }

  return dates;
}
