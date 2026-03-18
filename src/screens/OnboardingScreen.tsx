import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { PetType } from '../types';
import { theme } from '../constants/theme';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PET_OPTIONS: { type: PetType; label: string; image: any; emoji: string }[] = [
  { type: 'cat', label: 'Kedi', image: require('../../assets/pets/cat.png'), emoji: '🐱' },
  { type: 'dog', label: 'Köpek', image: require('../../assets/pets/dog.png'), emoji: '🐶' },
  { type: 'bird', label: 'Kuş', image: require('../../assets/pets/bird.png'), emoji: '🐦' },
];

export const OnboardingScreen: React.FC = () => {
  const { initializeGame } = useGame();
  const [selectedPet, setSelectedPet] = useState<PetType>('cat');
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim().length > 0) {
      initializeGame(name.trim(), selectedPet);
    }
  };

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <Text style={styles.welcomeText}>Hoş Geldiniz! 🌟</Text>
            <Text style={styles.subtitle}>Yeni dostunuzu seçin ve ona bir isim verin.</Text>
          </Animated.View>

          <View style={styles.petSelector}>
            {PET_OPTIONS.map((pet, index) => (
              <Animated.View key={pet.type} entering={FadeInUp.delay(300 + index * 100)}>
                <TouchableOpacity
                  style={[
                    styles.petCard,
                    selectedPet === pet.type && styles.selectedPetCard
                  ]}
                  onPress={() => setSelectedPet(pet.type)}
                >
                  <View style={styles.petImageContainer}>
                    <Image source={pet.image} style={styles.petImage} resizeMode="cover" />
                  </View>
                  <Text style={[styles.petLabel, selectedPet === pet.type && styles.selectedPetLabel]}>
                    {pet.label}
                  </Text>
                  {selectedPet === pet.type && (
                    <View style={styles.checkBadge}>
                      <Check color="#fff" size={14} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(800)} style={styles.inputSection}>
            <Text style={styles.inputLabel}>Dostunun İsmi Ne Olsun?</Text>
            <TextInput
              style={styles.input}
              placeholder="İsim girin..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={name}
              onChangeText={setName}
              maxLength={15}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1000)} style={styles.footer}>
            <TouchableOpacity
              style={[styles.startButton, (name.trim().length === 0) && styles.startButtonDisabled]}
              onPress={handleStart}
              disabled={name.trim().length === 0}
            >
              <Text style={styles.startButtonText}>Maceraya Başla! 🚀</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  petSelector: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
  },
  petCard: {
    width: (width - 90) / 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedPetCard: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  petImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    fontSize: 14,
  },
  selectedPetLabel: {
    color: '#fff',
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  inputSection: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 5,
  },
  input: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
  },
  startButton: {
    backgroundColor: '#fff',
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#4facfe',
    fontSize: 20,
    fontWeight: '900',
  },
});
