import type { GameState } from '../types';
import type { AchievementDefinition } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_feed',
    title: 'İlk Besleme',
    description: 'Evcil hayvanını ilk kez besledin.',
    badgeEmoji: '🍽️',
    badgeColor: '#FF9A9E',
    motivationMessage: 'Harika! Evcil hayvanın seni seviyor.',
    checkUnlocked: (s) => s.feedCount >= 1,
  },
  {
    id: 'feed_10',
    title: '10 Kez Besleme',
    description: 'Evcil hayvanını 10 kez besledin.',
    badgeEmoji: '🌟',
    badgeColor: '#FFD93D',
    motivationMessage: 'Çok iyi bir bakıcısın!',
    checkUnlocked: (s) => s.feedCount >= 10,
  },
  {
    id: 'play_10',
    title: '10 Kez Oyun',
    description: 'Evcil hayvanınla 10 kez oynadın.',
    badgeEmoji: '🎮',
    badgeColor: '#A18CD1',
    motivationMessage: 'Oyun zamanı uzmanı!',
    checkUnlocked: (s) => s.playCount >= 10,
  },
  {
    id: 'happy_pet',
    title: 'Mutlu Evcil Hayvan',
    description: 'Mutluluk seviyesi %80 üzerine çıktı.',
    badgeEmoji: '💖',
    badgeColor: '#6BCB77',
    motivationMessage: 'Evcil hayvanın çok mutlu!',
    checkUnlocked: (s) => s.happiness >= 80,
  },
  {
    id: 'level_2',
    title: 'Seviye 2',
    description: '100 puan topladın.',
    badgeEmoji: '⬆️',
    badgeColor: '#4D96FF',
    motivationMessage: 'Yükseliyorsun!',
    checkUnlocked: (s) => s.totalPoints >= 100,
  },
  {
    id: 'level_3',
    title: 'Seviye 3',
    description: '300 puan topladın.',
    badgeEmoji: '🔥',
    badgeColor: '#FF6B6B',
    motivationMessage: 'İnanılmaz ilerleme!',
    checkUnlocked: (s) => s.totalPoints >= 300,
  },
  {
    id: 'level_4',
    title: 'Seviye 4',
    description: '700 puan topladın.',
    badgeEmoji: '👑',
    badgeColor: '#FFD700',
    motivationMessage: 'Efsane bakıcı!',
    checkUnlocked: (s) => s.totalPoints >= 700,
  },
];

export const ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id);

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getNewlyUnlockedAchievements(
  prevUnlocked: string[],
  currentState: GameState
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(
    (a) => !prevUnlocked.includes(a.id) && a.checkUnlocked(currentState)
  );
}
