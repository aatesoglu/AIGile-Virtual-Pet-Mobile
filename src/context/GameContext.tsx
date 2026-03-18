import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, PetType, FoodItem, LocationItem } from '../types';
import { getLevelFromPoints } from '../constants/gamification';
import { getNewlyUnlockedAchievements, ACHIEVEMENTS } from '../constants/achievements';
import type { AchievementDefinition } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

const DECAY_INTERVAL_MS = 10_000; // Her 10 saniyede bir kontrol
const HUNGER_INCREASE_PER_TICK = 3;
const HAPPINESS_DECREASE_PER_TICK = 2;
const FEED_HUNGER_DECREASE = 25;
const FEED_POINTS = 10;
const PLAY_HAPPINESS_INCREASE = 25;
const PLAY_POINTS = 15;

const initialState: GameState = {
  name: 'Mia',
  type: 'cat',
  hunger: 50,
  happiness: 50,
  energy: 100,
  totalPoints: 0,
  gold: 100, // Başlangıç parası
  level: 1,
  feedCount: 0,
  playCount: 0,
  unlockedAchievementIds: [],
  lastInteractionTimestamp: Date.now(),
  lastLoginTimestamp: Date.now(),
  streak: 1,
  highScores: {},
  currentLocationId: 'garden',
  isSleeping: false,
  sleepProgress: 0,
  isInitialized: false,
};

interface GameContextValue {
  gameState: GameState;
  feedPet: (food: FoodItem) => boolean; // Başarılı olup olmadığını döner
  playPet: () => void;
  sleepPet: () => void;
  toggleSleep: () => void;
  setLocation: (locationId: string) => void;
  purchaseLocation: (location: LocationItem) => boolean;
  resetGame: () => void;
  completeGame: (
    gameId: 'puzzle' | 'memory' | 'different',
    score: number,
    xpReward: number
  ) => void;
  newlyUnlockedAchievements: AchievementDefinition[];
  clearNewlyUnlocked: () => void;
  updatePetProfile: (name: string, type: PetType) => void;
  initializeGame: (name: string, type: PetType) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<AchievementDefinition[]>([]);

  const loadGameState = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        const now = Date.now();
        const lastLogin = parsed.lastLoginTimestamp ?? 0;
        
        let bonusXP = 0;
        let newStreak = parsed.streak ?? 1;

        // Check for daily bonus (if last login was not today)
        const lastDate = new Date(lastLogin).toDateString();
        const todayDate = new Date(now).toDateString();

        if (lastLogin > 0 && lastDate !== todayDate) {
          bonusXP = 20;
          // Check if it was yesterday for streak
          const yesterday = new Date(now - 86400000).toDateString();
          if (lastDate === yesterday) {
            newStreak += 1;
            // Streak bonus logic could be added here
          } else {
            newStreak = 1;
          }
        }

