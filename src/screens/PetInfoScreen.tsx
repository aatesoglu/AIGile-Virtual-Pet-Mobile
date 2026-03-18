import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { getPetMood } from '../utils/petMood';
import { theme } from '../constants/theme';
import { ArrowLeft, Heart, Utensils } from 'lucide-react-native';

interface PetInfoScreenProps {
  onBack: () => void;
}

const PET_TYPE_LABEL: Record<string, string> = {
  cat: 'Kedi',
  dog: 'Köpek',
  bird: 'Kuş',
};

const MOOD_LABEL: Record<string, string> = {
  veryHappy: 'Çok mutlu',
  happy: 'Mutlu',
  neutral: 'Normal',
  sad: 'Üzgün',
  hungry: 'Aç',
};

export const PetInfoScreen: React.FC<PetInfoScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();
  const mood = getPetMood(gameState.hunger, gameState.happiness);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evcil Hayvan Bilgisi</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
          <Text style={styles.label}>İsim</Text>
          <Text style={styles.value}>{gameState.name}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.card}>
          <Text style={styles.label}>Tür</Text>
          <Text style={styles.value}>{PET_TYPE_LABEL[gameState.type] ?? gameState.type}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.card}>
          <View style={styles.labelRow}>
            <Utensils size={20} color={theme.colors.hunger} />
            <Text style={styles.label}>Tokluk</Text>
          </View>
          <Text style={styles.value}>
            %{100 - gameState.hunger} (Açlık: %{gameState.hunger})
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.card}>
          <View style={styles.labelRow}>
            <Heart size={20} color={theme.colors.happiness} />
            <Text style={styles.label}>Mutluluk</Text>
          </View>
          <Text style={styles.value}>%{gameState.happiness}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.card}>
          <Text style={styles.label}>Mevcut ruh hali</Text>
          <Text style={styles.value}>{MOOD_LABEL[mood] ?? mood}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.card}>
          <Text style={styles.label}>Seviye & Puan</Text>
          <Text style={styles.value}>
            Seviye {gameState.level} · {gameState.totalPoints} puan
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
});
