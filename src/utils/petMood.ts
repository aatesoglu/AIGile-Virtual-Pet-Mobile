import type { PetMood } from '../types';

/**
 * Açlık ve mutluluk değerlerine göre pet mood hesaplar.
 * - çok mutlu: happiness >= 80
 * - mutlu: happiness >= 50 ve hunger < 70
 * - aç: hunger >= 70
 * - üzgün: happiness < 30 veya (hunger >= 50 ve happiness < 50)
 * - neutral: diğer
 */
export function getPetMood(hunger: number, happiness: number): PetMood {
  if (happiness >= 80) return 'veryHappy';
  if (hunger >= 70) return 'hungry';
  if (happiness < 30) return 'sad';
  if (happiness >= 50 && hunger < 70) return 'happy';
  return 'neutral';
}
