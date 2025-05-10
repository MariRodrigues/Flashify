import api from './api';
import { setToken, clearToken, getToken } from './tokenManager';

export interface LoginResponse {
  success: boolean;
  accessToken: string;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  tenantId: string | null;
  role: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Iniciando login com email:', email);
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    
    if (response.data.success && response.data.accessToken) {
      console.log('Login bem-sucedido, salvando token...');
      // Salvar token usando o gerenciador de token
      await setToken(response.data.accessToken);
      
      // Verificar se o token foi salvo corretamente
      const savedToken = await getToken();
      if (savedToken) {
        console.log('Token salvo com sucesso!');
      } else {
        console.error('Falha ao salvar o token!');
      }
    } else {
      console.error('Login falhou:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro durante o login:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    console.log('Buscando perfil do usuário...');
    const response = await api.get<UserProfile>('/auth/me');
    console.log('Perfil do usuário obtido com sucesso');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (uid: number, token: string, password: string): Promise<void> => {
  await api.post('/auth/reset-password', { uid, token, password });
};

export const logout = async (): Promise<void> => {
  await clearToken();
};
