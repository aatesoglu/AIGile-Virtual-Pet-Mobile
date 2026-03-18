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
import { ACHIEVEMENTS, getAchievementById } from '../constants/achievements';
import { theme } from '../constants/theme';
import { ArrowLeft, Award, Star } from 'lucide-react-native';

interface AchievementsScreenProps {
  onBack: () => void;
  onNavigateToBadges?: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  onBack,
  onNavigateToBadges,
}) => {
  const { gameState } = useGame();
  const unlockedIds = new Set(gameState.unlockedAchievementIds);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Başarımlar</Text>
        {onNavigateToBadges ? (
          <TouchableOpacity onPress={onNavigateToBadges} style={styles.badgesButton}>
            <Award color={theme.colors.gold} size={22} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsOverview}>
          <Text style={styles.statsText}>{gameState.name} ile ilerleme</Text>
          <View style={styles.levelBadge}>
            <Star color={theme.colors.gold} size={20} fill={theme.colors.gold} />
            <Text style={styles.levelText}>Seviye {gameState.level}</Text>
          </View>
          <Text style={styles.pointsText}>{gameState.totalPoints} puan</Text>
        </View>

        {gameState.unlockedAchievementIds.length === 0 ? (
          <Text style={styles.emptyText}>
            Henüz başarım kazanmadın. Evcil hayvanını besle ve onunla oyna!
          </Text>
        ) : (
          gameState.unlockedAchievementIds.map((id, index) => {
            const ach = getAchievementById(id);
            if (!ach) return null;
            return (
              <Animated.View
                key={id}
                entering={FadeInDown.delay(index * 100).duration(400)}
                style={styles.card}
              >
                <View style={[styles.iconContainer, { backgroundColor: ach.badgeColor + '25' }]}>
                  <Text style={styles.badgeEmoji}>{ach.badgeEmoji}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{ach.title}</Text>
                  <Text style={styles.cardDesc}>{ach.description}</Text>
                </View>
              </Animated.View>
            );
          })
        )}
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
  badgesButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  statsOverview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  statsText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gold + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.gold,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  badgeEmoji: { fontSize: 28 },
  textContainer: { flex: 1 },
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
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    lineHeight: 24,
  },
});
