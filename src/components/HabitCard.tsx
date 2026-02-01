// Habit card component with tile grid and actions

import { useState } from 'react';
import { Check, Flame, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';
import { HabitIconComponent } from './HabitIcon';
import { TileGrid } from './TileGrid';
import { HABIT_COLORS, type HabitWithStats } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import styles from './HabitCard.module.css';

interface Props {
  habit: HabitWithStats;
  onEdit: () => void;
  onOpenCalendar: () => void;
}

export function HabitCard({ habit, onEdit, onOpenCalendar }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  const colorTheme = HABIT_COLORS[habit.color];

  const handleToggleToday = () => {
    setIsChecking(true);
    toggleCompletion(habit.id);
    setTimeout(() => setIsChecking(false), 300);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      deleteHabit(habit.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={styles.card}
      style={{
        '--habit-color': colorTheme.primary,
        '--habit-color-muted': colorTheme.muted,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: colorTheme.muted }}>
          <HabitIconComponent icon={habit.icon} size={20} color={colorTheme.primary} />
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>{habit.name}</h3>
          {habit.description && (
            <p className={styles.description}>{habit.description}</p>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.checkButton} ${habit.completedToday ? styles.checked : ''} ${isChecking ? styles.checking : ''}`}
            onClick={handleToggleToday}
            aria-label={habit.completedToday ? 'Mark as incomplete' : 'Mark as complete'}
            style={{
              backgroundColor: habit.completedToday ? colorTheme.primary : 'transparent',
              borderColor: colorTheme.primary,
            }}
          >
            <Check size={18} strokeWidth={3} />
          </button>

          <div className={styles.menuWrapper}>
            <button
              className={styles.menuButton}
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
                <div className={styles.menu}>
                  <button className={styles.menuItem} onClick={() => { onEdit(); setShowMenu(false); }}>
                    <Edit size={16} />
                    Edit habit
                  </button>
                  <button className={styles.menuItem} onClick={() => { onOpenCalendar(); setShowMenu(false); }}>
                    <Calendar size={16} />
                    View history
                  </button>
                  <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleDelete}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <TileGrid
        habitId={habit.id}
        completions={habit.completions}
        color={habit.color}
        frequency={habit.frequency}
        onDateClick={(date) => {
          toggleCompletion(habit.id, date);
        }}
      />

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Flame
            size={16}
            className={habit.currentStreak > 0 ? styles.flameActive : ''}
            style={{ color: habit.currentStreak > 0 ? colorTheme.primary : undefined }}
          />
          <span className={styles.statValue}>{habit.currentStreak}</span>
          <span className={styles.statLabel}>day streak</span>
        </div>

        <div className={styles.statDivider} />

        <div className={styles.stat}>
          <span className={styles.statValue}>{habit.longestStreak}</span>
          <span className={styles.statLabel}>longest</span>
        </div>

        <div className={styles.statDivider} />

        <div className={styles.stat}>
          <span className={styles.statValue}>{habit.completions.length}</span>
          <span className={styles.statLabel}>total</span>
        </div>
      </div>
    </div>
  );
}
