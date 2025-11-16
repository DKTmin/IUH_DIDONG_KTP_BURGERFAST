import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../config/firebaseConfig";
import { Category, Product as FirebaseProduct, getCategories, getProducts } from "../services/firebaseService";

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Guest can continue without login
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats || []);
        setProducts(prods || []);
      } catch (error) {
        console.error("Error loading data:", error);
        // Guest users have limited access - continue with empty data
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNavigateToAuth = () => {
    router.push("/auth/login");
  };

  const handleNavigateToStores = () => {
    router.push("/(guest)/(stack)/stores");
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../image/burgerPhoMai-Photoroom.png")}
            style={styles.logo}
          />
          <Text style={styles.brandName}>BURGERFAST</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Mục bạn sẽ thích */}
      <Text style={styles.sectionTitle}>Bạn sẽ thích</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products
          .filter((p) => p.category === "burgers")
          .slice(0, 5)
          .map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestCard}
              onPress={() => router.push({ pathname: "/(stack)/product-detail" as any, params: { productId: item.id, collection: item.category || "burgers" } })}
            >
              <Image source={{ uri: item.imageUrl || "" }} style={styles.suggestImage} />
              <Text style={styles.suggestName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
              <Text style={styles.suggestPrice}>
                {(() => {
                  const smallPrice = item.sizes?.find((s) => s.key === "small")?.price;
                  const display = typeof smallPrice === "number" ? smallPrice : item.price || 0;
                  return `Chỉ từ ${display.toLocaleString()}₫`;
                })()}
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNavigateToAuth();
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Menu */}
      <View style={styles.menuHeader}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/(guest)/menu" as any })}>
          <Text style={{ color: "#FFC107", fontWeight: "500" }}>Xem thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, marginBottom: 8 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryTab, styles.categoryTabActive]}
            onPress={() => router.push({ pathname: "/(guest)/menu" as any, params: { categoryId: cat.id } })}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryText, styles.categoryTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Các mục tiện ích */}
      <TouchableOpacity style={styles.optionBox} onPress={handleNavigateToAuth}>
        <Ionicons name="bag-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Theo dõi đơn hàng</Text>
          <Text style={styles.optionDesc}>Dễ dàng theo dõi trạng thái đơn hàng</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionBox} onPress={handleNavigateToStores}>
        <Ionicons name="storefront-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Cửa hàng của chúng tôi</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Kết nối với BurgerFast</Text>

      <TouchableOpacity style={styles.optionBox}>
        <Ionicons name="call-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Cần trợ giúp?</Text>
          <Text style={styles.optionDesc}>Gọi 1900 1822</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionBox} onPress={() => router.push("/(guest)/(stack)/terms")}>
        <Ionicons name="document-text-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Điều khoản và Điều kiện</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  logo: { width: 110, height: 45, resizeMode: "contain" },
  brandName: { fontSize: 18, fontWeight: "800", marginLeft: 10, color: "#333" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  suggestCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: "#fdfdfd",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  suggestImage: { width: "100%", height: 100, borderRadius: 10 },
  suggestName: { fontWeight: "600", marginTop: 8, height: 40 },
  suggestPrice: { color: "#FFC107", marginTop: 4 },
  addBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FFC107",
    borderRadius: 20,
    padding: 5,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  categoryTabActive: {
    backgroundColor: "#ebebb0ff",
  },
  categoryIcon: { fontSize: 32, marginRight: 12 },
  categoryText: { fontSize: 18, color: "#666", fontWeight: "700" },
  categoryTextActive: { color: "#fff" },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  optionTitle: { fontWeight: "600", color: "#333" },
  optionDesc: { color: "#777", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
});
