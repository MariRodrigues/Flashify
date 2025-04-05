import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { importCSV } from '../services/import';
import { Ionicons } from '@expo/vector-icons';

export default function ImportScreen() {
  const [importing, setImporting] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const handleImport = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }

    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await importCSV(file.uri, categoryName.trim());
        Alert.alert('Sucesso', 'Flashcards importados com sucesso!');
        setCategoryName('');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      Alert.alert('Erro', 'Falha ao importar flashcards');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={64} color="#FF1493" />
        </View>

        <Text style={styles.description}>
          Selecione um arquivo CSV com seus flashcards.{'\n'}
          O arquivo deve ter duas colunas: pergunta e resposta.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nome da categoria"
          placeholderTextColor="#999"
          value={categoryName}
          onChangeText={setCategoryName}
          editable={!importing}
        />

        <TouchableOpacity
          style={[styles.button, importing && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={importing}
        >
          <Text style={styles.buttonText}>
            {importing ? 'Importando...' : 'Selecionar Arquivo CSV'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#FF1493',
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF1493',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ffb6c1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
