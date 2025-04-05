import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ListScreen from './src/pages/ListScreen';
import ImportScreen from './src/pages/ImportScreen';
import StudyScreen from './src/pages/StudyScreen';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
  MainTabs: undefined;
  Study: { categoryId: string; categoryName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF1493',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        tabBarActiveTintColor: '#FF1493',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
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
        name="Lista"
        component={ListScreen}
        options={{
          title: 'Minhas Categorias',
          tabBarLabel: 'Categorias',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Importar"
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
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={({ route }) => ({
            title: route.params.categoryName,
            headerShown: false,
          })}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