        // Migrate old format: ensure new fields exist
        setGameState({
          ...initialState,
          ...parsed,
          name: parsed.name ?? parsed.petName ?? initialState.name,
          type: (parsed.type ?? parsed.petType ?? initialState.type) as PetType,
          hunger: parsed.hunger ?? initialState.hunger,
          happiness: parsed.happiness ?? initialState.happiness,
          energy: parsed.energy ?? initialState.energy,
          totalPoints: (parsed.totalPoints ?? parsed.xp ?? 0) + bonusXP,
          gold: parsed.gold ?? initialState.gold,
          level: getLevelFromPoints((parsed.totalPoints ?? parsed.xp ?? 0) + bonusXP),
          feedCount: parsed.feedCount ?? 0,
          playCount: parsed.playCount ?? 0,
          unlockedAchievementIds: parsed.unlockedAchievementIds ?? parsed.achievements ?? [],
          lastInteractionTimestamp: now,
          lastLoginTimestamp: now,
          streak: newStreak,
          highScores: parsed.highScores ?? {},
          currentLocationId: parsed.currentLocationId ?? initialState.currentLocationId,
          isSleeping: parsed.isSleeping ?? initialState.isSleeping,
          sleepProgress: parsed.sleepProgress ?? 0,
          isInitialized: parsed.isInitialized ?? (parsed.name || parsed.petName ? true : false),
        });
      }
    } catch (e) {
      console.error('Failed to load game state', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  const saveGameState = useCallback(async (state: GameState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save game state', e);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveGameState(gameState);
  }, [gameState, isLoaded, saveGameState]);

  // Zamanla açlık artar, mutluluk azalır
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setGameState((prev) => {
        const now = Date.now();
        const elapsed = Math.floor((now - prev.lastInteractionTimestamp) / DECAY_INTERVAL_MS);
        if (elapsed < 1) return prev;
        const isSleeping = prev.isSleeping;
        const newSleepProgress = isSleeping ? Math.min(100, prev.sleepProgress + 10) : prev.sleepProgress;
        const autoWake = isSleeping && newSleepProgress >= 100;

        return {
          ...prev,
          hunger: Math.min(100, prev.hunger + (isSleeping ? 1 : HUNGER_INCREASE_PER_TICK)),
          happiness: Math.max(0, prev.happiness - (isSleeping ? 1 : HAPPINESS_DECREASE_PER_TICK)),
          energy: isSleeping ? Math.min(100, prev.energy + 5) : Math.max(0, prev.energy - 1),
          sleepProgress: autoWake ? 0 : newSleepProgress,
          isSleeping: autoWake ? false : isSleeping,
          lastInteractionTimestamp: now,
        };
      });
    }, DECAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoaded]);

  const feedPet = useCallback((food: FoodItem) => {
    let success = false;
    setGameState((prev) => {
      if (prev.gold < food.price) return prev;
      success = true;

      const newHunger = Math.max(0, Math.min(100, prev.hunger + food.hungerEffect));
      const newHappiness = Math.max(0, Math.min(100, prev.happiness + food.happinessEffect));
      const newEnergy = Math.max(0, Math.min(100, prev.energy + food.energyEffect));
      const newPoints = prev.totalPoints + food.xpEffect;
      const newGold = prev.gold - food.price;
      const newLevel = getLevelFromPoints(newPoints);
      const newFeedCount = prev.feedCount + 1;
      
      const nextUnlocked = ACHIEVEMENTS.filter(
        (a) => !prev.unlockedAchievementIds.includes(a.id) && a.checkUnlocked({
          ...prev,
          hunger: newHunger,
          happiness: newHappiness,
          energy: newEnergy,
          totalPoints: newPoints,
          gold: newGold,
          level: newLevel,
          feedCount: newFeedCount,
          unlockedAchievementIds: prev.unlockedAchievementIds,
          currentLocationId: prev.currentLocationId,
          isSleeping: prev.isSleeping,
          sleepProgress: prev.sleepProgress,
        })
      ).map((a) => a.id);
      
      const unique = Array.from(new Set([...prev.unlockedAchievementIds, ...nextUnlocked]));
      const newlyUnlocked = getNewlyUnlockedAchievements(prev.unlockedAchievementIds, {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        energy: newEnergy,
        totalPoints: newPoints,
        gold: newGold,
        level: newLevel,
        currentLocationId: prev.currentLocationId,
        isSleeping: prev.isSleeping,
        feedCount: newFeedCount,
        unlockedAchievementIds: unique,
      });

      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievements((list) => [...list, ...newlyUnlocked]);
      }

      return {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        energy: newEnergy,
        totalPoints: newPoints,
        gold: newGold,
        level: newLevel,
        feedCount: newFeedCount,
        lastInteractionTimestamp: Date.now(),
        unlockedAchievementIds: unique,
      };
    });
    return success;
  }, []);

  const playPet = useCallback(() => {
    setGameState((prev) => {
      const newHappiness = Math.min(100, prev.happiness + PLAY_HAPPINESS_INCREASE);
      const newPoints = prev.totalPoints + PLAY_POINTS;
      const newLevel = getLevelFromPoints(newPoints);
      const newPlayCount = prev.playCount + 1;
      const nextUnlocked = ACHIEVEMENTS.filter(
        (a) => !prev.unlockedAchievementIds.includes(a.id) && a.checkUnlocked({
          ...prev,
          happiness: newHappiness,
          totalPoints: newPoints,
          level: newLevel,
          playCount: newPlayCount,
          unlockedAchievementIds: prev.unlockedAchievementIds,
        })
      ).map((a) => a.id);
      const unique = Array.from(new Set([...prev.unlockedAchievementIds, ...nextUnlocked]));
      const newlyUnlocked = getNewlyUnlockedAchievements(prev.unlockedAchievementIds, {
        ...prev,
        happiness: newHappiness,
        totalPoints: newPoints,
        level: newLevel,
        playCount: newPlayCount,
        unlockedAchievementIds: unique,
        currentLocationId: prev.currentLocationId,
        isSleeping: prev.isSleeping,
      });
      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievements((list) => [...list, ...newlyUnlocked]);
      }
      return {
        ...prev,
        happiness: newHappiness,
        totalPoints: newPoints,
        level: newLevel,
        playCount: newPlayCount,
        lastInteractionTimestamp: Date.now(),
        unlockedAchievementIds: unique,
      };
    });
  }, []);

  const toggleSleep = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isSleeping: !prev.isSleeping,
      sleepProgress: !prev.isSleeping ? 0 : prev.sleepProgress,
      lastInteractionTimestamp: Date.now(),
    }));
  }, []);

  const setLocation = useCallback((locationId: string) => {
    setGameState((prev) => ({
      ...prev,
      currentLocationId: locationId,
    }));
  }, []);

  const purchaseLocation = useCallback((location: LocationItem) => {
    let success = false;
    setGameState((prev) => {
      if (prev.gold < location.price) return prev;
      success = true;
      return {
        ...prev,
        gold: prev.gold - location.price,
        currentLocationId: location.id,
      };
    });
    return success;
  }, []);

  const updatePetProfile = useCallback((name: string, type: PetType) => {
    setGameState((prev) => ({
      ...prev,
      name,
      type,
    }));
  }, []);

  const initializeGame = useCallback((name: string, type: PetType) => {
    setGameState((prev) => ({
      ...prev,
      name,
      type,
      isInitialized: true,
      lastInteractionTimestamp: Date.now(),
      lastLoginTimestamp: Date.now(),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(initialState);
    setNewlyUnlockedAchievements([]);
  }, []);

  const completeGame = useCallback((gameId: 'puzzle' | 'memory' | 'different', score: number, xpReward: number) => {
    setGameState((prev) => {
      let happinessGain = 0;
      let energyLoss = 0;

      switch (gameId) {
        case 'puzzle':
          happinessGain = 15;
          energyLoss = 10;
          break;
        case 'memory':
          happinessGain = 20;
          energyLoss = 15;
          break;
        case 'different':
          happinessGain = 10;
          energyLoss = 5;
          break;
      }

      const goldReward = Math.floor(xpReward * (score / 100)) + 10;

      const newHappiness = Math.min(100, prev.happiness + happinessGain);
      const newEnergy = Math.max(0, prev.energy - energyLoss);
      const newPoints = prev.totalPoints + xpReward;
      const newGold = prev.gold + goldReward;
      const newLevel = getLevelFromPoints(newPoints);
      const newPlayCount = prev.playCount + 1;
      
      // High score tracking
      const currentHighest = prev.highScores[gameId] ?? 0;
      const newHighScores = { ...prev.highScores };
      if (score > currentHighest) {
        newHighScores[gameId] = score;
      }

      return {
        ...prev,
        happiness: newHappiness,
        energy: newEnergy,
        totalPoints: newPoints,
        gold: newGold,
        level: newLevel,
        playCount: newPlayCount,
        lastInteractionTimestamp: Date.now(),
        highScores: newHighScores,
      };
    });
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlockedAchievements([]);
  }, []);

  const value: GameContextValue = {
    gameState,
    feedPet,
    playPet,
    sleepPet: toggleSleep,
    toggleSleep,
    setLocation,
    purchaseLocation,
    resetGame,
    completeGame,
    newlyUnlockedAchievements,
    clearNewlyUnlocked,
    updatePetProfile,
    initializeGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
