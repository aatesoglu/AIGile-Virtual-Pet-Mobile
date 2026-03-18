/**
 * Merkezi tip tanımları - Production kalitesinde modüler yapı
 */

export type PetType = 'cat' | 'dog' | 'bird';

export type PetMood = 'happy' | 'veryHappy' | 'sad' | 'hungry' | 'neutral';

export interface PetState {
  name: string;
  type: PetType;
  hunger: number;   // 0 = tok, 100 = çok aç (besleme azaltır)
  happiness: number; // 0 = üzgün, 100 = çok mutlu (oyun artırır)
  energy: number;    // 0 = yorgun, 100 = enerjik
}

export interface GamificationState {
  totalPoints: number;  // Kalıcı puan (XP)
  gold: number;         // Oyun parası
  level: number;
  feedCount: number;
  playCount: number;
  unlockedAchievementIds: string[];
  lastInteractionTimestamp: number;
  lastLoginTimestamp: number;
  streak: number;
  highScores: {
    puzzle?: number;
    memory?: number;
    different?: number;
  };
}

export interface GameState extends PetState, GamificationState {
  currentLocationId: string;
  isSleeping: boolean;
  sleepProgress: number; // 0 to 100
  isInitialized: boolean;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  badgeEmoji: string;
  badgeColor: string;
  motivationMessage: string;
  checkUnlocked: (state: GameState) => boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  hungerEffect: number;
  happinessEffect: number;
  energyEffect: number;
  xpEffect: number;
  price: number;
  minLevel?: number; // Optional: unlock level
}

export interface LocationItem {
  id: string;
  name: string;
  gradient: string[];
  price: number;
  minLevel: number;
}
