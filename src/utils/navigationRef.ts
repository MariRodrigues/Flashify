import { createNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  DeckDetails: { deck: { id: number; name: string; cardCount: number } };
  Study: { deckId: number; deckName: string };
  Catalog: undefined;
  Options: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: RootStackParamList[keyof RootStackParamList]) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as any);
  }
}
