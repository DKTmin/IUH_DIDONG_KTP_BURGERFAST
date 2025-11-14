import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Product, useCart } from "../context/CartContext";
import { getProducts } from "../services/firebaseService";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, getTotalPrice, addToCart, clearCart } =
    useCart();

  const [contactInfo, setContactInfo] = useState({
    name: "Nguyễn Văn A",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const products = await getProducts();
      setAllProducts(products);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Random products for suggestion
  const suggestedProducts = allProducts
    .filter((p) => !cartItems.find((item) => item.id === p.id))
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng");
      return;
    }

    Alert.alert(
      "Xác nhận đặt hàng",
      `Tổng tiền: ${getTotalPrice().toLocaleString(
        "vi-VN"
      )} đ\n\nBạn có muốn đặt hàng không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt hàng",
          onPress: () => {
            Alert.alert("Thành công", "Đơn hàng của bạn đã được đặt!");
            clearCart();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Text style={styles.sectionTitle}>Thông tin liên lạc</Text>
            <TouchableOpacity
              onPress={() => setIsEditingContact(!isEditingContact)}
            >
              <Text style={styles.editButton}>
                {isEditingContact ? "Lưu" : "Chỉnh sửa"}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingContact ? (
            <View style={styles.contactForm}>
              <TextInput
                style={styles.input}
                placeholder="Họ tên"
                value={contactInfo.name}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={contactInfo.phone}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, phone: text })
                }
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={contactInfo.address}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, address: text })
                }
                multiline
              />
            </View>
          ) : (
            <View style={styles.contactInfo}>
              <Text style={styles.contactText}>👤 {contactInfo.name}</Text>
              <Text style={styles.contactText}>📞 {contactInfo.phone}</Text>
              <Text style={styles.contactText}>📍 {contactInfo.address}</Text>
            </View>
          )}
        </View>

        {/* Cart Items */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>
            Có {cartItems.length} sản phẩm trong giỏ hàng của bạn
          </Text>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>🛒</Text>
              <Text style={styles.emptyCartMessage}>
                Giỏ hàng của bạn đang trống
              </Text>
              <TouchableOpacity
                style={styles.continueShopping}
                onPress={() => router.back()}
              >
                <Text style={styles.continueShoppingText}>
                  Tiếp tục mua sắm
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map((item) => (
              <CartItemCard
                key={`${item.id}-${item.selectedSize}`}
                item={item}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}
        </View>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <View style={styles.suggestedSection}>
            <Text style={styles.sectionTitle}>Đặt thêm sản phẩm khác</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedList}
            >
              {suggestedProducts.map((product) => (
                <SuggestedProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => addToCart(product, 1)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {getTotalPrice().toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Cart Item Card Component
function CartItemCard({ item, onQuantityChange }: any) {
  const imageUrl =
    item.imageUrl || item.image || "https://via.placeholder.com/80";

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: imageUrl }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        {item.selectedSize && (
          <Text style={styles.cartItemSize}>Size: {item.selectedSize}</Text>
        )}
        <Text style={styles.cartItemPrice}>
          {item.price.toLocaleString("vi-VN")} đ
        </Text>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onQuantityChange(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cartItemRight}>
        <Text style={styles.cartItemTotal}>
          {(item.price * item.quantity).toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </View>
  );
}

// Suggested Product Card Component
function SuggestedProductCard({ product, onAdd }: any) {
  const imageUrl =
    product.imageUrl || product.image || "https://via.placeholder.com/140";

  return (
    <View style={styles.suggestedCard}>
      <Image source={{ uri: imageUrl }} style={styles.suggestedImage} />
      <Text style={styles.suggestedName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.suggestedPrice}>
        {product.price.toLocaleString("vi-VN")} đ
      </Text>
      <TouchableOpacity style={styles.suggestedAddButton} onPress={onAdd}>
        <Text style={styles.suggestedAddButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contactSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    color: "#FFC107",
    fontSize: 14,
    fontWeight: "600",
  },
  contactForm: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  contactInfo: {
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
  },
  cartSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  emptyCart: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: "#FFC107",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  continueShoppingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartItem: {
    flexDirection: "row",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  cartItemSize: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    minWidth: 24,
    textAlign: "center",
  },
  cartItemRight: {
    justifyContent: "center",
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
  },
  suggestedSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  suggestedList: {
    paddingTop: 12,
    gap: 12,
  },
  suggestedCard: {
    width: 140,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
  },
  suggestedImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestedName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  suggestedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  suggestedAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  suggestedAddButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFC107",
  },
  bottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  checkoutButton: {
    backgroundColor: "#FFC107",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
