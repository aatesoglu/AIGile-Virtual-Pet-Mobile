import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameProvider } from './src/context/GameContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { BadgesScreen } from './src/screens/BadgesScreen';
import { PetInfoScreen } from './src/screens/PetInfoScreen';
import { PuzzleGame } from './src/screens/PuzzleGame';
import { MemoryGame } from './src/screens/MemoryGame';
import { FindDifferentGame } from './src/screens/FindDifferentGame';
import { theme } from './src/constants/theme';
import { useGame } from './src/context/GameContext';

export type AppScreen = 'home' | 'achievements' | 'badges' | 'petinfo' | 'puzzle' | 'memory' | 'different';

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

function AppContent() {
  const { gameState } = useGame();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [previousScreen, setPreviousScreen] = useState<AppScreen>('home');

  const navigate = useCallback((screen: AppScreen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  }, [currentScreen]);

  const goHome = useCallback(() => setCurrentScreen('home'), []);
  const goAchievements = useCallback(() => navigate('achievements'), [navigate]);
  const goBadges = useCallback(() => navigate('badges'), [navigate]);
  const goPetInfo = useCallback(() => navigate('petinfo'), [navigate]);
  const goBack = useCallback(() => setCurrentScreen(previousScreen), [previousScreen]);

  const renderScreen = () => {
    if (!gameState.isInitialized) {
      return <OnboardingScreen />;
    }

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onNavigateToAchievements={goAchievements}
            onNavigateToPetInfo={goPetInfo}
            onNavigateToGame={(gameId) => navigate(gameId)}
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen onBack={goHome} onNavigateToBadges={goBadges} />
        );
      case 'badges':
        return <BadgesScreen onBack={goBack} />;
      case 'petinfo':
        return <PetInfoScreen onBack={goHome} />;
      case 'puzzle':
        return <PuzzleGame onBack={goHome} />;
      case 'memory':
        return <MemoryGame onBack={goHome} />;
      case 'different':
        return <FindDifferentGame onBack={goHome} />;
      default:
        return (
          <HomeScreen
            onNavigateToAchievements={goAchievements}
            onNavigateToPetInfo={goPetInfo}
            onNavigateToGame={(gameId) => navigate(gameId)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[theme.colors.background, '#1a1925', theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
