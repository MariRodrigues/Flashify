import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { isSectionDownloaded, saveDeckSection } from '../services/database';

type Section = {
  title: string;
  csvUrl: string;
  isDownloaded?: boolean;
  isDownloading?: boolean;
};

type Deck = {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  sections: Section[];
};

export default function CatalogScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const decksData = require('../../assets/flashify/decks.json');
      
      // Verifica quais seções já foram baixadas
      const decksWithStatus = await Promise.all(
        decksData.map(async (deck: Deck) => ({
          ...deck,
          sections: await Promise.all(
            deck.sections.map(async (section) => ({
              ...section,
              isDownloaded: await isSectionDownloaded(deck.id, section.title),
              isDownloading: false,
            }))
          ),
        }))
      );
      
      setDecks(decksWithStatus);
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    }
  };

  const handleDownload = async (deckId: string, deckTitle: string, sectionIndex: number) => {
    try {
      const deckIndex = decks.findIndex(d => d.id === deckId);
      const updatedDecks = [...decks];
      
      // Marca como downloading
      updatedDecks[deckIndex].sections[sectionIndex].isDownloading = true;
      setDecks(updatedDecks);

      // Faz o download
      await saveDeckSection(
        deckId,
        deckTitle,
        updatedDecks[deckIndex].sections[sectionIndex]
      );

      // Atualiza o status
      updatedDecks[deckIndex].sections[sectionIndex].isDownloading = false;
      updatedDecks[deckIndex].sections[sectionIndex].isDownloaded = true;
      setDecks(updatedDecks);

      Alert.alert('Sucesso', 'Seção baixada com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar seção:', error);
      Alert.alert('Erro', 'Não foi possível baixar a seção. Tente novamente.');
      
      // Remove o status de downloading em caso de erro
      const deckIndex = decks.findIndex(d => d.id === deckId);
      const updatedDecks = [...decks];
      updatedDecks[deckIndex].sections[sectionIndex].isDownloading = false;
      setDecks(updatedDecks);
    }
  };

  const renderDeck = (deck: Deck) => (
    <View key={deck.id} style={styles.deckCard}>
      <View style={styles.deckHeader}>
        <Text style={styles.deckTitle}>{deck.title}</Text>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{deck.language.toUpperCase()}</Text>
          <Text style={styles.tag}>{deck.level}</Text>
        </View>
      </View>
      
      <Text style={styles.description}>{deck.description}</Text>
      
      <View style={styles.sectionsContainer}>
        {deck.sections.map((section, index) => (
          <View key={index} style={styles.sectionItem}>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.downloadButton,
                section.isDownloaded && styles.downloadButtonDisabled
              ]}
              onPress={() => !section.isDownloaded && !section.isDownloading && handleDownload(deck.id, deck.title, index)}
              disabled={section.isDownloaded || section.isDownloading}
            >
              {section.isDownloading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons 
                  name={section.isDownloaded ? "checkmark-circle" : "download-outline"} 
                  size={24} 
                  color={section.isDownloaded ? theme.colors.primary : theme.colors.primary} 
                />
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subheader}>Decks prontos para você estudar</Text>
      {decks.map(renderDeck)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lightBackground,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.grayDarker,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: theme.colors.grayDark,
    marginBottom: 24,
  },
  deckCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.grayDarker,
    flex: 1,
    marginRight: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.colors.grayDark,
    marginBottom: 16,
  },
  sectionsContainer: {
    gap: 12,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.lightBackground,
    padding: 12,
    borderRadius: 8,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    color: theme.colors.grayDarker,
    fontWeight: '500',
  },
  downloadButton: {
    padding: 8,
  },
  downloadButtonDisabled: {
    opacity: 0.5,
  },
});
