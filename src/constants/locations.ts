import { LocationItem } from '../types';

export const LOCATIONS: LocationItem[] = [
  {
    id: 'garden',
    name: 'Bahçe',
    gradient: ['#a8e063', '#56ab2f'],
    price: 0,
    minLevel: 1,
  },
  {
    id: 'bedroom',
    name: 'Yatak Odası',
    gradient: ['#1e3c72', '#2a5298'],
    price: 0,
    minLevel: 1,
  },
  {
    id: 'kitchen',
    name: 'Mutfak',
    gradient: ['#F7971E', '#FFD200'],
    price: 0,
    minLevel: 1,
  },
  {
    id: 'living_room',
    name: 'Oturma Odası',
    gradient: ['#FF9A8B', '#FF6A88', '#FF99AC'],
    price: 100,
    minLevel: 2,
  },
  {
    id: 'beach',
    name: 'Sahil',
    gradient: ['#4facfe', '#00f2fe'],
    price: 250,
    minLevel: 5,
  },
  {
    id: 'space',
    name: 'Uzay',
    gradient: ['#0f0c29', '#302b63', '#24243e'],
    price: 500,
    minLevel: 10,
  },
  {
    id: 'forest',
    name: 'Orman',
    gradient: ['#134E5E', '#71B280'],
    price: 200,
    minLevel: 3,
  },
];
