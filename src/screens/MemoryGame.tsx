import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { useGame } from '../context/GameContext';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
} from 'react-native-reanimated';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const GRID_SIZE = 4;

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  onBack: () => void;
}

const CardItem = ({ card, onPress }: { card: Card, onPress: () => void }) => {
  const flipValue = useSharedValue(0);

  useEffect(() => {
    flipValue.value = withTiming(card.isFlipped || card.isMatched ? 180 : 0, { duration: 300 });
  }, [card.isFlipped, card.isMatched]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipValue.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipValue.value - 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.cardContainer}>
      <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
        <Text style={styles.cardQuestion}>?</Text>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardBack, backStyle, card.isMatched && styles.cardMatched]}>
        <Text style={styles.cardEmoji}>{card.emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const { completeGame } = useGame();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = useCallback(() => {
    const pairEmojis = [...EMOJIS, ...EMOJIS];
    const shuffled = pairEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIds([]);
    setMoves(0);
    setErrors(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handlePress = (id: number) => {
    if (isWon || flippedIds.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = newCards.find(c => c.id === secondId)!;

      if (firstCard.emoji === secondCard.emoji) {
        // Match!
        setTimeout(() => {
          setCards(prev => {
            const updated = prev.map(c => 
              (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true, isFlipped: false } : c
            );
            if (updated.every(c => c.isMatched)) {
              setIsWon(true);
              handleWin();
            }
            return updated;
          });
          setFlippedIds([]);
        }, 500);
      } else {
        // No match
        setErrors(e => e + 1);
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    let xp = 20;
    if (errors < 5) xp = 60;
    else if (errors < 10) xp = 40;

    setTimeout(() => {
      completeGame('memory', moves, xp);
      onBack();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Hafıza Kartları</Text>
        <TouchableOpacity onPress={initGame} style={styles.backButton}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Yenile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>HAMLE</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>HATA</Text>
          <Text style={[styles.statValue, { color: theme.colors.danger }]}>{errors}</Text>
        </View>
      </View>

      <FlatList
        data={cards}
        numColumns={GRID_SIZE}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <CardItem card={item} onPress={() => handlePress(item.id)} />
        )}
        contentContainerStyle={styles.grid}
        style={styles.list}
      />

      {isWon && (
        <View style={styles.winOverlay}>
          <Text style={styles.winText}>MÜKEMMEL!</Text>
          <Text style={styles.winSubText}>Tüm eşleri buldun!</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const CARD_MARGIN = 8;
const GRID_WIDTH = width - (GRID_PADDING * 2);
const CARD_SIZE = (GRID_WIDTH / GRID_SIZE) - (CARD_MARGIN * 2);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.lg },
  backButton: { height: 44, paddingHorizontal: 12, borderRadius: 22, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: theme.spacing.lg },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.gold },
  list: { flex: 1 },
  grid: { padding: GRID_PADDING, alignItems: 'center' },
  cardContainer: { width: CARD_SIZE, height: CARD_SIZE, margin: CARD_MARGIN },
  card: { ...StyleSheet.absoluteFillObject, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardFront: { backgroundColor: theme.colors.primary, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  cardBack: { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary },
  cardQuestion: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  cardEmoji: { fontSize: 30 },
  cardMatched: { backgroundColor: theme.colors.success + '40', borderColor: theme.colors.success },
  winOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(161,140,209,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  winText: { fontSize: 48, fontWeight: '900', color: '#fff' },
  winSubText: { fontSize: 20, color: '#fff', marginTop: 10 },
});
