import { Ionicons } from "@expo/vector-icons";
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
  const [burgers, setBurgers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Khách không cần xác thực Firebase - chỉ tải dữ liệu
  useEffect(() => {
    // Khách có thể tiếp tục mà không cần đăng nhập
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Người dùng có thể là khách hoặc đã đăng nhập
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://6900db32ff8d792314bbc8f2.mockapi.io/burgers");
        const data = await res.json();
        setBurgers(data);
      } catch {
        Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <Image
          source={require("../image/burgerPhoMai.jpg")}
          style={styles.logo}
        />
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Vị trí */}
      <TouchableOpacity style={styles.locationBox}>
        <Ionicons name="location-outline" size={20} color="#FFC107" />
        <View style={{ marginLeft: 8 }}>
          <Text style={{ fontWeight: "600", color: "#333" }}>Tìm cửa hàng gần bạn</Text>
          <Text style={{ fontSize: 13, color: "#777" }}>
            Để xem ưu đãi, phiếu giảm giá...
          </Text>
        </View>
      </TouchableOpacity>

      {/* Mục bạn sẽ thích */}
      <Text style={styles.sectionTitle}>Bạn sẽ thích</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {burgers.slice(0, 5).map((item) => (
          <View key={item.id} style={styles.suggestCard}>
            <Image source={{ uri: item.image }} style={styles.suggestImage} />
            <Text style={styles.suggestName}>{item.name}</Text>
            <Text style={styles.suggestPrice}>
              Chỉ từ {item.price.toLocaleString()}₫
            </Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Menu */}
      <View style={styles.menuHeader}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <TouchableOpacity>
          <Text style={{ color: "#FFC107", fontWeight: "500" }}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
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

      {/* Các mục tiện ích */}
      <TouchableOpacity style={styles.optionBox}>
        <Ionicons name="bag-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Theo dõi đơn hàng</Text>
          <Text style={styles.optionDesc}>Dễ dàng theo dõi trạng thái đơn hàng</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionBox}>
        <Ionicons name="storefront-outline" size={22} color="#FFC107" />
        <View>
          <Text style={styles.optionTitle}>Cửa hàng của chúng tôi</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Kết nối với BurgerFast</Text>

      <TouchableOpacity style={styles.optionBox}>
        <Ionicons name="call-outline" size={22} color="#e6e91bff" />
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
