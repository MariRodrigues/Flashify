import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { theme } from '../theme';

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  isFlipped,
  onFlip,
}) => {
  const flipAnimation = new Animated.Value(isFlipped ? 180 : 0);

  React.useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0]
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1]
  });

  return (
    <TouchableOpacity onPress={onFlip} style={styles.container}>
      <View>
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity
            }
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.text}>{front}</Text>
          </View>
        </Animated.View>
        <Animated.View 
          style={[
            styles.card,
            styles.cardBack,
            {
              transform: [{ rotateY: backInterpolate }],
              opacity: backOpacity
            }
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.text}>{back}</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 300,
    height: 200,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    position: 'absolute',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBack: {
    backgroundColor: theme.colors.white,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
