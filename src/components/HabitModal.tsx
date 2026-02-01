// Habit creation and editing modal

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { HabitIconComponent } from './HabitIcon';
import { HABIT_COLORS, type Habit, type HabitColor, type HabitIcon, type HabitFrequency } from '@/types';
import { useHabitStore } from '@/store/habitStore';
import styles from './HabitModal.module.css';

const ICONS: HabitIcon[] = [
  'meditation', 'exercise', 'reading', 'water', 'sleep', 'journal',
  'code', 'music', 'food', 'study', 'walk', 'custom'
];

const COLORS: HabitColor[] = [
  'purple', 'blue', 'green', 'yellow', 'orange', 'pink', 'cyan', 'red'
];

interface Props {
  habit?: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HabitModal({ habit, isOpen, onClose }: Props) {
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<HabitIcon>('custom');
  const [color, setColor] = useState<HabitColor>('purple');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  const isEditing = !!habit;

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description);
      setIcon(habit.icon);
      setColor(habit.color);
      setFrequency(habit.frequency);
    } else {
      setName('');
      setDescription('');
      setIcon('custom');
      setColor('purple');
      setFrequency('daily');
    }
  }, [habit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (isEditing && habit) {
      updateHabit(habit.id, {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        frequency,
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        frequency,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Edit Habit' : 'New Habit'}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="habit-name">Name</label>
            <input
              id="habit-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              autoFocus
              maxLength={50}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="habit-description">Description (optional)</label>
            <input
              id="habit-description"
              type="text"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 10 minutes of mindfulness"
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Icon</label>
            <div className={styles.iconGrid}>
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.iconButton} ${icon === i ? styles.selected : ''}`}
                  onClick={() => setIcon(i)}
                  style={{
                    backgroundColor: icon === i ? HABIT_COLORS[color].muted : undefined,
                    borderColor: icon === i ? HABIT_COLORS[color].primary : undefined,
                  }}
                >
                  <HabitIconComponent
                    icon={i}
                    size={20}
                    color={icon === i ? HABIT_COLORS[color].primary : undefined}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorGrid}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorButton} ${color === c ? styles.selected : ''}`}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: HABIT_COLORS[c].primary }}
                  aria-label={`Select ${c} color`}
                />
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Frequency</label>
            <div className={styles.frequencyGroup}>
              <button
                type="button"
                className={`${styles.frequencyButton} ${frequency === 'daily' ? styles.selected : ''}`}
                onClick={() => setFrequency('daily')}
              >
                Daily
              </button>
              <button
                type="button"
                className={`${styles.frequencyButton} ${frequency === 'weekly' ? styles.selected : ''}`}
                onClick={() => setFrequency('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!name.trim()}
              style={{ backgroundColor: HABIT_COLORS[color].primary }}
            >
              {isEditing ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
