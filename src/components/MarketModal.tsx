import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { X, Lock, ShoppingBasket, MapPin, Coins, User, Save, RefreshCw } from 'lucide-react-native';
import { FoodItem, LocationItem } from '../types';
import { FOOD_ITEMS } from '../constants/foods';
import { LOCATIONS } from '../constants/locations';
import { theme } from '../constants/theme';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MarketModalProps {
  visible: boolean;
  level: number;
  gold: number;
  petName: string;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
  onSelectLocation: (location: LocationItem) => void;
  onUpdateProfile: (name: string) => void;
  currentLocationId: string;
}

export const MarketModal: React.FC<MarketModalProps> = ({ 
  visible, 
  level, 
  gold,
  petName,
  onClose, 
  onSelectFood,
  onSelectLocation,
  onUpdateProfile,
  currentLocationId
}) => {
  const [activeTab, setActiveTab] = useState<'food' | 'locations' | 'profile'>('food');
  const [tempName, setTempName] = useState(petName);

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
            <View>
              <Text style={styles.title}>Mağaza</Text>
              <View style={styles.goldBadge}>
                <Coins color={theme.colors.gold} size={16} />
                <Text style={styles.goldText}>{gold}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={theme.colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'food' && styles.activeTab]} 
              onPress={() => setActiveTab('food')}
            >
              <ShoppingBasket color={activeTab === 'food' ? theme.colors.primaryLight : theme.colors.textSecondary} size={20} />
              <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>Yiyecekler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'locations' && styles.activeTab]} 
              onPress={() => setActiveTab('locations')}
            >
              <MapPin color={activeTab === 'locations' ? theme.colors.primaryLight : theme.colors.textSecondary} size={20} />
              <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>Mekanlar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'profile' && styles.activeTab]} 
              onPress={() => setActiveTab('profile')}
            >
              <User color={activeTab === 'profile' ? theme.colors.primaryLight : theme.colors.textSecondary} size={20} />
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profil</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {activeTab === 'food' ? (
              FOOD_ITEMS.map((food) => {
                const isLevelLocked = level < (food.minLevel ?? 1);
                const canAfford = gold >= food.price;
                const isLocked = isLevelLocked;

                return (
                  <TouchableOpacity
                    key={food.id}
                    disabled={isLocked || !canAfford}
                    style={[styles.item, isLocked && styles.itemLocked]}
                    onPress={() => onSelectFood(food)}
                  >
                    <View style={[styles.iconContainer, isLocked && styles.iconContainerLocked]}>
                      {isLocked ? (
                        <Lock color={theme.colors.textSecondary} size={24} />
                      ) : (
                        <Text style={styles.emoji}>{food.emoji}</Text>
                      )}
                    </View>
                    <View style={styles.info}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.itemName, isLocked && styles.itemNameLocked]}>{food.name}</Text>
                        <View style={styles.priceTag}>
                          <Coins color={canAfford ? theme.colors.gold : theme.colors.danger} size={14} />
                          <Text style={[styles.priceText, !canAfford && { color: theme.colors.danger }]}>{food.price}</Text>
                        </View>
                      </View>
                      {!isLocked ? (
                        <Text style={styles.stats}>
                          Tokluk {food.hungerEffect < 0 ? `+${-food.hungerEffect}` : food.hungerEffect} • Mutluluk +{food.happinessEffect}
                        </Text>
                      ) : (
                        <Text style={styles.lockHint}>Seviye {food.minLevel} Kilidi</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : activeTab === 'locations' ? (
              LOCATIONS.map((loc) => {
                const isLevelLocked = level < loc.minLevel;
                const isOwned = currentLocationId === loc.id;
                const canAfford = gold >= loc.price;
                const isLocked = isLevelLocked;

                return (
                  <TouchableOpacity
                    key={loc.id}
                    disabled={isLocked || (loc.price > 0 && !canAfford) || isOwned}
                    style={[styles.item, isLocked && styles.itemLocked, isOwned && styles.itemOwned]}
                    onPress={() => onSelectLocation(loc)}
                  >
                    <View style={[styles.locationPreview, { backgroundColor: loc.gradient[0] }]}>
                      {isLocked && <Lock color="white" size={20} />}
                    </View>
                    <View style={styles.info}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.itemName, isLocked && styles.itemNameLocked]}>{loc.name}</Text>
                        {loc.price > 0 ? (
                          <View style={styles.priceTag}>
                            <Coins color={canAfford ? theme.colors.gold : theme.colors.danger} size={14} />
                            <Text style={[styles.priceText, !canAfford && { color: theme.colors.danger }]}>{loc.price}</Text>
                          </View>
                        ) : (
                          <Text style={styles.freeText}>Ücretsiz</Text>
                        )}
                      </View>
                      {isOwned ? (
                        <Text style={styles.activeText}>Şu anki konum</Text>
                      ) : isLocked ? (
                        <Text style={styles.lockHint}>Seviye {loc.minLevel} Kilidi</Text>
                      ) : (
                        <Text style={styles.stats}>Ortamı değiştirmek için tıkla</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Animated.View entering={FadeInDown} style={styles.profileContainer}>
                <View style={styles.profileCard}>
                  <Text style={styles.profileLabel}>Evcil Hayvan İsmi</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={tempName}
                      onChangeText={setTempName}
                      placeholder="İsim girin..."
                      placeholderTextColor={theme.colors.textMuted}
                    />
                    <TouchableOpacity 
                      style={[styles.saveButton, tempName === petName && styles.saveButtonDisabled]} 
                      onPress={() => onUpdateProfile(tempName)}
                      disabled={tempName === petName}
                    >
                      <Save color="#fff" size={20} />
                      <Text style={styles.saveButtonText}>Kaydet</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <RefreshCw color={theme.colors.primaryLight} size={20} />
                  <Text style={styles.infoBoxText}>
                    Evcil hayvanınızın ismi her zaman oyun boyunca görünecektir. Ona havalı bir isim verin!
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  goldText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.primaryLight,
  },
  list: {
    gap: theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemLocked: {
    opacity: 0.5,
  },
  itemOwned: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(79, 172, 254, 0.05)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerLocked: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  emoji: {
    fontSize: 32,
  },
  locationPreview: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemNameLocked: {
    color: theme.colors.textSecondary,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    color: theme.colors.gold,
    fontWeight: 'bold',
  },
  stats: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  lockHint: {
    fontSize: 12,
    color: theme.colors.danger,
    fontWeight: '500',
  },
  activeText: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    fontWeight: 'bold',
  },
  freeText: {
    fontSize: 12,
    color: theme.colors.primaryLight,
    fontWeight: 'bold',
  },
  profileContainer: {
    padding: theme.spacing.sm,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  profileLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#444',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 126, 255, 0.1)',
    padding: theme.spacing.md,
    borderRadius: 15,
    marginTop: theme.spacing.lg,
    gap: 12,
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
