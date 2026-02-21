/**
 * Écran Splash - Centre Chrétien de Réveil
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import { COLORS, FONT_SIZE, FONT_WEIGHT, CHURCH_INFO } from "../constants/theme";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animation
    Animated.sequence([
      // Logo apparaît et grandit
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Nom de l'église apparaît
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Slogan apparaît
      Animated.timing(sloganOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/login");
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <LinearGradient
      colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
      style={styles.container}
    >
      {/* Cercles décoratifs */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Logo animé */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Nom de l'église */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.churchName}>{CHURCH_INFO.name}</Text>
        </Animated.View>

        {/* Slogan */}
        <Animated.View style={{ opacity: sloganOpacity }}>
          <View style={styles.sloganContainer}>
            <View style={styles.sloganLine} />
            <Text style={styles.slogan}>{CHURCH_INFO.slogan}</Text>
            <View style={styles.sloganLine} />
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </View>
    </LinearGradient>
  );
}

// Composant point de chargement animé
const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  decorCircle1: {
    position: "absolute",
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(212, 168, 75, 0.08)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(212, 168, 75, 0.05)",
  },
  decorCircle3: {
    position: "absolute",
    top: height * 0.3,
    left: -width * 0.1,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.primary.gold,
  },
  logo: {
    width: 100,
    height: 100,
  },
  churchName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  sloganContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sloganLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.primary.gold,
    borderRadius: 1,
  },
  slogan: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary.goldLight,
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    bottom: 60,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.gold,
  },
});