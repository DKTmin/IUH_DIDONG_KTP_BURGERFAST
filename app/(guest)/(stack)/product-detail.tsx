import { getProductById } from "@/app/services/firebaseService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useTranslation from "../../hooks/useTranslation";

interface Size {
  key: string;
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  sizes?: Size[];
}

export default function GuestProductDetailScreen() {
  const router = useRouter();
  const { productId, collection } = useLocalSearchParams();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedSizePrice, setSelectedSizePrice] = useState<
    number | undefined
  >();

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    if (typeof productId !== "string") return;

    setLoading(true);
    try {
      const productData = await getProductById(
        productId,
        typeof collection === "string" ? collection : undefined
      );
      setProduct(productData);

      // Auto select small size if product has sizes
      if (productData?.sizes && productData.sizes.length > 0) {
        const smallSize = productData.sizes.find((s) => s.key === "small");
        if (smallSize) {
          setSelectedSize(smallSize.name);
          setSelectedSizePrice(smallSize.price);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>{t("productDetail.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("productDetail.title")}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("productDetail.notFound")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleIncrease = () => setQuantity(quantity + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    // Show login prompt for guest users
    Alert.alert(
      t("productDetail.alerts.pleaseLogin"),
      t("productDetail.alerts.loginToAdd"),
      [
        {
          text: t("common.cancel"),
          onPress: () => { },
          style: "cancel",
        },
        {
          text: t("productDetail.alerts.login"),
          onPress: () => {
            router.push("/auth/login");
          },
        },
      ]
    );
  };

  const handleOrder = () => {
    router.push("/auth/login");
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
          <Text style={styles.headerTitle}>{t("productDetail.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Product Image */}
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.productPrice}>
            {(selectedSizePrice || product.price).toLocaleString("vi-VN")} đ
          </Text>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.sizeSection}>
              <Text style={styles.sectionTitle}>{t("productDetail.selectSize")}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4 }}
              >
                <View style={styles.sizeOptions}>
                  {product.sizes.map((size) => (
                    <TouchableOpacity
                      key={size.key}
                      style={[
                        styles.sizeButton,
                        selectedSize === size.name && styles.sizeButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedSize(size.name);
                        setSelectedSizePrice(size.price);
                      }}
                    >
                      <Text
                        style={[
                          styles.sizeButtonText,
                          selectedSize === size.name &&
                          styles.sizeButtonTextActive,
                        ]}
                      >
                        {size.name} - {size.price.toLocaleString("vi-VN")} đ
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>{t("productDetail.quantity")}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrease}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrease}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.cartIconButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.cartIconText}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>{t("productDetail.orderButton")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  infoSection: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFC107",
    marginBottom: 24,
  },
  sizeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sizeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  sizeButtonActive: {
    borderColor: "#FFC107",
    backgroundColor: "#FFC107",
  },
  sizeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  sizeButtonTextActive: {
    color: "#fff",
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    minWidth: 40,
    textAlign: "center",
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  cartIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cartIconText: {
    fontSize: 24,
  },
  orderButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
