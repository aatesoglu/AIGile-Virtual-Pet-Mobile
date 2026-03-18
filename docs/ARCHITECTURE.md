# Tamagotchi Uygulaması – Mimari ve Yapı

## 1. Önerilen proje klasör yapısı

```
src/
├── components/          # Yeniden kullanılabilir UI bileşenleri
│   ├── ActionButtons.tsx
│   ├── AchievementUnlockModal.tsx
│   ├── PetAvatar.tsx
│   └── StatBar.tsx
├── constants/           # Sabitler ve konfigürasyon
│   ├── achievements.ts   # Başarım tanımları
│   ├── gamification.ts     # Level eşikleri, puan hesabı
│   ├── storage.ts
│   └── theme.ts
├── context/
│   └── GameContext.tsx    # Global oyun state ve aksiyonlar
├── screens/
│   ├── HomeScreen.tsx
│   ├── AchievementsScreen.tsx
│   ├── BadgesScreen.tsx
│   └── PetInfoScreen.tsx
├── types/
│   └── index.ts           # Merkezi TypeScript tipleri
└── utils/
    └── petMood.ts         # Ruh hali hesaplama
```

## 2. Gamification sistemi – sınıflar ve mantık

- **constants/achievements.ts**: Her başarım için `AchievementDefinition` (id, title, description, badgeEmoji, badgeColor, motivationMessage, checkUnlocked).
- **constants/gamification.ts**: `getLevelFromPoints`, `getProgressToNextLevel`, `LEVEL_THRESHOLDS` (0, 100, 300, 700).
- **context/GameContext.tsx**: Puan ekleme (besleme +10, oyun +15), level hesaplama, başarım kilidi açma ve `newlyUnlockedAchievements` ile popup tetikleme.
- **components/AchievementUnlockModal.tsx**: Başarım açıldığında animasyonlu popup ve motivasyon mesajı.

## 3. Puan ve level hesaplama

- **Puan**: Besleme +10, Oyna +15. AsyncStorage ile kalıcı.
- **Level eşikleri**:
  - 0–100 puan → Level 1  
  - 100–300 → Level 2  
  - 300–700 → Level 3  
  - 700+ → Level 4  
- `getLevelFromPoints(points)` ve `getProgressToNextLevel(points, level)` (percentage) ile progress bar doldurulur.

## 4. Pet bileşeni (geliştirilmiş)

- **PetAvatar**: `type`, `hunger`, `happiness` alır; `getPetMood(hunger, happiness)` ile mood (veryHappy, happy, neutral, sad, hungry) hesaplanır.
- Görsel: mood’a göre emoji + çerçeve rengi (üzgün/aç vurgusu).
- Reanimated ile scale/bounce animasyonları.

## 5. UI prensipleri

- **theme.ts**: Renkler, spacing, borderRadius, typography.
- **StatBar**: Shared value ile animasyonlu doluluk.
- **ActionButtons**: Spring scale ile micro-interaction.
- **Ekranlar**: Ortak header (geri + başlık), kartlar, tutarlı padding/margin.

## 6. Pet mekanikleri

- **Açlık**: Zamanla artar (her ~10 sn +3); besleme −25.
- **Mutluluk**: Zamanla azalır (her ~10 sn −2); oyun +25.
- Mood: açlık ≥70 → hungry, mutluluk <30 → sad, mutluluk ≥80 → veryHappy, vb.
