import { useRouter } from "expo-router";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  // Animated value for shake
  const shake = React.useRef(new Animated.Value(0)).current;

  // Interpolate to horizontal translateX
  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  React.useEffect(() => {
    if (totalItems > 0) {
      const runShake = () => {
        const seq = Animated.sequence([
          Animated.timing(shake, {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: -1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 1,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shake, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]);
        seq.start();
      };

      // run once immediately, then every ~10 seconds
      runShake();
      const id = setInterval(runShake, 3000);

      return () => {
        clearInterval(id);
      };
    }
    // if totalItems is 0, effect does nothing
    return;
  }, [totalItems, shake]);

  if (totalItems === 0) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/cart")}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.cartIcon, { transform: [{ translateX }] }]}>
        <Text style={styles.cartIconText}>🛒</Text>
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 150,
    right: 20,
    zIndex: 998, // lower than ChatAssistant
  },
  cartIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartIconText: {
    fontSize: 28,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  badgeText: {
    color: "#FFC107",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});
