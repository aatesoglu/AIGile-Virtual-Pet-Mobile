import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { DigiPet } from '../components/DigiPet';
import { StatBar } from '../components/StatBar';
import { ActionButtons } from '../components/ActionButtons';
import { AchievementUnlockModal } from '../components/AchievementUnlockModal';
import { MarketModal } from '../components/MarketModal';
import { PlayModal } from '../components/PlayModal';
import { LevelUpModal } from '../components/LevelUpModal';
import { BottomNavBar } from '../components/BottomNavBar';
import { FoodItem, LocationItem } from '../types';
import { getProgressToNextLevel, getPetStage } from '../constants/gamification';
import { LOCATIONS } from '../constants/locations';
import { theme } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  FadeOutDown,
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withDelay, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';
import { Trophy, Info, Coins, Moon, Sun, Utensils, Play } from 'lucide-react-native';

interface HomeScreenProps {
  onNavigateToAchievements: () => void;
  onNavigateToPetInfo: () => void;
  onNavigateToGame: (gameId: 'puzzle' | 'memory' | 'different') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToAchievements,
  onNavigateToPetInfo,
  onNavigateToGame,
}) => {
  const {
    gameState,
    feedPet,
    toggleSleep,
    purchaseLocation,
    setLocation,
    updatePetProfile,
    newlyUnlockedAchievements,
    clearNewlyUnlocked,
  } = useGame();
  
  const [modalAchievement, setModalAchievement] = useState<any | null>(null);
  const [shownIndex, setShownIndex] = useState(0);
  
  // Level up detection
  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const prevLevelRef = React.useRef(gameState.level);
  
  // Modals state
  const [marketModalVisible, setMarketModalVisible] = useState(false);
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [onScreenFood, setOnScreenFood] = useState<FoodItem | null>(null);
  const [showBubble, setShowBubble] = useState(false);
  const progress = getProgressToNextLevel(gameState.totalPoints, gameState.level);
  const petStage = getPetStage(gameState.level);

  // Food animation shared values
  const foodOpacity = useSharedValue(0);
  const foodScale = useSharedValue(0);
  const foodTranslateY = useSharedValue(0);

  React.useEffect(() => {
    if (gameState.level > prevLevelRef.current) {
      setLevelUpModalVisible(true);
      prevLevelRef.current = gameState.level;
    }
  }, [gameState.level]);

  React.useEffect(() => {
    if (newlyUnlockedAchievements.length > 0 && modalAchievement === null) {
      setShownIndex(0);
      setModalAchievement(newlyUnlockedAchievements[0]);
    }
  }, [newlyUnlockedAchievements, modalAchievement]);

  const handleDismissModal = useCallback(() => {
    const nextIndex = shownIndex + 1;
    if (nextIndex < newlyUnlockedAchievements.length) {
      setShownIndex(nextIndex);
      setModalAchievement(newlyUnlockedAchievements[nextIndex] ?? null);
    } else {
      setModalAchievement(null);
      setShownIndex(0);
      clearNewlyUnlocked();
    }
  }, [clearNewlyUnlocked, newlyUnlockedAchievements, shownIndex]);

  const foodAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: foodOpacity.value,
      transform: [
        { scale: foodScale.value },
        { translateY: foodTranslateY.value }
      ],
      position: 'absolute',
      alignSelf: 'center',
      top: '50%',
      zIndex: 10,
    };
  });

  // No-op for now as we use implicit styles or animations in sub-components

  const handleSelectFood = useCallback((food: FoodItem) => {
    setOnScreenFood(food);
    setSelectedFood(food);
    setMarketModalVisible(false);
    
    // Reset animation values for appearance
    foodOpacity.value = 0;
    foodScale.value = 0;
    foodTranslateY.value = 0;

    // Show food at the center of the room
    foodOpacity.value = withTiming(1, { duration: 300 });
    foodScale.value = withSpring(1.2);
  }, [foodOpacity, foodScale]);

  const handleEatFood = useCallback(() => {
    if (!onScreenFood) return;

    // Start eat animation: Food moves to mouth
    foodTranslateY.value = withSequence(
      withTiming(-100, { duration: 600 }),
      withTiming(0, { duration: 0 }, () => {
        foodOpacity.value = withTiming(0);
        runOnJS(setShowBubble)(true);
        runOnJS(feedPet)(onScreenFood);
        runOnJS(setOnScreenFood)(null);
      })
    );

    // Hide bubble after 2 seconds
    setTimeout(() => {
      setShowBubble(false);
    }, 2500);
  }, [feedPet, foodOpacity, foodTranslateY, onScreenFood]);

  // Removed local sleep effect - sleep state is now managed globally

  const currentLocation = LOCATIONS.find(l => l.id === gameState.currentLocationId) || LOCATIONS[0];

  const renderRoomContent = () => {
    switch (gameState.currentLocationId) {
      case 'bedroom':
        return (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.roomContent}>
            <View style={styles.roomHeader}>
              <Moon color="#fff" size={32} />
              <Text style={styles.roomTitle}>Yatak Odası</Text>
            </View>
            
            {gameState.isSleeping ? (
              <View style={styles.sleepContainer}>
                <Text style={styles.sleepText}>Mışıl mışıl uyuyor...</Text>
                <View style={styles.sleepProgressContainer}>
                  <View style={styles.sleepProgressBarBg}>
                    <Animated.View 
                      style={[styles.sleepProgressBarFill, { width: `${gameState.sleepProgress}%` }]} 
                    />
                  </View>
                  <Text style={styles.sleepPercentage}>%{gameState.sleepProgress}</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.sleepButton} onPress={() => toggleSleep()}>
                <Moon color="#fff" size={24} />
                <Text style={styles.sleepButtonText}>Uykusu Geldi</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        );

      case 'kitchen':
        return (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.roomContent}>
            <View style={styles.roomHeader}>
              <Utensils color="#fff" size={32} />
              <Text style={styles.roomTitle}>Mutfak</Text>
            </View>
            <View style={styles.kitchenActions}>
              <TouchableOpacity 
                style={styles.kitchenButton} 
                onPress={() => setMarketModalVisible(true)}
              >
                <Text style={styles.kitchenButtonText}>Yemek Al 🍕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      default:
        return (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.roomContent}>
             <View style={styles.roomHeader}>
              <Play color="#fff" size={32} />
              <Text style={styles.roomTitle}>Oyun Alanı</Text>
            </View>
            <View style={styles.gardenActions}>
              <TouchableOpacity 
                style={[styles.gardenButton, gameState.isSleeping && styles.disabledButton]} 
                onPress={() => !gameState.isSleeping && setPlayModalVisible(true)}
                disabled={gameState.isSleeping}
              >
                <Text style={styles.gardenButtonText}>Oyun Oyna 🎮</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentLocation.gradient as any}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* DigiPet */}
        <View style={styles.petSection}>
          <DigiPet
            name={gameState.name}
            species={gameState.type}
            hunger={gameState.hunger}
            happiness={gameState.happiness}
            energy={gameState.energy}
            level={gameState.level}
            isSleeping={gameState.isSleeping}
          />
          
          {/* Interactive Food */}
          {onScreenFood && (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleEatFood}
              style={styles.foodContainer}
            >
              <Animated.Text style={[styles.foodAnimationIcon, foodAnimatedStyle]}>
                {onScreenFood.emoji}
              </Animated.Text>
              <Animated.View entering={FadeInDown} style={styles.eatHint}>
                <Text style={styles.eatHintText}>Yemek için tıkla!</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
          
          {/* Speech Bubble */}
          {showBubble && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.bubbleContainer}>
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>Hmmm 😋</Text>
              </View>
              <View style={styles.bubbleArrow} />
            </Animated.View>
          )}
        </View>

        {/* Actions - Room Specific */}
        {renderRoomContent()}
      </ScrollView>

      <BottomNavBar 
        currentLocationId={gameState.currentLocationId}
        onNavigate={(id) => setLocation(id)}
      />

      {/* Re-located Header Buttons for cleaner look */}
      <View style={styles.floatingHeader}>
        <View style={styles.goldBadge}>
          <Coins color={theme.colors.gold} size={16} />
          <Text style={styles.goldText}>{gameState.gold}</Text>
        </View>
        <View style={styles.rightHeaderButtons}>
          <TouchableOpacity style={styles.roundButton} onPress={onNavigateToAchievements}>
            <Trophy color={theme.colors.gold} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {gameState.isSleeping && (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.sleepOverlay}>
          <View style={styles.dimLayer} />
        </Animated.View>
      )}

      <MarketModal 
        visible={marketModalVisible} 
        level={gameState.level}
        gold={gameState.gold}
        petName={gameState.name}
        currentLocationId={gameState.currentLocationId}
        onClose={() => setMarketModalVisible(false)} 
        onSelectFood={handleSelectFood} 
        onSelectLocation={(loc) => {
          purchaseLocation(loc);
          setMarketModalVisible(false);
        }}
        onUpdateProfile={(name) => {
          updatePetProfile(name, gameState.type);
          setMarketModalVisible(false);
        }}
      />

      <PlayModal
        visible={playModalVisible}
        onClose={() => setPlayModalVisible(false)}
        onSelectGame={onNavigateToGame}
      />

      <AchievementUnlockModal
        visible={modalAchievement !== null}
        achievement={modalAchievement}
        onDismiss={handleDismissModal}
      />

      <LevelUpModal
        visible={levelUpModalVisible}
        level={gameState.level}
        onClose={() => setLevelUpModalVisible(false)}
      />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  petName: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    marginTop: 4,
  },
  goldText: {
    color: theme.colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
  },
  levelBadge: {
    backgroundColor: theme.colors.primary + '40',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  pointsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.gold,
    borderRadius: theme.borderRadius.full,
  },
  floatingHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },
  rightHeaderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  petSection: {
    marginTop: 80,
    marginBottom: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  foodAnimationIcon: {
    fontSize: 60,
  },
  foodContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%', // Adjust based on pet position
    zIndex: 100,
    alignItems: 'center',
  },
  eatHint: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  eatHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bubbleContainer: {
    position: 'absolute',
    top: -40,
    right: '20%',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bubbleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  actionsContainer: {
    marginBottom: theme.spacing.md,
  },
  sleepOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,15,0.6)',
  },
  roomContent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sleepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sleepText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sleepProgressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sleepProgressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  sleepProgressBarFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 6,
  },
  sleepPercentage: {
    color: '#fff',
    fontWeight: 'bold',
    width: 40,
  },
  sleepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a5298',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    gap: 10,
  },
  sleepButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  kitchenActions: {
    width: '100%',
  },
  kitchenButton: {
    backgroundColor: '#F7971E',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  kitchenButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gardenActions: {
    width: '100%',
  },
  gardenButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: theme.colors.textSecondary,
  },
  gardenButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
