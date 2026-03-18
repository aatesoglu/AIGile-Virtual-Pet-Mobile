import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import { StatBar } from './StatBar';
import { theme } from '../constants/theme';
import { PetType } from '../types';

interface DigiPetProps {
  name: string;
  species: PetType;
  hunger: number;
  happiness: number;
  energy: number;
  level: number;
  isSleeping?: boolean;
}

const PET_IMAGES: Record<PetType, any> = {
  cat: require('../../assets/pets/cat.png'),
  dog: require('../../assets/pets/dog.png'),
  bird: require('../../assets/pets/bird.png'),
};

export const DigiPet: React.FC<DigiPetProps> = ({ name, species, hunger, happiness, energy, level, isSleeping }) => {
  // Bouncing animation for the pet
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Idle animation: gently floating up and down
    translateY.value = withRepeat(
      withTiming(isSleeping ? 5 : -10, { duration: isSleeping ? 2000 : 1000 }), 
      -1, 
      true
    );
  }, [translateY, isSleeping]);

  const petAnimatedStyle = useAnimatedStyle(() => {
    // Growth scale: starts at 1.0 at L1, grows slightly per level
    const growthScale = (1 + (level - 1) * 0.05) * (isSleeping ? 0.9 : 1); 
    return {
      transform: [
        { translateY: translateY.value },
        { scale: withTiming(growthScale) }
      ],
      opacity: isSleeping ? withTiming(0.8) : withTiming(1),
    };
  });

  return (
    <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.container}>
      <Text style={styles.name}>{name}{isSleeping ? ' (Uyuyor)' : ''}</Text>
      
      <Animated.View style={[styles.avatarContainer, petAnimatedStyle]}>
        <View style={styles.petGlow} />
        <View style={styles.imageMask}>
          <Image 
            source={PET_IMAGES[species]} 
            style={[styles.petImage, isSleeping && styles.petImageSleeping]}
            resizeMode="cover"
          />
        </View>
        {isSleeping && (
          <View style={styles.zzzContainer}>
            <Text style={styles.zzzText}>Zzz...</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.statsContainer}>
        <StatBar label="Tokluk" value={100 - hunger} color={theme.colors.hunger} />
        <StatBar label="Mutluluk" value={happiness} color={theme.colors.happiness} />
        <StatBar label="Enerji" value={energy} color="#4DA8DA" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  avatarContainer: {
    marginVertical: theme.spacing.xl,
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  imageMask: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#fff', // Ensures no transparency gaps if masking
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petImageSleeping: {
    opacity: 0.6,
    tintColor: 'rgba(100, 100, 255, 0.2)',
  },
  zzzContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  zzzText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
  },
  statsContainer: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
});
