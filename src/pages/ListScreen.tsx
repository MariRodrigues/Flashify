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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { getMyDecks, Deck, DeckListResponse } from '../services/deckService';

type RootStackParamList = {
  Study: { deckId: number; deckName: string };
  DeckDetails: { deck: Deck };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckResponse, setDeckResponse] = useState<DeckListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDecks = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await getMyDecks();
      setDecks(result.items);
      setDeckResponse(result);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [])
  );

  const handleDeckPress = (deck: Deck) => {
    navigation.navigate('DeckDetails', { deck });
  };

  const handleStudyPress = (deckId: number, deckName: string, e: any) => {
    e.stopPropagation();
    navigation.navigate('Study', { deckId, deckName });
  };

  const renderDeckCard = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleDeckPress(item)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.cardCount} {item.cardCount === 1 ? 'card' : 'cards'}
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
            Carregando decks...
          </Text>
        </View>
      ) : decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyText}>
            Nenhum deck encontrado.{'\n'}
            Crie um novo deck para começar!
          </Text>
        </View>
      ) : (
        <FlatList
          data={decks}
          renderItem={renderDeckCard}
          keyExtractor={item => item.id.toString()}
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
