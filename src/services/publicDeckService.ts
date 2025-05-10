import api from './api';

export interface PublicCategory {
  id: number;
  name: string;
  description: string;
}

export interface PublicCategoriesResponse {
  pageIndex: number;
  totalPages: number;
  totalRows: number;
  items: PublicCategory[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Busca todas as categorias públicas disponíveis
 * @returns Lista de categorias públicas
 */
export const getPublicCategories = async (): Promise<PublicCategoriesResponse> => {
  try {
    console.log('Buscando categorias públicas...');
    const response = await api.get<PublicCategoriesResponse>('/public-decks/categories');
    console.log(`Categorias públicas obtidas: ${response.data.items.length}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar categorias públicas:', error);
    if (error.response) {
      console.log('Erro status:', error.response.status);
      console.log('Erro dados:', error.response.data);
    }
    throw error;
  }
};

/**
 * Busca decks públicos de uma categoria específica
 * @param categoryId ID da categoria
 * @returns Lista de decks públicos da categoria
 */
export const getPublicDecksByCategory = async (categoryId: number): Promise<any> => {
  try {
    // Este endpoint ainda não existe, então esta é apenas uma implementação de placeholder
    console.log(`Buscando decks públicos da categoria ${categoryId}...`);
    // const response = await api.get(`/public-decks/categories/${categoryId}/decks`);
    // return response.data;
    
    // Por enquanto, retornamos um objeto vazio
    return {
      items: [],
      message: 'Endpoint ainda não implementado'
    };
  } catch (error: any) {
    console.error(`Erro ao buscar decks públicos da categoria ${categoryId}:`, error);
    throw error;
  }
};
