import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ShoppingBasket, Gamepad2, Moon, Sun } from 'lucide-react-native';
import { theme } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ActionButtonsProps {
  onFeed: () => void;
  onPlay: () => void;
  onSleep: () => void;
  isSleeping: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onFeed, onPlay, onSleep, isSleeping }) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon={<ShoppingBasket color="#fff" size={24} />}
        label="Mağaza"
        color={theme.colors.gold}
        onPress={onFeed}
      />
      <ActionButton
        icon={<Gamepad2 color="#fff" size={24} />}
        label="Oyna"
        color={theme.colors.happiness}
        onPress={onPlay}
        disabled={isSleeping}
      />
      <ActionButton
        icon={isSleeping ? <Sun color="#fff" size={24} /> : <Moon color="#fff" size={24} />}
        label={isSleeping ? "Uyandır" : "Uyu"}
        color={isSleeping ? theme.colors.primary : theme.colors.secondary}
        onPress={onSleep}
      />
    </View>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, onPress, disabled }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <AnimatedTouchable
      activeOpacity={disabled ? 0.6 : 1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.button,
        animatedStyle,
        { backgroundColor: disabled ? '#444' : color },
      ]}
    >
      {icon}
      <Text style={styles.buttonText}>{label}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    minHeight: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
});
