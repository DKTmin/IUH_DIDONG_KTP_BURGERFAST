import { useCart } from "@/app/context/CartContext";
import { Category, Product as FirebaseProduct, getCategories, getProducts } from "@/app/services/firebaseService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../config/firebaseConfig";

export default function HomeScreen() {
  // no local user state needed here; auth listener will redirect if not logged in
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace("/auth/login");
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  

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
<<<<<<< Updated upstream:app/(customer)/home.tsx
        <Image
          source={require("../image/burgerPhoMai.jpg")}
          style={styles.logo}
        />
=======
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../image/burgerPhoMai-Photoroom.png")}
            style={styles.logo}
          />
          <Text style={styles.brandName}>BURGERFAST</Text>
        </View>
>>>>>>> Stashed changes:app/(customer)/(tabs)/home.tsx
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Vị trí */}
     

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
              onPress={() =>
                router.push({ pathname: "/(stack)/product-detail" as any, params: { productId: item.id, collection: "products" } })
              }
            >
              <Image source={{ uri: item.imageUrl || "" }} style={styles.suggestImage} />
              <Text style={styles.suggestName}>{item.name}</Text>
              <Text style={styles.suggestPrice}>
                Chỉ từ {item.price.toLocaleString()}₫
              </Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(item, 1);
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Menu */}
      {/* Menu: categories + products */}
      <View style={styles.menuHeader}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/menu" as any })}>
          <Text style={{ color: "#FFC107", fontWeight: "500" }}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
<<<<<<< Updated upstream:app/(customer)/home.tsx
      <View style={styles.menuRow}>
        <View style={styles.menuCard}>
          <Image
            source={require("../image/burgerPhoMai.jpg")}
            style={styles.menuImage}
          />
          <Text style={styles.menuText}>KIDS MENU</Text>
        </View>
        <View style={styles.menuCard}>
          <Image
            source={require("../image/burgerPhoMai.jpg")}
            style={styles.menuImage}
          />
          <Text style={styles.menuText}>MENU 49K</Text>
        </View>
      </View>
=======

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6, marginBottom: 8 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryTab, styles.categoryTabActive]}
            onPress={() => {
              // Navigate to menu and open the selected category
              router.push({ pathname: "/(tabs)/menu" as any, params: { categoryId: cat.id } });
            }}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryText, styles.categoryTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      
>>>>>>> Stashed changes:app/(customer)/(tabs)/home.tsx

      {/* Các mục tiện ích */}
      <TouchableOpacity style={styles.optionBox} onPress={() => router.push({ pathname: "/(stack)/orders" as any })}>
        <Ionicons name="bag-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Theo dõi đơn hàng</Text>
          <Text style={styles.optionDesc}>Dễ dàng theo dõi trạng thái đơn hàng</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionBox} onPress={() => router.push({ pathname: "/(stack)/stores" as any })}>
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

      <TouchableOpacity style={styles.optionBox}>
        <Ionicons name="document-text-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Điều khoản và Điều kiện</Text>
        </View>
      </TouchableOpacity>

      {/* Logout */}
     
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
  locationBox: {
    backgroundColor: "#fff5f5",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
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
  suggestName: { fontWeight: "600", marginTop: 8 },
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
  menuRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  menuCard: {
    width: "48%",
    borderRadius: 12,
    backgroundColor: "#fff5f5",
    overflow: "hidden",
    elevation: 3,
  },
  menuImage: { width: "100%", height: 120, resizeMode: "cover" },
  menuText: {
    textAlign: "center",
    fontWeight: "600",
    paddingVertical: 8,
    color: "#333",
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
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: { width: 120, height: 120 },
  productInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  productName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  productDescription: { fontSize: 13, color: "#666", marginTop: 4 },
  productFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#FFC107" },
  addButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFC107", justifyContent: "center", alignItems: "center" },
  addButtonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  optionTitle: { fontWeight: "600", color: "#333" },
  optionDesc: { color: "#777", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 15 },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC107",
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 30,
  },
  logoutText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
});
