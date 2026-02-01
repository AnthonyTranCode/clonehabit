// Tile grid visualization component (GitHub contribution graph style)

import { useMemo, useState } from 'react';
import { format, isAfter, startOfDay, getWeek, getQuarter } from 'date-fns';
import { generateDateGrid, getCompletionDatesForGrid } from '@/utils/streaks';
import { HABIT_COLORS, type HabitColor, type HabitFrequency, type Completion } from '@/types';
import styles from './TileGrid.module.css';

type ViewMode = 'days' | 'weeks' | 'months' | 'quarters';

interface Props {
  habitId: string;
  completions: Completion[];
  color: HabitColor;
  frequency: HabitFrequency;
  onDateClick?: (date: Date) => void;
}

interface GroupedData {
  label: string;
  completed: number;
  total: number;
  dates: Date[];
  // For weekly habits: number of weeks with at least one completion
  weeksCompleted: number;
  totalWeeks: number;
}

export function TileGrid({ habitId, completions, color, frequency, onDateClick }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const dates = useMemo(() => generateDateGrid(), []);
  const completedDates = useMemo(
    () => getCompletionDatesForGrid(completions, habitId),
    [completions, habitId]
  );

  const colorTheme = HABIT_COLORS[color];
  const today = startOfDay(new Date());

  // Group dates by week, month, or quarter
  const groupedData = useMemo(() => {
    if (viewMode === 'days') return null;

    const groups = new Map<string, GroupedData>();

    dates.forEach((date) => {
      let key: string;
      let label: string;

      if (viewMode === 'weeks') {
        const weekNum = getWeek(date, { weekStartsOn: 0 });
        key = `${format(date, 'yyyy')}-W${weekNum}`;
        label = `Week ${weekNum}`;
      } else if (viewMode === 'months') {
        key = format(date, 'yyyy-MM');
        label = format(date, 'MMM');
      } else {
        const quarter = getQuarter(date);
        key = `${format(date, 'yyyy')}-Q${quarter}`;
        label = `Q${quarter}`;
      }

      if (!groups.has(key)) {
        groups.set(key, { label, completed: 0, total: 0, dates: [], weeksCompleted: 0, totalWeeks: 0 });
      }

      const group = groups.get(key)!;
      const dateStr = format(date, 'yyyy-MM-dd');
      const isFuture = isAfter(startOfDay(date), today);

      if (!isFuture) {
        group.total++;
        if (completedDates.has(dateStr)) {
          group.completed++;
        }
      }
      group.dates.push(date);
    });

    // For weekly habits, calculate weeks with at least one completion
    if (frequency === 'weekly') {
      groups.forEach((group) => {
        const weeksInGroup = new Map<number, { hasCompletion: boolean; isFuture: boolean }>();

        group.dates.forEach((date) => {
          const weekNum = getWeek(date, { weekStartsOn: 0 });
          const dateStr = format(date, 'yyyy-MM-dd');
          const isFuture = isAfter(startOfDay(date), today);

          if (!weeksInGroup.has(weekNum)) {
            weeksInGroup.set(weekNum, { hasCompletion: false, isFuture: true });
          }

          const week = weeksInGroup.get(weekNum)!;
          if (!isFuture) {
            week.isFuture = false;
          }
          if (completedDates.has(dateStr)) {
            week.hasCompletion = true;
          }
        });

        let weeksCompleted = 0;
        let totalWeeks = 0;

        weeksInGroup.forEach((week) => {
          if (!week.isFuture) {
            totalWeeks++;
            if (week.hasCompletion) {
              weeksCompleted++;
            }
          }
        });

        group.weeksCompleted = weeksCompleted;
        group.totalWeeks = totalWeeks;
      });
    }

    return Array.from(groups.values());
  }, [dates, completedDates, viewMode, today, frequency]);

  // Calculate percentage based on frequency
  const calculatePercentage = (group: GroupedData): number => {
    if (frequency === 'weekly') {
      // For weekly habits: percentage of weeks with at least one completion
      if (group.totalWeeks > 0) {
        return (group.weeksCompleted / group.totalWeeks) * 100;
      }
      return 0;
    }
    // For daily habits: percentage of days completed
    return group.total > 0 ? (group.completed / group.total) * 100 : 0;
  };

  // Format tooltip based on frequency
  const formatTooltip = (group: GroupedData, percentage: number): string => {
    if (frequency === 'weekly') {
      return `${group.label}: ${group.weeksCompleted}/${group.totalWeeks} weeks (${Math.round(percentage)}%)`;
    }
    return `${group.label}: ${group.completed}/${group.total} days (${Math.round(percentage)}%)`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleButton} ${viewMode === 'days' ? styles.active : ''}`}
          onClick={() => setViewMode('days')}
        >
          Days
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'weeks' ? styles.active : ''}`}
          onClick={() => setViewMode('weeks')}
        >
          Weeks
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'months' ? styles.active : ''}`}
          onClick={() => setViewMode('months')}
        >
          Months
        </button>
        <button
          className={`${styles.toggleButton} ${viewMode === 'quarters' ? styles.active : ''}`}
          onClick={() => setViewMode('quarters')}
        >
          Quarters
        </button>
      </div>

      {viewMode === 'days' ? (
        <div className={styles.grid}>
          {dates.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCompleted = completedDates.has(dateStr);
            const isToday = dateStr === format(today, 'yyyy-MM-dd');
            const isFuture = isAfter(startOfDay(date), today);

            return (
              <button
                key={dateStr}
                className={`${styles.tile} ${isCompleted ? styles.completed : ''} ${isToday ? styles.today : ''} ${isFuture ? styles.future : ''}`}
                style={{
                  backgroundColor: isCompleted ? colorTheme.primary : colorTheme.muted,
                  opacity: isCompleted ? 1 : isFuture ? 0.1 : 0.3,
                }}
                onClick={() => !isFuture && onDateClick?.(date)}
                data-tooltip={format(date, 'MMM d, yyyy')}
                aria-label={`${format(date, 'MMMM d, yyyy')} - ${isFuture ? 'Future' : isCompleted ? 'Completed' : 'Not completed'}`}
                disabled={isFuture}
              />
            );
          })}
        </div>
      ) : (
        <div className={`${styles.groupedGrid} ${styles[viewMode]}`}>
          {groupedData?.map((group, index) => {
            const percentage = calculatePercentage(group);
            const isFutureGroup = frequency === 'weekly' ? group.totalWeeks === 0 : group.total === 0;

            return (
              <div
                key={index}
                className={`${styles.groupTile} ${isFutureGroup ? styles.future : ''}`}
                style={{
                  backgroundColor: colorTheme.muted,
                }}
                data-tooltip={formatTooltip(group, percentage)}
              >
                <div
                  className={styles.groupFill}
                  style={{
                    backgroundColor: colorTheme.primary,
                    height: `${percentage}%`,
                  }}
                />
                <span className={styles.groupLabel}>{group.label}</span>
                <span className={styles.groupPercentage}>
                  {isFutureGroup ? '-' : `${Math.round(percentage)}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
