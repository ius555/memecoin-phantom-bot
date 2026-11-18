/**
 * Insignele (gamificare). Fiecare insignă are o condiție calculată din progres.
 * Pentru o insignă nouă, adaugă un obiect aici – verificarea se face automat.
 */
import type { ProgressState } from '../store/progressTypes'
import { LEVELS } from './lessons'
import { currentStreak } from '../store/streak'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  check: (s: ProgressState) => boolean
}

const levelNames = ['Ucenicul atelierului', 'Primul sunet', 'Stăpânul acordurilor', 'Inimă de tobă', 'Degete de mătase', 'Urcușul pe grif']

const levelBadges: Badge[] = LEVELS.map((level, i) => ({
  id: `level-${level.number}`,
  name: levelNames[i] ?? `Nivelul ${level.number}`,
  description: `Ai terminat Nivelul ${level.number}: ${level.title}`,
  icon: level.icon,
  check: (s) => level.lessons.every((l) => s.completedLessons[l.id]),
}))

export const BADGES: Badge[] = [
  {
    id: 'first-lesson',
    name: 'Primul pas',
    description: 'Ai terminat prima lecție',
    icon: '👣',
    check: (s) => Object.keys(s.completedLessons).length >= 1,
  },
  ...levelBadges,
  { id: 'streak-3', name: 'Trei zile la rând', description: '3 zile consecutive de practică', icon: '🔥', check: (s) => currentStreak(s.practiceDays) >= 3 },
  { id: 'streak-7', name: 'O săptămână întreagă', description: '7 zile consecutive de practică', icon: '📅', check: (s) => currentStreak(s.practiceDays) >= 7 },
  { id: 'streak-30', name: 'Obicei de fier', description: '30 de zile consecutive de practică', icon: '🏆', check: (s) => currentStreak(s.practiceDays) >= 30 },
  { id: 'xp-500', name: '500 XP', description: 'Ai adunat 500 de puncte de experiență', icon: '⭐', check: (s) => s.xp >= 500 },
  { id: 'xp-2000', name: '2000 XP', description: 'Ai adunat 2000 de puncte de experiență', icon: '🌟', check: (s) => s.xp >= 2000 },
  {
    id: 'one-minute-30',
    name: 'Schimbări fulger',
    description: '30 de schimbări de acord într-un minut',
    icon: '⚡',
    check: (s) => s.oneMinute.some((r) => r.count >= 30),
  },
  { id: 'ear-10', name: 'Ureche fină', description: '10 acorduri ghicite la testul de auz', icon: '👂', check: (s) => s.ear.correct >= 10 },
  {
    id: 'game-1000',
    name: 'Ritm de joc',
    description: '1000 de puncte într-o rundă din jocul de schimbări',
    icon: '🎯',
    check: (s) => Object.values(s.gameBest).some((v) => v >= 1000),
  },
  { id: 'song-1', name: 'Primul cântec', description: 'Ai exersat primul cântec', icon: '🎶', check: (s) => s.songsPracticed.length >= 1 },
  { id: 'tuned', name: 'Bine acordat', description: 'Ai folosit acordorul', icon: '🎚️', check: (s) => s.usedTuner },
]
