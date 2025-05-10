import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';

// In-memory cache of the token
let cachedToken: string | null = null;

// Flag para evitar múltiplas operações simultâneas
let isTokenOperationInProgress = false;

// Função para esperar o término de uma operação em andamento
const waitForTokenOperation = async (): Promise<void> => {
  if (isTokenOperationInProgress) {
    console.log('Aguardando operação de token em andamento...');
    // Espera um pouco e verifica novamente
    await new Promise(resolve => setTimeout(resolve, 100));
    return waitForTokenOperation();
  }
  return;
};

/**
 * Gets the authentication token from cache or AsyncStorage
 * @returns The authentication token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  // Return cached token if available
  if (cachedToken) {
    console.log('Usando token em cache');
    return cachedToken;
  }
  
  // Aguarda qualquer operação de token em andamento
  await waitForTokenOperation();
  
  try {
    isTokenOperationInProgress = true;
    console.log('Buscando token no AsyncStorage...');
    
    // Try to get token from AsyncStorage
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      // Update cache
      cachedToken = token;
      console.log('Token encontrado no AsyncStorage e armazenado em cache');
    } else {
      console.log('Nenhum token encontrado no AsyncStorage');
    }
    return token;
  } catch (error) {
    console.error('Erro ao recuperar token:', error);
    return null;
  } finally {
    isTokenOperationInProgress = false;
  }
};

/**
 * Sets the authentication token in both AsyncStorage and cache
 * @param token The token to save
 */
export const setToken = async (token: string): Promise<void> => {
  // Aguarda qualquer operação de token em andamento
  await waitForTokenOperation();
  
  try {
    isTokenOperationInProgress = true;
    console.log('Salvando token no AsyncStorage...');
    
    // Limpa o cache primeiro para evitar problemas
    cachedToken = null;
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(TOKEN_KEY, token);
    
    // Update cache após salvar com sucesso
    cachedToken = token;
    console.log('Token salvo com sucesso no AsyncStorage e em cache');
    
    // Verifica se o token foi realmente salvo
    const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (savedToken === token) {
      console.log('Verificação: token salvo corretamente');
    } else {
      console.error('Verificação falhou: o token salvo não corresponde ao original');
    }
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    throw error; // Propaga o erro para tratamento adequado
  } finally {
    isTokenOperationInProgress = false;
  }
};

/**
 * Clears the authentication token from both AsyncStorage and cache
 */
export const clearToken = async (): Promise<void> => {
  // Aguarda qualquer operação de token em andamento
  await waitForTokenOperation();
  
  try {
    isTokenOperationInProgress = true;
    console.log('Removendo token do AsyncStorage...');
    
    await AsyncStorage.removeItem(TOKEN_KEY);
    cachedToken = null;
    console.log('Token removido do AsyncStorage e do cache');
    
    // Verifica se o token foi realmente removido
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('Verificação: token removido com sucesso');
    } else {
      console.error('Verificação falhou: o token ainda existe no AsyncStorage');
    }
  } catch (error) {
    console.error('Erro ao remover token:', error);
  } finally {
    isTokenOperationInProgress = false;
  }
};
