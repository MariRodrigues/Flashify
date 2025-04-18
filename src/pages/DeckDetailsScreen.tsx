import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Category, Flashcard } from '../types';
import { getFlashcardsByCategory, deleteCategory } from '../services/database';
import { getCategoryStats } from '../services/studyService';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MainTabs: undefined;
  Study: { categoryId: string; categoryName: string; category: Category };
  Lista: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  category: Category & { flashcardCount: number };
}

export default function DeckDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { category } = route.params as RouteParams;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState({
    notStudied: 0,
    pendingReview: 0,
    totalCards: 0
  });

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFlashcards();
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const categoryStats = await getCategoryStats(category.id);
    setStats(categoryStats);
  };

  const loadFlashcards = async () => {
    const cards = await getFlashcardsByCategory(category.id);
    setFlashcards(cards);
  };

  const handleStudyPress = () => {
    navigation.navigate('Study', {
      categoryId: category.id,
      categoryName: category.name,
      category: category
    });
  };

  const handleBackPress = () => {
    navigation.navigate('MainTabs');
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Deletar Deck',
      'Tem certeza que deseja deletar este deck? Esta ação não pode ser desfeita e todos os cards serão perdidos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              // Verifica se consegue voltar antes de navegar
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o deck. Tente novamente.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{category.name}</Text>
        <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCircle}>
            <Text style={styles.statNumber}>{stats.notStudied}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={styles.statsDetails}>
            <View style={styles.statRow}>
              <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.statText}>{stats.notStudied} não estudados</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="refresh-outline" size={20} color={'#cca63f'} />
              <Text style={styles.statText}>{stats.pendingReview} para revisar</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.studyButton,
            (!stats.notStudied && !stats.pendingReview) && styles.studyButtonDisabled
          ]}
          onPress={handleStudyPress}
          disabled={!stats.notStudied && !stats.pendingReview}
        >
          <Text style={styles.studyButtonText}>
            {!stats.notStudied && !stats.pendingReview
              ? 'Parabéns! Você estudou todos os cards'
              : 'Estudar cards'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Cards no deck ({stats.totalCards} no total)</Text>
        <FlatList
          data={flashcards}
          renderItem={({ item }) => (
            <View style={styles.cardItem}>
              <Text style={styles.cardFrontText}>{item.front}</Text>
              <Text style={styles.cardBackText}>{item.back}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cardList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 16,
    backgroundColor: theme.colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statsDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.grayDark,
  },
  statText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  studyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  studyButtonDisabled: {
    backgroundColor: theme.colors.grayDark,
  },
  studyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardList: {
    paddingBottom: 16,
  },
  cardItem: {
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardFrontText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  cardBackText: {
    fontSize: 14,
    color: theme.colors.grayDark,
    fontStyle: 'italic',
  },
});