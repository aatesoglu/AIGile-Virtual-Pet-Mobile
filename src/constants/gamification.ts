/**
 * Level eşikleri: 10 Seviyeli Sistem
 */
export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2600] as const;

export const MAX_LEVEL = 10;

export type PetStage = 'Yavru' | 'Büyüyor' | 'Genç' | 'Efsane';

export function getPetStage(level: number): PetStage {
  if (level >= 10) return 'Efsane';
  if (level >= 7) return 'Genç';
  if (level >= 4) return 'Büyüyor';
  return 'Yavru';
}

export function getLevelFromPoints(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getPointsForLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 0;
}

export function getPointsForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL - 1];
  return LEVEL_THRESHOLDS[level] ?? 2600;
}

/** Bir sonraki seviyeye kalan puan (progress için) */
export function getProgressToNextLevel(points: number, level: number): { current: number; required: number; percentage: number } {
  const required = getPointsForNextLevel(level);
  const prevThreshold = getPointsForLevel(level);
  
  if (level >= MAX_LEVEL) {
    return { current: points, required: prevThreshold, percentage: 100 };
  }

  const range = required - prevThreshold;
  const inLevel = points - prevThreshold;
  const percentage = Math.min(100, Math.max(0, (inLevel / range) * 100));
  
  return { current: points, required, percentage };
}

