import React, { useEffect, useState } from 'react';
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

type RootStackParamList = {
  Study: { categoryId: string; categoryName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Study'>;

export default function ListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    navigation.navigate('Study', { categoryId, categoryName });
  };

  const renderCategoryCard = ({ item }: { item: CategoryWithCount }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleCategoryPress(item.id, item.name)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCount}>
          {item.flashcardCount} {item.flashcardCount === 1 ? 'flashcard' : 'flashcards'}
        </Text>
      </View>
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={24} color="#FF1493" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color="rgba(255, 20, 147, 0.2)" />
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
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#333',
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: '#666',
  },
  cardArrow: {
    marginLeft: 8,
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
