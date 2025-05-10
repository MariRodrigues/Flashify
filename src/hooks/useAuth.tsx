import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getToken, clearToken } from '../services/tokenManager';
import { getUserProfile, UserProfile } from '../services/auth';

interface AuthContextData {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const defaultContext: AuthContextData = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  checkAuth: async () => {},
};

export const AuthContext = createContext<AuthContextData>(defaultContext);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (token) {
        try {
          const userProfile = await getUserProfile();
          setUser(userProfile);
        } catch (profileError) {
          console.log('Erro ao obter perfil do usuário:', profileError);
          setUser(null);
          await clearToken();
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Erro ao verificar autenticação:', error);
      setUser(null);
      await clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const contextValue: AuthContextData = {
    isLoading,
    isAuthenticated: !!user,
    user,
    checkAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
