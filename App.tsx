import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ListScreen from './src/pages/ListScreen';
import StudyScreen from './src/pages/StudyScreen';
import DeckDetailsScreen from './src/pages/DeckDetailsScreen';
import CatalogScreen from './src/pages/CatalogScreen';
import ImportScreen from './src/pages/ImportScreen';
import { initDatabase } from './src/services/database';
import theme from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: '#eee',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          title: 'Meus Decks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          title: 'Catálogo de Decks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Import"
        component={ImportScreen}
        options={{
          title: 'Importar Flashcards',
          tabBarLabel: 'Importar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log('🛠️ Inicializando banco...');
        await initDatabase();
        console.log('✅ Banco pronto!');
        setIsDbReady(true);
      } catch (e) {
        console.error('❌ Erro ao iniciar banco:', e);
      }
    };

    setup();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF1493" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.lightBackground
          },
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
        />
        <Stack.Screen 
          name="DeckDetails" 
          component={DeckDetailsScreen}
          options={{
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen 
          name="Study" 
          component={StudyScreen}
          options={{
            animation: 'slide_from_right'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}