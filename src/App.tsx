// Peerstreak - Main App Component

import { useState, useEffect } from 'react';
import { Plus, Zap } from 'lucide-react';
import { HabitCard } from './components/HabitCard';
import { HabitModal } from './components/HabitModal';
import { CalendarModal } from './components/CalendarModal';
import { useHabitStore } from './store/habitStore';
import type { Habit } from './types';
import styles from './App.module.css';

export default function App() {
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const habits = useHabitStore((state) => state.getAllHabitsWithStats());
  const isLoading = useHabitStore((state) => state.isLoading);
  const initialize = useHabitStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setHabitModalOpen(true);
  };

  const handleOpenCalendar = (habit: Habit) => {
    setSelectedHabit(habit);
    setCalendarModalOpen(true);
  };

  const handleCloseHabitModal = () => {
    setHabitModalOpen(false);
    setSelectedHabit(null);
  };

  const handleCloseCalendarModal = () => {
    setCalendarModalOpen(false);
    setSelectedHabit(null);
  };

  const handleAddHabit = () => {
    setSelectedHabit(null);
    setHabitModalOpen(true);
  };

  const completedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Zap size={32} className={styles.loadingIcon} />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Zap size={24} className={styles.logoIcon} />
            <h1 className={styles.title}>Peerstreak</h1>
          </div>

          {totalHabits > 0 && (
            <div className={styles.progress}>
              <span className={styles.progressCount}>
                {completedToday}/{totalHabits}
              </span>
              <span className={styles.progressLabel}>today</span>
            </div>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {habits.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Zap size={48} />
            </div>
            <h2 className={styles.emptyTitle}>No habits yet</h2>
            <p className={styles.emptyText}>
              Start building better habits today. Track your progress and watch your streaks grow.
            </p>
            <button className={styles.emptyButton} onClick={handleAddHabit}>
              <Plus size={20} />
              Create your first habit
            </button>
          </div>
        ) : (
          <div className={styles.habitList}>
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={() => handleEditHabit(habit)}
                onOpenCalendar={() => handleOpenCalendar(habit)}
              />
            ))}
          </div>
        )}
      </main>

      {habits.length > 0 && (
        <button
          className={styles.fab}
          onClick={handleAddHabit}
          aria-label="Add new habit"
        >
          <Plus size={24} />
        </button>
      )}

      <HabitModal
        habit={selectedHabit}
        isOpen={habitModalOpen}
        onClose={handleCloseHabitModal}
      />

      <CalendarModal
        habit={selectedHabit}
        isOpen={calendarModalOpen}
        onClose={handleCloseCalendarModal}
      />
    </div>
  );
}
