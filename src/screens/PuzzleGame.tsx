import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { ChevronLeft, RefreshCw, HelpCircle } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { useGame } from '../context/GameContext';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming, 
  withRepeat,
  interpolateColor
} from 'react-native-reanimated';

const EMOJIS = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🐨', '🐷', '🐮'];

interface PuzzleGameProps {
  onBack: () => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onBack }) => {
  const { completeGame } = useGame();
  
  const [pattern, setPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [missingIndex, setMissingIndex] = useState(-1);
  const [correctAnswer, setCorrectAnswer] = useState('');
  
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Animation values
  const shakeOffset = useSharedValue(0);

  const generatePuzzle = useCallback(() => {
    // 1. Choose 2-3 random emojis for the pattern
    const pool = [...EMOJIS].sort(() => 0.5 - Math.random());
    const usedEmojis = pool.slice(0, Math.random() > 0.5 ? 3 : 2);
    
    // 2. Create a sequence (e.g., A B A B or A B C A B C)
    const sequence: string[] = [];
    const patternLength = 6;
    for (let i = 0; i < patternLength; i++) {
      sequence.push(usedEmojis[i % usedEmojis.length]);
    }

    // 3. Pick a missing index (usually near the end for "What comes next?")
    const mIdx = Math.random() > 0.5 ? 5 : 4;
    const correct = sequence[mIdx];
    
    // 4. Create options
    const otherOptions = pool.filter(e => e !== correct).slice(0, 2);
    const allOptions = [correct, ...otherOptions].sort(() => 0.5 - Math.random());

    setPattern(sequence);
    setMissingIndex(mIdx);
    setCorrectAnswer(correct);
    setOptions(allOptions);
    setFeedback(null);
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  const handleChoice = (emoji: string) => {
    if (isWon || feedback === 'correct') return;

    setAttempts(a => a + 1);
    
    if (emoji === correctAnswer) {
      setFeedback('correct');
      setScore(s => s + 1);
      
      // If they reach a certain score, they win the session
      if (score >= 2) { 
        setIsWon(true);
        handleWin();
      } else {
        // Next puzzle after small delay
        setTimeout(() => {
          generatePuzzle();
        }, 1000);
      }
    } else {
      setFeedback('wrong');
      // Shake animation
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      
      setTimeout(() => setFeedback(null), 800);
    }
  };

  const handleWin = () => {
    const xp = Math.max(10, 50 - seconds);
    setTimeout(() => {
      completeGame('puzzle', score + 1, xp);
      onBack();
    }, 1500);
  };

  const boardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Örüntü Bulmacası</Text>
        <TouchableOpacity onPress={generatePuzzle} style={styles.backButton}>
          <RefreshCw color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>PUAN</Text>
          <Text style={styles.statValue}>{score}/3</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SÜRE</Text>
          <Text style={styles.statValue}>{seconds}s</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        <Text style={styles.questionText}>Sıradaki hangisi gelmeli?</Text>
        
        <Animated.View style={[styles.patternContainer, boardAnimatedStyle]}>
          {pattern.map((emoji, index) => (
            <View 
              key={index} 
              style={[
                styles.tile, 
                index === missingIndex && styles.missingTile,
                index === missingIndex && feedback === 'correct' && styles.correctTile
              ]}
            >
              {index === missingIndex ? (
                feedback === 'correct' ? (
                  <Text style={styles.tileEmoji}>{emoji}</Text>
                ) : (
                  <HelpCircle color={theme.colors.textSecondary} size={32} />
                )
              ) : (
                <Text style={styles.tileEmoji}>{emoji}</Text>
              )}
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.optionsContainer}>
          {options.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                feedback === 'wrong' && correctAnswer !== emoji && styles.wrongOption
              ]}
              onPress={() => handleChoice(emoji)}
              disabled={feedback === 'correct'}
            >
              <Text style={styles.optionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {isWon && (
        <Animated.View entering={SlideInRight} style={styles.winOverlay}>
          <Text style={styles.winText}>HARİKA!</Text>
          <Text style={styles.winSubText}>Örüntü ustasısın!</Text>
        </Animated.View>
      )}

      <View style={styles.footer}>
        <Text style={styles.hint}>Mantıksal sırayı tamamla ✨</Text>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 15,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 30,
  },
  patternContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 50,
  },
  tile: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  missingTile: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
    borderBottomWidth: 2,
  },
  correctTile: {
    backgroundColor: theme.colors.success + '40',
    borderColor: theme.colors.success,
    borderStyle: 'solid',
  },
  tileEmoji: {
    fontSize: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  optionButton: {
    width: 70,
    height: 70,
    backgroundColor: theme.colors.surface,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  wrongOption: {
    opacity: 0.3,
  },
  optionEmoji: {
    fontSize: 35,
  },
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 172, 254, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  winText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  winSubText: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10,
  },
  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
