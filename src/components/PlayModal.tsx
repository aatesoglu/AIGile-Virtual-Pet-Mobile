import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Puzzle, Brain, Search } from 'lucide-react-native';
import { theme } from '../constants/theme';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface PlayModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGame: (gameId: 'puzzle' | 'memory' | 'different') => void;
}

export const PlayModal: React.FC<PlayModalProps> = ({ visible, onClose, onSelectGame }) => {
  const games = [
    { id: 'puzzle', name: 'Sayı Bulmacası', icon: <Puzzle color="#fff" size={32} />, color: '#4DA8DA', description: 'Rakamları sıraya diz!' },
    { id: 'memory', name: 'Hafıza Kartları', icon: <Brain color="#fff" size={32} />, color: '#A18CD1', description: 'Eşleri bul, hafızanı zorla!' },
    { id: 'different', name: 'Farklıyı Bul', icon: <Search color="#fff" size={32} />, color: '#FAD0C4', description: 'Hızlı ol, farklı olanı seç!' },
  ] as const;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View 
          entering={FadeInDown.duration(300).springify()} 
          exiting={FadeOutDown.duration(200)} 
          style={styles.sheet}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Hangi oyunu oynayalım?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.gameList}>
            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameItem}
                onPress={() => {
                  onSelectGame(game.id);
                  onClose();
                }}
              >
                <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
                  {game.icon}
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameDesc}>{game.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  gameList: {
    gap: theme.spacing.md,
  },
  gameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  gameDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
