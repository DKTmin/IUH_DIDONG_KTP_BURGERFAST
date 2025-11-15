import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/cart")}
      activeOpacity={0.8}
    >
      <View style={styles.cartIcon}>
        <Text style={styles.cartIconText}>🛒</Text>
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 999,
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
