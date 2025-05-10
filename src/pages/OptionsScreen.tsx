import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/auth';
import { useNavigation } from '@react-navigation/native';

export default function OptionsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    // A navegação para a tela de login será tratada pelo interceptor da API
  };

  const openWebsite = () => {
    Linking.openURL('https://flashify.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          {user && (
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.optionText, { color: theme.colors.error }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Importação</Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.info} />
            <Text style={styles.infoText}>
              A importação de flashcards agora é feita através do site Flashify. 
              Acesse com seu login para importar seus decks.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={openWebsite}>
            <Text style={styles.buttonText}>Acessar site</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.versionText}>Flashify v1.0.0</Text>
          <Text style={styles.copyrightText}> 2025 Flashify. Todos os direitos reservados.</Text>
        </View>
        
        <View style={styles.comingSoonSection}>
          <Ionicons name="construct-outline" size={48} color={theme.colors.grayLight} />
          <Text style={styles.comingSoonTitle}>Em desenvolvimento</Text>
          <Text style={styles.comingSoonText}>
            Estamos trabalhando em novas funcionalidades para melhorar sua experiência.
            Fique atento às próximas atualizações!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lightBackground,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.grayDarker,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.grayDarker,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: theme.colors.grayDarker,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.grayDarker,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.grayDark,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.grayDarker,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 14,
    color: theme.colors.grayDark,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.grayDark,
  },
  comingSoonSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.grayDarker,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: theme.colors.grayDark,
    textAlign: 'center',
    lineHeight: 20,
  },
});
