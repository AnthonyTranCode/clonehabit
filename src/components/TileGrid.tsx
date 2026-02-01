// Tile grid visualization component (GitHub contribution graph style)

import { useMemo } from 'react';
import { format } from 'date-fns';
import { generateDateGrid, getCompletionDatesForGrid } from '@/utils/streaks';
import { HABIT_COLORS, type HabitColor, type Completion } from '@/types';
import styles from './TileGrid.module.css';

interface Props {
  habitId: string;
  completions: Completion[];
  color: HabitColor;
  days?: number;
  onDateClick?: (date: Date) => void;
}

export function TileGrid({ habitId, completions, color, days = 70, onDateClick }: Props) {
  const dates = useMemo(() => generateDateGrid(days), [days]);
  const completedDates = useMemo(
    () => getCompletionDatesForGrid(completions, habitId, days),
    [completions, habitId, days]
  );

  const colorTheme = HABIT_COLORS[color];

  return (
    <div className={styles.grid}>
      {dates.map((date, index) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isCompleted = completedDates.has(dateStr);
        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

        return (
          <button
            key={dateStr}
            className={`${styles.tile} ${isCompleted ? styles.completed : ''} ${isToday ? styles.today : ''}`}
            style={{
              backgroundColor: isCompleted ? colorTheme.primary : colorTheme.muted,
              opacity: isCompleted ? 1 : 0.3,
              animationDelay: `${index * 5}ms`,
            }}
            onClick={() => onDateClick?.(date)}
            title={format(date, 'MMM d, yyyy')}
            aria-label={`${format(date, 'MMMM d, yyyy')} - ${isCompleted ? 'Completed' : 'Not completed'}`}
          />
        );
      })}
    </div>
  );
}
