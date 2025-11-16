import {
  Category,
  getCategories,
  getProducts,
  searchProducts,
} from "@/app/services/firebaseService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  image?: string;
  category?: string;
  sizes?: { key: string; name: string; price: number }[];
}

export default function GuestMenuScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams() as { categoryId?: string };
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryPositions = useRef<{ [key: string]: number }>({});
  const categoryTabPositions = useRef<{ [key: string]: number }>({});

  // Firebase state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] =
    useState<Product | null>(null);

  // Load data from Firebase
  useEffect(() => {
    loadData();
  }, []);

  // If navigated here with a categoryId param, select that category once categories are loaded
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const id = setTimeout(() => {
        handleCategoryPress(categoryId);
      }, 80);
      return () => clearTimeout(id);
    }
  }, [categoryId, categories]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  };

  const filteredProducts = searchQuery ? searchResults : products;

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const position = categoryPositions.current[categoryId];
    if (position !== undefined) {
      scrollViewRef.current?.scrollTo({ y: position - 150, animated: true });
    }

    // Auto scroll category tabs
    const tabPosition = categoryTabPositions.current[categoryId];
    if (tabPosition !== undefined) {
      categoryScrollRef.current?.scrollTo({
        x: tabPosition - 50,
        animated: true,
      });
    }
  };

  const handleAddToCart = (product: any) => {
    // Directly navigate to login for guest users when they try to add
    router.push("/auth/login");
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/(stack)/product-detail" as any,
      params: {
        productId: product.id,
        collection: product.category || "burgers",
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MENU</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <>
          {/* Category Tabs */}
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => handleCategoryPress(category.id)}
                onLayout={(e) => {
                  categoryTabPositions.current[category.id] =
                    e.nativeEvent.layout.x;
                }}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id &&
                    styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            {!searchVisible ? (
              <TouchableOpacity
                style={styles.searchBarContainer}
                onPress={() => setSearchVisible(true)}
              >
                <Text style={styles.searchIcon}>🔍</Text>
                <Text style={styles.searchPlaceholder}>
                  Tìm kiếm sản phẩm...
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.searchBarActive}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => {
                    setSearchVisible(false);
                    setSearchQuery("");
                  }}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Products List */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            onScroll={(e) => {
              const scrollY = e.nativeEvent.contentOffset.y;
              // Find which category is in view
              let foundCategory = "trending";
              for (let i = categories.length - 1; i >= 0; i--) {
                const categoryId = categories[i].id;
                const position = categoryPositions.current[categoryId];
                if (position !== undefined && scrollY >= position - 200) {
                  foundCategory = categoryId;
                  break;
                }
              }

              if (foundCategory !== selectedCategory) {
                setSelectedCategory(foundCategory);
                // Auto scroll category tabs when scrolling content
                const tabPosition = categoryTabPositions.current[foundCategory];
                if (tabPosition !== undefined) {
                  categoryScrollRef.current?.scrollTo({
                    x: tabPosition - 50,
                    animated: true,
                  });
                }
              }
            }}
            scrollEventThrottle={16}
          >
            {searchQuery ? (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {searching ? "Đang tìm kiếm..." : "KẾT QUẢ TÌM KIẾM"}
                </Text>
                {filteredProducts.length === 0 ? (
                  <Text style={styles.noResultsText}>
                    Không tìm thấy sản phẩm
                  </Text>
                ) : (
                  filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPress={() => handleProductPress(product)}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))
                )}
              </View>
            ) : (
              categories.map((category) => {
                const categoryProducts = products.filter(
                  (p) => p.category === category.id
                );
                return (
                  <View
                    key={category.id}
                    style={styles.categorySection}
                    onLayout={(e) => {
                      categoryPositions.current[category.id] =
                        e.nativeEvent.layout.y;
                    }}
                  >
                    <Text style={styles.categoryTitle}>
                      {category.name.toUpperCase()}
                    </Text>
                    {categoryProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onPress={() => handleProductPress(product)}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ))}
                  </View>
                );
              })
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}

      {/* Size Selection Modal - Shows login prompt on confirm */}
      <SizeSelectionModal
        visible={sizeModalVisible}
        product={selectedProductForSize}
        onClose={() => {
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
        }}
        onConfirm={() => {
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
          handleAddToCart(selectedProductForSize);
        }}
      />
    </View>
  );
}

// Size Selection Modal Component
function SizeSelectionModal({ visible, product, onClose, onConfirm }: any) {
  const [selectedSize, setSelectedSize] = useState<any>(null);

  const handleConfirm = () => {
    if (selectedSize) {
      onConfirm();
      setSelectedSize(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn size cho {product?.name}</Text>

          <View style={styles.modalSizeOptions}>
            {product?.sizes?.map((size: any) => (
              <TouchableOpacity
                key={size.key}
                style={[
                  styles.modalSizeButton,
                  selectedSize?.key === size.key &&
                  styles.modalSizeButtonActive,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.modalSizeButtonText,
                    selectedSize?.key === size.key &&
                    styles.modalSizeButtonTextActive,
                  ]}
                >
                  {size.name} - {size.price.toLocaleString("vi-VN")} đ
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                !selectedSize && styles.modalConfirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedSize}
            >
              <Text style={styles.modalConfirmBtnText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Product Card Component
function ProductCard({ product, onPress, onAddToCart }: any) {
  const imageUrl =
    product.imageUrl || product.image || "https://via.placeholder.com/120";

  // Get small size price for burgers, otherwise use default price
  const displayPrice =
    product.sizes && product.sizes.length > 0
      ? product.sizes.find((s: any) => s.key === "small")?.price ||
      product.price
      : product.price;

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>
            {displayPrice.toLocaleString("vi-VN")} đ
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    paddingLeft: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  searchBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchBarActive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFC107",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#999",
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    paddingHorizontal: 8,
    color: "#333",
  },
  closeIcon: {
    fontSize: 20,
    color: "#666",
    padding: 4,
  },
  categoryTabs: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    maxHeight: 50,
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    minHeight: 32,
  },
  categoryTabActive: {
    backgroundColor: "#FFC107",
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
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
  productImage: {
    width: 120,
    height: 120,
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFC107",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
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
  noResultsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSizeOptions: {
    gap: 12,
    marginBottom: 20,
  },
  modalSizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  modalSizeButtonActive: {
    borderColor: "#FFC107",
    backgroundColor: "#FFC107",
  },
  modalSizeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  modalSizeButtonTextActive: {
    color: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnDisabled: {
    opacity: 0.5,
  },
  modalConfirmBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
