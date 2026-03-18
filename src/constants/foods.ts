import { FoodItem } from '../types';

export const FOOD_ITEMS: FoodItem[] = [
  { id: 'apple', name: 'Elma', emoji: '🍎', hungerEffect: -20, happinessEffect: 5, energyEffect: 10, xpEffect: 10, price: 5, minLevel: 1 },
  { id: 'broccoli', name: 'Brokoli', emoji: '🥦', hungerEffect: -25, happinessEffect: -5, energyEffect: 20, xpEffect: 20, price: 10, minLevel: 2 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', hungerEffect: -35, happinessEffect: 20, energyEffect: 5, xpEffect: 15, price: 25, minLevel: 3 },
  { id: 'donut', name: 'Donut', emoji: '🍩', hungerEffect: -15, happinessEffect: 30, energyEffect: -10, xpEffect: 8, price: 15, minLevel: 4 },
  { id: 'fish', name: 'Balık', emoji: '🐟', hungerEffect: -30, happinessEffect: 10, energyEffect: 25, xpEffect: 25, price: 40, minLevel: 5 },
];
