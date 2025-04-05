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
import { getFlashcardsByCategory } from '../services/database';
import { Flashcard } from '../types';
import { Ionicons } from '@expo/vector-icons';

type StudyScreenParams = {
  categoryId: string;
  categoryName: string;
};

export default function StudyScreen() {
  const route = useRoute<RouteProp<Record<string, StudyScreenParams>, string>>();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params;
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

  if (flashcards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>
          Nenhum flashcard encontrado nesta categoria.
        </Text>
      </SafeAreaView>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{categoryName}</Text>
          <Text style={styles.progress}>
            {currentIndex + 1}/{flashcards.length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        <TouchableOpacity onPress={flipCard} activeOpacity={1}>
          <View style={styles.cardContainer}>
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                { transform: [{ rotateY: frontInterpolate }] },
              ]}
            >
              <Text style={styles.cardText}>{currentCard.front}</Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                { transform: [{ rotateY: backInterpolate }] },
              ]}
            >
              <Text style={styles.cardText}>{currentCard.back}</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.buttonDisabled]}
          onPress={previousCard}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? "#ccc" : "#fff"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
          <Text style={styles.flipButtonText}>VIRAR CARTÃO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentIndex === flashcards.length - 1 && styles.buttonDisabled]}
          onPress={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          <Ionicons name="chevron-forward" size={24} color={currentIndex === flashcards.length - 1 ? "#ccc" : "#fff"} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF1493',
  },
  header: {
    padding: 16,
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  progress: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '85%',
    aspectRatio: 1,
    maxHeight: '70%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardFront: {
    backgroundColor: '#fff',
    zIndex: 2,
  },
  cardBack: {
    backgroundColor: '#fff',
    zIndex: 1,
  },
  cardText: {
    fontSize: 32,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  flipButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  flipButtonText: {
    color: '#FF1493',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 32,
  },
});
