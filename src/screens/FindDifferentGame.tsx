import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { ChevronLeft, Info } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { useGame } from '../context/GameContext';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const GRID_SIZE = 3;
const ROUND_TIME = 5; // 5 seconds per round

const EMOJI_PAIRS = [
  ['🍎', '🍏'], ['🐶', '🐱'], ['🦁', '🐯'], ['🐼', '🐨'],
  ['⚽', '🏀'], ['🚗', '🚲'], ['☀️', '🌙'], ['🔥', '💧'],
  ['🍓', '🍒'], ['🌮', '🍔'], ['🍦', '🍩'], ['🎈', '🎁'],
];

interface FindDifferentGameProps {
  onBack: () => void;
}

export const FindDifferentGame: React.FC<FindDifferentGameProps> = ({ onBack }) => {
  const { completeGame } = useGame();
  const [round, setRound] = useState(1);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [diffIndex, setDiffIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [errors, setErrors] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressWidth = useSharedValue(1);

  const startRound = useCallback(() => {
    const pair = EMOJI_PAIRS[Math.floor(Math.random() * EMOJI_PAIRS.length)];
    const base = pair[0];
    const diff = pair[1];
    
    const newEmojis = new Array(9).fill(base);
    const dIdx = Math.floor(Math.random() * 9);
    newEmojis[dIdx] = diff;
    
    setEmojis(newEmojis);
    setDiffIndex(dIdx);
    setTimeLeft(ROUND_TIME);
    progressWidth.value = 1;
    progressWidth.value = withTiming(0, { duration: ROUND_TIME * 1000 });
  }, []);

  useEffect(() => {
    startRound();
  }, [startRound]);

  useEffect(() => {
    if (isGameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleGameOver('Zaman doldu!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round, isGameOver]);

  const handlePress = (idx: number) => {
    if (isGameOver) return;

    if (idx === diffIndex) {
      // Correct!
      setScore(s => s + 1);
      setRound(r => r + 1);
      if (timerRef.current) clearInterval(timerRef.current);
      startRound();
    } else {
      // Wrong
      const newErrors = errors + 1;
      setErrors(newErrors);
      if (newErrors >= 3) {
        handleGameOver('Çok fazla hata!');
      }
    }
  };

  const handleGameOver = (reason: string) => {
    setIsGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => {
      completeGame('different', score, score * 10); // 10 XP per round won
      onBack();
    }, 2000);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <View style={styles.statsHeader}>
          <Text style={styles.title}>Farklıyı Bul</Text>
          <Text style={styles.roundText}>Round {round}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorLabel}>HATA</Text>
          <Text style={styles.errorCount}>{errors}/3</Text>
        </View>
      </View>

      <View style={styles.timerBarContainer}>
        <Animated.View style={[styles.timerBar, progressStyle]} />
      </View>

      <View style={styles.grid}>
        {emojis.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => handlePress(i)}
            style={styles.tile}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Info color={theme.colors.textSecondary} size={18} />
        <Text style={styles.infoText}>Hızlı ol ve farklı emojiyi seç!</Text>
      </View>

      {isGameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>OYUN BİTTİ</Text>
          <Text style={styles.overlayScore}>{score} Puan Topladın</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - 60) / 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  statsHeader: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  roundText: { fontSize: 14, color: theme.colors.primaryLight, fontWeight: '600' },
  errorContainer: { alignItems: 'flex-end' },
  errorLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '800' },
  errorCount: { fontSize: 18, color: theme.colors.danger, fontWeight: 'bold' },
  timerBarContainer: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', width: '80%', alignSelf: 'center', borderRadius: 3, overflow: 'hidden', marginVertical: 20 },
  timerBar: { height: '100%', backgroundColor: theme.colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 10 },
  tile: { width: TILE_SIZE, height: TILE_SIZE, margin: 5, backgroundColor: theme.colors.surface, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  emojiText: { fontSize: 40 },
  infoBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 10 },
  infoText: { color: theme.colors.textSecondary, fontSize: 14 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,14,23,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  overlayTitle: { fontSize: 40, fontWeight: '900', color: theme.colors.danger },
  overlayScore: { fontSize: 24, color: '#fff', marginTop: 10 },
});
