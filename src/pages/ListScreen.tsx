import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getCategories, CategoryWithCount } from '../services/database';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

type RootStackParamList = {
  Study: { categoryId: string; categoryName: string };
  DeckDetails: { category: CategoryWithCount };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const handleCategoryPress = (category: CategoryWithCount) => {
    navigation.navigate('DeckDetails', { category });
  };

  const handleStudyPress = (categoryId: string, categoryName: string, e: any) => {
    e.stopPropagation();
    navigation.navigate('Study', { categoryId, categoryName });
  };

  const renderCategoryCard = ({ item }: { item: CategoryWithCount }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.flashcardCount} {item.flashcardCount === 1 ? 'card' : 'cards'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.studyButton}
        onPress={(e) => handleStudyPress(item.id, item.name, e)}
      >
        <Ionicons name="play-forward-outline" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyText}>
            Carregando categorias...
          </Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyText}>
            Nenhuma categoria encontrada.{'\n'}
            Importe seus flashcards primeiro!
          </Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.grayDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.grayDarker,
  },
  studyButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
});
