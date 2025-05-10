import axios from 'axios';
import { getToken, clearToken } from './tokenManager';
import { navigate } from '../utils/navigationRef';

const api = axios.create({
  baseURL: 'http://192.168.1.14:5011/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    console.log(`Interceptor - Request para ${config.url}`);
    console.log('Interceptor - Token encontrado:', token ? 'Sim' : 'Não');
    
    if (token) {
      // Garantir que o token seja aplicado corretamente
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Interceptor - Token aplicado no header');
      
      // Log para debug
      if (config.url && config.url.includes('/decks')) {
        console.log('Interceptor - Requisição para decks com token:', token.substring(0, 15) + '...');
      }
    } else {
      console.log('Interceptor - Requisição sem token de autorização');
    }
    return config;
  },
  (error) => {
    console.log('Interceptor - Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Limpa o token e navega para login apenas se for erro de autenticação
      console.log('Erro de autenticação 401, redirecionando para login');
      await clearToken();
      navigate('Login');
    }
    return Promise.reject(error);
  }
);

export default api;
