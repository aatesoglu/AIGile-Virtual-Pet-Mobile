import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../constants/achievements';
import { theme } from '../constants/theme';
import { ArrowLeft, Award } from 'lucide-react-native';

interface BadgesScreenProps {
  onBack: () => void;
}

export const BadgesScreen: React.FC<BadgesScreenProps> = ({ onBack }) => {
  const { gameState } = useGame();
  const unlockedSet = new Set(gameState.unlockedAchievementIds);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rozetler</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overview}>
          <Award color={theme.colors.gold} size={28} />
          <Text style={styles.overviewText}>
            {gameState.unlockedAchievementIds.length} / {ACHIEVEMENTS.length} rozet
          </Text>
        </View>

        {ACHIEVEMENTS.map((ach, index) => {
          const unlocked = unlockedSet.has(ach.id);
          return (
            <Animated.View
              key={ach.id}
              entering={FadeInDown.delay(index * 80).duration(400)}
              style={[styles.card, !unlocked && styles.cardLocked]}
            >
              <View style={[styles.badgeCircle, { backgroundColor: ach.badgeColor + '25' }]}>
                <Text style={styles.badgeEmoji}>{ach.badgeEmoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, !unlocked && styles.textMuted]}>
                  {ach.title}
                </Text>
                <Text style={[styles.cardDesc, !unlocked && styles.textMuted]}>
                  {unlocked ? ach.description : '???'}
                </Text>
              </View>
              {unlocked && (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedText}>Açıldı</Text>
                </View>
              )}
            </Animated.View>
          );
        })}
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
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  overviewText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  cardLocked: {
    opacity: 0.7,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  badgeEmoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  textMuted: {
    color: theme.colors.textMuted,
  },
  unlockedBadge: {
    backgroundColor: theme.colors.success + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
});
