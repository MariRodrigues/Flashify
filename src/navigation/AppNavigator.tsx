import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../pages/SplashScreen';
import { LoginScreen } from '../pages/auth/LoginScreen';
import ListScreen from '../pages/ListScreen';
import DeckDetailsScreen from '../pages/DeckDetailsScreen';
import StudyScreen from '../pages/StudyScreen';
import OptionsScreen from '../pages/OptionsScreen';
import { navigationRef, RootStackParamList } from '../utils/navigationRef';
import { useAuth } from '../hooks/useAuth';
import { getToken } from '../services/tokenManager';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isLoading, isAuthenticated, checkAuth } = useAuth();

  // Verificar autenticação quando o componente é montado
  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={ListScreen} />
        <Stack.Screen name="DeckDetails" component={DeckDetailsScreen} />
        <Stack.Screen name="Study" component={StudyScreen} />
        <Stack.Screen name="Options" component={OptionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
