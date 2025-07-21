import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

// Detect mobile device (always true in React Native)
const isMobileDevice = () => true;

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 3000 }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.9)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(30)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Skip animations - show immediately and call onFinish
    if (isMobileDevice()) {
      // Set all values to final state immediately
      titleOpacity.setValue(1);
      titleScale.setValue(1);
      subtitleOpacity.setValue(1);
      subtitleY.setValue(0);
      lineWidth.setValue(200);
      
      // Call onFinish after a short delay for UX
      const timer = setTimeout(onFinish, 1000);
      return () => clearTimeout(timer);
    }

    const sequence = Animated.sequence([
      // Title animation
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
      
      // Line animation
      Animated.timing(lineWidth, {
        toValue: 200,
        duration: 800,
        useNativeDriver: false,
      }),
      
      // Subtitle animation
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
      
      // Wait
      Animated.delay(800),
      
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]);

    sequence.start(onFinish);

    return () => {
      sequence.stop();
    };
  }, [onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern} />
      
      {/* Corner decorations */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      
      <View style={styles.content}>
        {/* Vertical lines */}
        <View style={styles.topLine} />
        
        {/* Main Title */}
        <Animated.View style={[styles.titleContainer, { opacity: titleOpacity, transform: [{ scale: titleScale }] }]}>
          <Text style={styles.title}>BLENIN</Text>
        </Animated.View>
        
        {/* Decorative Line */}
        <Animated.View style={[styles.decorativeLine, { width: lineWidth }]} />
        
        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, { opacity: subtitleOpacity, transform: [{ translateY: subtitleY }] }]}>
          <Text style={styles.subtitle}>TIMELESS • SOPHISTICATED • EFFORTLESS</Text>
        </Animated.View>
        
        {/* Bottom line */}
        <View style={styles.bottomLine} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: '#000',
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topLine: {
    position: 'absolute',
    top: -80,
    width: 1,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomLine: {
    position: 'absolute',
    bottom: -80,
    width: 1,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: width > 400 ? 72 : 56,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  decorativeLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 32,
  },
  subtitleContainer: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: width > 400 ? 16 : 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 24,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.6,
  },
  topLeft: {
    top: 60,
    left: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  topRight: {
    top: 60,
    right: 40,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  bottomLeft: {
    bottom: 60,
    left: 40,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  bottomRight: {
    bottom: 60,
    right: 40,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});

export default SplashScreen;