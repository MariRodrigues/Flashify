import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFlashcardsByCategory } from '../services/database';
import { Flashcard } from '../types';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import theme from '../theme';

type StudyScreenParams = {
  categoryId: string;
  categoryName: string;
  category: {
    id: string;
    name: string;
    createdAt: string;
    flashcardCount: number;
  };
};

type RootStackParamList = {
  DeckDetails: { category: { id: string; name: string; createdAt: string; flashcardCount: number } };
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const WavyHeader = () => {
  return (
    <Svg
      height="260"
      width={width}
      viewBox={`0 0 ${width} 260`}
      style={styles.wavyHeader}
    >
      <Path
        d={`M0 0h${width}v200c0 0-${width/2} 60-${width} 0V0z`}
        fill={theme.colors.primary}
      />
    </Svg>
  );
};

export default function StudyScreen() {
  const route = useRoute<RouteProp<Record<string, StudyScreenParams>, string>>();
  const navigation = useNavigation<NavigationProp>();
  const { categoryId, categoryName, category } = route.params;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFlashcards();
  }, [categoryId]);

  const loadFlashcards = async () => {
    try {
      const result = await getFlashcardsByCategory(categoryId);
      setFlashcards(result);
    } catch (error) {
      console.error('Erro ao carregar os flashcards:', error);
    }
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.spring(flipAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 45,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      flipAnimation.setValue(0);
      setIsFlipped(false);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      flipAnimation.setValue(0);
      setIsFlipped(false);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const handleBackPress = () => {
    navigation.navigate('DeckDetails', { category });
  };

  if (flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <WavyHeader />
        <Text style={[styles.emptyText, { color: theme.colors.grayDark }]}>
          Nenhum flashcard encontrado nesta categoria.
        </Text>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <WavyHeader />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{categoryName}</Text>
          </View>
        </View>

        <View style={styles.studyContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} de {flashcards.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <View style={styles.cardWrapper}>
            <TouchableOpacity onPress={flipCard} activeOpacity={1}>
              <View style={styles.cardContainer}>
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardFront,
                    { transform: [{ rotateY: frontInterpolate }], backgroundColor: theme.colors.cardBackground },
                  ]}
                >
                  <Text style={[styles.cardText, { color: theme.colors.grayDarker }]}>{currentCard.front}</Text>
                </Animated.View>
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardBack,
                    { transform: [{ rotateY: backInterpolate }], backgroundColor: theme.colors.cardBackground },
                  ]}
                >
                  <Text style={[styles.cardText, { color: theme.colors.grayDarker }]}>{currentCard.back}</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.buttonDisabled]}
            onPress={previousCard}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? theme.colors.grayDark : theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.flipButton, { backgroundColor: theme.colors.primary }]} onPress={flipCard}>
            <Text style={[styles.flipButtonText, { color: theme.colors.white }]}>VIRAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === flashcards.length - 1 && styles.buttonDisabled]}
            onPress={nextCard}
            disabled={currentIndex === flashcards.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color={currentIndex === flashcards.length - 1 ? theme.colors.grayDark : theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lightBackground,
  },
  wavyHeader: {
    position: 'absolute',
    top: 0,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  studyContent: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    width: '85%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '85%',
    aspectRatio: 0.85,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardFront: {
  },
  cardBack: {
    backgroundColor: '#babef7',
  },
  cardText: {
    fontSize: 22,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightBackground,
  },
  flipButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 200,
    fontSize: 16,
  },
});
