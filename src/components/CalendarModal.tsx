// Calendar modal for viewing and editing completion history

import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
} from 'date-fns';
import { HABIT_COLORS, type Habit } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import styles from './CalendarModal.module.css';

interface Props {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarModal({ habit, isOpen, onClose }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const completions = useHabitStore((state) => state.completions);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);

  const colorTheme = habit ? HABIT_COLORS[habit.color] : HABIT_COLORS.purple;

  const completedDates = useMemo(() => {
    if (!habit) return new Set<string>();
    return new Set(
      completions
        .filter((c) => c.habitId === habit.id)
        .map((c) => c.date)
    );
  }, [completions, habit]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (date: Date) => {
    if (!habit || isAfter(date, new Date())) return;
    toggleCompletion(habit.id, date);
  };

  if (!isOpen || !habit) return null;

  const today = new Date();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{habit.name}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.calendar}>
          <div className={styles.monthNav}>
            <button className={styles.navButton} onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft size={20} />
            </button>
            <span className={styles.monthLabel}>
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button className={styles.navButton} onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAYS.map((day) => (
              <div key={day} className={styles.weekday}>{day}</div>
            ))}
          </div>

          <div className={styles.days}>
            {calendarDays.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isCompleted = completedDates.has(dateStr);
              const isToday = isSameDay(date, today);
              const isFuture = isAfter(date, today);

              return (
                <button
                  key={dateStr}
                  className={`${styles.day} ${!isCurrentMonth ? styles.otherMonth : ''} ${isCompleted ? styles.completed : ''} ${isToday ? styles.today : ''} ${isFuture ? styles.future : ''}`}
                  onClick={() => handleDayClick(date)}
                  disabled={isFuture}
                  style={{
                    backgroundColor: isCompleted ? colorTheme.primary : undefined,
                  }}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ backgroundColor: colorTheme.primary }} />
            <span>Completed</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.todayDot}`} />
            <span>Today</span>
          </div>
        </div>

        <p className={styles.hint}>Tap any date to toggle completion</p>
      </div>
    </div>
  );
}
