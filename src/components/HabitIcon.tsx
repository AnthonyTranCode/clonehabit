// Dynamic icon component for habits

import {
  Sparkles,
  Dumbbell,
  BookOpen,
  Droplets,
  Moon,
  PenLine,
  Code,
  Music,
  Apple,
  GraduationCap,
  Footprints,
  Star,
  type LucideProps,
} from 'lucide-react';
import type { HabitIcon as HabitIconType } from '@/types';

const iconMap: Record<HabitIconType, React.ComponentType<LucideProps>> = {
  meditation: Sparkles,
  exercise: Dumbbell,
  reading: BookOpen,
  water: Droplets,
  sleep: Moon,
  journal: PenLine,
  code: Code,
  music: Music,
  food: Apple,
  study: GraduationCap,
  walk: Footprints,
  custom: Star,
};

interface Props extends LucideProps {
  icon: HabitIconType;
}

export function HabitIconComponent({ icon, ...props }: Props) {
  const IconComponent = iconMap[icon] || Star;
  return <IconComponent {...props} />;
}
