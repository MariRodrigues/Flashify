import api from './api';
import { getToken } from './tokenManager';

export interface Deck {
  id: number;
  name: string;
  cardCount: number;
}

export interface DeckDetails {
  deckId: number;
  name: string;
  totalCards: number;
  notStudied: number;
  easyCount: number;
  hardCount: number;
  newWordCount: number;
  lastStudiedAt: string;
  readyForReviewCount: number;
}

export interface DeckListResponse {
  pageIndex: number;
  totalPages: number;
  totalRows: number;
  items: Deck[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Fetches the user's decks from the API
 * @returns A promise with the deck list response
 */
export const getMyDecks = async (): Promise<DeckListResponse> => {
  try {
    // Let the API interceptor handle the token
    const response = await api.get<DeckListResponse>('/decks/my-decks');
    console.log('Decks API response:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching decks:', error);
    // Log more details about the error
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Gets a specific deck by ID
 * @param deckId The ID of the deck to fetch
 * @returns A promise with the deck details
 */
export const getDeckById = async (deckId: number): Promise<Deck> => {
  try {
    const response = await api.get<Deck>(`/decks/${deckId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching deck ${deckId}:`, error);
    throw error;
  }
};

/**
 * Busca informações detalhadas de estudo para um deck específico
 * @param deckId O ID do deck para buscar informações
 * @returns Detalhes do deck incluindo estatísticas de estudo
 */
export const getDeckStudyDetails = async (deckId: number): Promise<DeckDetails> => {
  try {
    const response = await api.get<DeckDetails>(`/study/decks/${deckId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching study details for deck ${deckId}:`, error);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', error.response.data);
    }
    throw error;
  }
};
