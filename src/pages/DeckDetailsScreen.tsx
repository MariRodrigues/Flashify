import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Platform,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Category, Flashcard } from '../types';
import { getFlashcardsByCategory, deleteCategory } from '../services/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import Svg, { Path } from 'react-native-svg';

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

  useEffect(() => {
    loadFlashcards();
    // Esconde a barra de navegação
    navigation.setOptions({
      headerShown: false
    });
  }, []);

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
              navigation.navigate('MainTabs');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o deck. Tente novamente.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const renderCard = ({ item }: { item: Flashcard }) => (
    <View style={styles.cardItem}>
      <Text style={styles.cardFront}>{item.front}</Text>
      <Text style={styles.cardBack}>{item.back}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <WavyHeader />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{category.name}</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.info}>
                {category.flashcardCount} {category.flashcardCount === 1 ? 'card' : 'cards'}
              </Text>
              <Text style={styles.info}>
                Criado em {format(category.createdAt, "dd 'de' MMMM',' yyyy", { locale: ptBR } as any)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={flashcards}
          renderItem={renderCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cardList}
        />
      </View>

      <TouchableOpacity 
        style={styles.studyButton} 
        onPress={handleStudyPress}
      >
        <Text style={styles.buttonText}>Estudar</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between'
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  info: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardList: {
    padding: 16,
    paddingBottom: 90,
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardFront: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardBack: {
    fontSize: 14,
    color: '#666',
  },
  studyButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(51, 36, 146, 0.95)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
