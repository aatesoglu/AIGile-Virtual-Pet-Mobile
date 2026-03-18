import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { PetType, PetMood } from '../types';
import { getPetMood } from '../utils/petMood';
import { theme } from '../constants/theme';

interface PetAvatarProps {
  type: PetType;
  hunger: number;
  happiness: number;
  isSleeping?: boolean;
}

const PET_IMAGES: Record<PetType, any> = {
  cat: require('../../assets/pets/cat.png'),
  dog: require('../../assets/pets/dog.png'),
  bird: require('../../assets/pets/bird.png'),
};

const MOOD_LABEL: Record<PetMood, string> = {
  veryHappy: 'Çok mutlu!',
  happy: 'Mutlu',
  neutral: 'Normal',
  sad: 'Üzgün',
  hungry: 'Aç',
};

export const PetAvatar: React.FC<PetAvatarProps> = ({ type, hunger, happiness, isSleeping }) => {
  const mood = getPetMood(hunger, happiness);
  const scale = useSharedValue(1);
  const bounce = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 300 });
  }, [mood]);

  const runBounce = () => {
    bounce.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 8 })
    );
  };

  useEffect(() => {
    runBounce();
  }, [happiness, hunger]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isSleeping ? withTiming(0.9) : scale.value },
      { translateY: isSleeping ? withTiming(10) : bounce.value * -8 },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <View style={[styles.avatarCircle, mood === 'sad' && styles.avatarSad, mood === 'hungry' && styles.avatarHungry]}>
        <Image 
          source={PET_IMAGES[type]} 
          style={[styles.petImage, isSleeping && styles.petImageSleeping]}
          resizeMode="contain"
        />
        {isSleeping && (
          <View style={styles.zzzContainer}>
            <Text style={styles.zzzText}>Zzz...</Text>
          </View>
        )}
      </View>
      <Text style={styles.moodLabel}>{isSleeping ? 'Uyuyor...' : MOOD_LABEL[mood]}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarSad: {
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  avatarHungry: {
    borderColor: 'rgba(255, 154, 158, 0.6)',
    backgroundColor: 'rgba(255, 154, 158, 0.08)',
  },
  petImage: {
    width: 160,
    height: 160,
  },
  petImageSleeping: {
    opacity: 0.7,
    tintColor: 'rgba(200, 200, 255, 0.5)',
  },
  zzzContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  zzzText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontStyle: 'italic',
  },
  moodLabel: {
    marginTop: theme.spacing.md,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
