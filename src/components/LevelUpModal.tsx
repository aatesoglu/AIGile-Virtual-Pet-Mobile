import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { getPetStage } from '../constants/gamification';
import Animated, { FadeIn, ZoomIn, FadeOut } from 'react-native-reanimated';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onClose }) => {
  const stage = getPetStage(level);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View 
          entering={ZoomIn.duration(500).springify()} 
          exiting={FadeOut.duration(300)} 
          style={styles.card}
        >
          <View style={styles.iconContainer}>
            <Trophy color={theme.colors.gold} size={60} />
          </View>
          <Text style={styles.congrats}>TEBRİKLER!</Text>
          <Text style={styles.levelUpText}>SEVİYE ATLADIN</Text>
          
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
          
          <Text style={styles.stageText}>Yeni Evren: <Text style={styles.stageName}>{stage}</Text></Text>
          
          <Text style={styles.description}>
            Evcil hayvanın daha da güçlendi ve büyüdü!
          </Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,14,23,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: theme.colors.gold,
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  congrats: {
    fontSize: 14,
    color: theme.colors.gold,
    fontWeight: '800',
    letterSpacing: 2,
  },
  levelUpText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#fff',
  },
  levelNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  stageText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 10,
  },
  stageName: {
    color: theme.colors.primaryLight,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
