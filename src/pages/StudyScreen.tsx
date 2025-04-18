import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { getNextCardsToStudy } from '../services/studyService';
import type { FeedbackType } from '../services/studyService';
import { saveFeedback } from '../services/studyService';
import { Category, Flashcard } from '../types';

interface RouteParams {
  categoryId: string;
  categoryName: string;
  category: Category;
}

export default function StudyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params as RouteParams;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFlashcards();
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const loadFlashcards = async () => {
    try {
      const result = await getNextCardsToStudy(categoryId);
      setFlashcards(result);
    } catch (error) {
      console.error('Erro ao carregar os flashcards:', error);
      Alert.alert('Erro', 'Não foi possível carregar os flashcards.');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCardPress = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();
  };

  const handleFeedback = async (feedback: FeedbackType) => {
    if (!flashcards[currentIndex]) return;

    try {
      await saveFeedback(categoryId, flashcards[currentIndex].id, feedback);
      
      if (currentIndex === flashcards.length - 1) {
        Alert.alert(
          'Parabéns!',
          'Você completou todos os cards desta sessão.',
          [
            {
              text: 'Voltar ao deck',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setIsFlipped(false);
        flipAnimation.setValue(0);
        setCurrentIndex(currentIndex + 1);
      }
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      Alert.alert('Erro', 'Não foi possível salvar seu progresso.');
    }
  };

  const currentCard = flashcards[currentIndex];
  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{categoryName}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum card para estudar no momento.</Text>
          <TouchableOpacity style={styles.backToDecksButton} onPress={handleBackPress}>
            <Text style={styles.backToDecksText}>Voltar ao deck</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Card {currentIndex + 1} de {flashcards.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / flashcards.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleCardPress}
            style={styles.card}
          >
            <View style={styles.cardInner}>
              <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                <Text style={styles.cardText}>{currentCard.front}</Text>
              </Animated.View>
              <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                <Text style={styles.cardText}>{currentCard.back}</Text>
              </Animated.View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonError]}
              onPress={() => handleFeedback('errou')}
            >
              <Text style={styles.buttonText}>Errei</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonDifficult]}
              onPress={() => handleFeedback('dificuldade')}
            >
              <Text style={styles.buttonText}>Difícil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSuccess]}
              onPress={() => handleFeedback('acertou')}
            >
              <Text style={styles.buttonText}>Acertei</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 16,
    backgroundColor: theme.colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progress: {
    marginBottom: 24,
    backgroundColor: theme.colors.lightBackground,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.grayDarker,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 16,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    height: 300,
    marginBottom: 24,
  },
  cardInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFront: {
    backgroundColor: theme.colors.white,
  },
  cardBack: {
    backgroundColor: theme.colors.white,
  },
  cardText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonError: {
    backgroundColor: '#f38686',
  },
  buttonDifficult: {
    backgroundColor: '#ffda95',
  },
  buttonSuccess: {
    backgroundColor: '#b2fda8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.grayDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  backToDecksButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  backToDecksText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
