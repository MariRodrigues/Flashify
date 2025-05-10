import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider } from './src/hooks/useAuth';
import { navigationRef } from './src/utils/navigationRef';
import { LoginScreen } from './src/pages/auth/LoginScreen';
import ListScreen from './src/pages/ListScreen';
import StudyScreen from './src/pages/StudyScreen';
import DeckDetailsScreen from './src/pages/DeckDetailsScreen';
import CatalogScreen from './src/pages/CatalogScreen';
import OptionsScreen from './src/pages/OptionsScreen';
import { initDatabase } from './src/services/database';
import theme from './src/theme';
import { SplashScreen } from './src/pages/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list';

          if (route.name === 'List') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Options') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{ title: 'Meus Decks' }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ title: 'Catálogo' }}
      />
      <Tab.Screen
        name="Options"
        component={OptionsScreen}
        options={{ title: 'Opções' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to init database:', error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DeckDetails"
            component={DeckDetailsScreen}
            options={{ title: 'Detalhes do Deck' }}
          />
          <Stack.Screen
            name="Study"
            component={StudyScreen}
            options={{ title: 'Estudar' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}