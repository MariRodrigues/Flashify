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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Deck, DeckDetails, getDeckStudyDetails } from '../services/deckService';

type RootStackParamList = {
  Home: undefined;
  Study: { deckId: number; deckName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RouteParams {
  deck: Deck;
}

export default function DeckDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { deck } = route.params as RouteParams;
  const [isLoading, setIsLoading] = useState(false);
  const [deckDetails, setDeckDetails] = useState<DeckDetails | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDeckDetails();
    }, [])
  );

  const loadDeckDetails = async () => {
    try {
      setIsLoading(true);
      const details = await getDeckStudyDetails(deck.id);
      setDeckDetails(details);
    } catch (error) {
      console.error('Erro ao carregar detalhes do deck:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do deck.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudyPress = () => {
    navigation.navigate('Study', {
      deckId: deck.id,
      deckName: deck.name
    });
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
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
              // TODO: Implementar chamada para API para deletar deck
              // await deleteDeck(deck.id);
              
              // Por enquanto, apenas navega de volta
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
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
        <Text style={styles.title}>{deck.name}</Text>
        <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando detalhes do deck...</Text>
        </View>
      ) : deckDetails ? (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCircle}>
              <Text style={styles.statNumber}>{deckDetails.readyForReviewCount}</Text>
              <Text style={styles.statLabel}>Para revisar</Text>
            </View>

            <View style={styles.statsDetails}>
              <View style={styles.statRow}>
                <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.statText}>{deckDetails.notStudied} não estudados</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
                <Text style={styles.statText}>{deckDetails.easyCount} fáceis</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.warning} />
                <Text style={styles.statText}>{deckDetails.hardCount} difíceis</Text>
              </View>
              <View style={styles.statRow}>
                <Ionicons name="star-outline" size={20} color={theme.colors.info} />
                <Text style={styles.statText}>{deckDetails.newWordCount} novos</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.studyButton,
              deckDetails.readyForReviewCount === 0 && styles.studyButtonDisabled
            ]}
            onPress={handleStudyPress}
            disabled={deckDetails.readyForReviewCount === 0}
          >
            <Text style={styles.studyButtonText}>
              {deckDetails.readyForReviewCount === 0
                ? 'Parabéns! Você estudou todos os cards'
                : `Estudar ${deckDetails.readyForReviewCount} cards`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>
            Cards no deck ({deckDetails.totalCards} no total)
          </Text>
          
          <Text style={styles.lastStudiedText}>
            {deckDetails.lastStudiedAt 
              ? `Último estudo: ${new Date(deckDetails.lastStudiedAt).toLocaleDateString('pt-BR')}` 
              : 'Deck ainda não estudado'}
          </Text>

          {/* Placeholder para lista de cards que será implementada posteriormente */}
          <View style={styles.cardListPlaceholder}>
            <Ionicons name="list-outline" size={48} color={theme.colors.grayLight} />
            <Text style={styles.placeholderText}>Lista de cards será exibida em breve</Text>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Não foi possível carregar os detalhes do deck</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDeckDetails}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.grayDark,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
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
    paddingBottom: 20,
  },
  cardItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cardFrontText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.grayDark,
  },
  cardBackText: {
    fontSize: 14,
    color: theme.colors.grayDarker,
  },
  cardListPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.grayDark,
    textAlign: 'center',
  },
  lastStudiedText: {
    fontSize: 14,
    color: theme.colors.grayDarker,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});