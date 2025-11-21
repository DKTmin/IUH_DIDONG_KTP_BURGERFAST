import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";
import { Product, useCart } from "../context/CartContext";
import { getAddressSuggestions } from "../data/addressSuggestions";
import useTranslation from "../hooks/useTranslation";
import { createOrder, getProducts, Order } from "../services/firebaseService";
import { fetchPlaceSuggestions } from "../services/placeService";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, getTotalPrice, addToCart, clearCart } =
    useCart();
  const { t } = useTranslation();

  const [contactInfo, setContactInfo] = useState({
    name: "Nguyễn Văn A",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  });
  const [addresses, setAddresses] = useState<string[]>([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] =
    useState<Product | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1);
  const addressQueryTimeout = useRef<number | null>(null);

  const loadProducts = async () => {
    try {
      const products = await getProducts();
      // Compute suggested products once when loading
      const suggestions = products
        .filter((p) => !cartItems.find((item) => item.id === p.id))
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setSuggestedProducts(suggestions);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggested products are computed once on load and stored in state

  const handleAddSuggested = (product: Product) => {
    // If burger with sizes, show size modal, otherwise add directly
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProductForSize(product);
      setSizeModalVisible(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  // Handle address input change and show suggestions (debounced remote lookup)
  const handleAddressChange = (text: string) => {
    setContactInfo({ ...contactInfo, address: text });

    // clear pending timeout
    if (addressQueryTimeout.current) {
      clearTimeout(addressQueryTimeout.current as any);
      addressQueryTimeout.current = null;
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    // If user typed only 1-2 chars, use local suggestions to avoid API calls
    if (trimmed.length <= 2) {
      const suggestions = getAddressSuggestions(trimmed).map((s) => ({
        display_name: s,
        parts: s
          .split(",")
          .map((p) => p.trim())
          .slice(0, 3),
      }));
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(suggestions.length > 0);
      setSelectedSuggestionIndex(suggestions.length > 0 ? 0 : -1);
      return;
    }

    // Debounce remote request (400ms)
    addressQueryTimeout.current = setTimeout(async () => {
      try {
        const remote = await fetchPlaceSuggestions(trimmed);
        if (remote && remote.length > 0) {
          setAddressSuggestions(remote);
          setShowAddressSuggestions(true);
          setSelectedSuggestionIndex(0);
        } else {
          // fallback to local dataset
          const fallback = getAddressSuggestions(trimmed).map((s) => ({
            display_name: s,
            parts: s
              .split(",")
              .map((p) => p.trim())
              .slice(0, 3),
          }));
          setAddressSuggestions(fallback);
          setShowAddressSuggestions(fallback.length > 0);
          setSelectedSuggestionIndex(fallback.length > 0 ? 0 : -1);
        }
      } catch (err) {
        console.warn("Address suggestion error:", err);
        const fallback = getAddressSuggestions(trimmed).map((s) => ({
          display_name: s,
          parts: s
            .split(",")
            .map((p) => p.trim())
            .slice(0, 3),
        }));
        setAddressSuggestions(fallback);
        setShowAddressSuggestions(fallback.length > 0);
        setSelectedSuggestionIndex(fallback.length > 0 ? 0 : -1);
      }
    }, 400) as unknown as number;
  };

  // Handle selecting an address from suggestions
  const handleSelectAddressSuggestion = (suggestion: any) => {
    const addressStr =
      typeof suggestion === "string"
        ? suggestion
        : suggestion?.display_name || String(suggestion);
    setContactInfo({ ...contactInfo, address: addressStr });
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  const handleToggleEdit = async () => {
    // if currently editing, save changes to Firestore
    if (isEditingContact) {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // ensure addresses array keeps selected address at front
        const addr = contactInfo.address?.trim();
        let newAddresses = addresses.slice();
        if (addr) {
          newAddresses = [addr, ...newAddresses.filter((a) => a !== addr)];
        }

        await updateDoc(doc(db, "users", user.uid), {
          name: contactInfo.name || "",
          phone: contactInfo.phone || "",
          address: newAddresses,
        });
        setAddresses(newAddresses);
      } catch (err) {
        console.error("Error saving user contact:", err);
      }
    }

    setIsEditingContact((s) => !s);
  };

  // Set an address as default (move to front) and persist to Firestore
  const handleSetDefaultAddress = async (index: number) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const addr = addresses[index];
      if (!addr) return;

      const newAddresses = [addr, ...addresses.filter((a, i) => i !== index)];
      await updateDoc(doc(db, "users", user.uid), { address: newAddresses });
      setAddresses(newAddresses);
      setContactInfo({ ...contactInfo, address: addr });
      } catch (err) {
        console.error("Error setting default address:", err);
        Alert.alert(t("cart.alerts.setDefaultError"), t("cart.alerts.setDefaultErrorMessage"));
      }
  };

  // Delete address at index and persist; update contactInfo if necessary
  const handleDeleteAddress = async (index: number) => {
    Alert.alert(t("cart.alerts.deleteAddress"), t("cart.alerts.deleteAddressMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("cart.alerts.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;

            const newAddresses = addresses.filter((_, i) => i !== index);
            await updateDoc(doc(db, "users", user.uid), {
              address: newAddresses,
            });
            setAddresses(newAddresses);

            // If the deleted address was currently selected in contactInfo, update to first or empty
            if (contactInfo.address === addresses[index]) {
              setContactInfo({
                ...contactInfo,
                address: newAddresses.length > 0 ? newAddresses[0] : "",
              });
            }
          } catch (err) {
            console.error("Error deleting address:", err);
            Alert.alert(t("cart.alerts.deleteError"), t("cart.alerts.deleteErrorMessage"));
          }
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert(t("cart.alerts.emptyCart"), t("cart.alerts.emptyCartMessage"));
      return;
    }

    if (!contactInfo.address || contactInfo.address.trim() === "") {
      Alert.alert(t("cart.alerts.errorAddress"), t("cart.alerts.errorAddressMessage"));
      return;
    }

    if (!paymentMethod) {
      Alert.alert(t("cart.alerts.errorPayment"), t("cart.alerts.errorPaymentMessage"));
      return;
    }

    const totalPrice = getTotalPrice();

    Alert.alert(
      t("cart.alerts.confirmOrder"),
      t("cart.alerts.confirmOrderMessage")
        .replace("{method}", paymentMethod === "cash" ? t("orders.cash") : "Momo")
        .replace("{amount}", totalPrice.toLocaleString("vi-VN")),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("cart.alerts.confirmOrderButton"),
          onPress: async () => {
            setIsProcessing(true);
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert(t("cart.alerts.loginError"), t("cart.alerts.loginErrorMessage"));
                setIsProcessing(false);
                return;
              }

              // Convert cart items to order items
              const orderItems = cartItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedSizePrice: item.selectedSizePrice,
                imageUrl: item.imageUrl || item.image || "",
              }));

              // Create order object
              const orderData: Order = {
                userId: user.uid,
                items: orderItems,
                total: totalPrice,
                status: "pending",
                paymentMethod: paymentMethod,
                contactInfo: {
                  name: contactInfo.name,
                  phone: contactInfo.phone,
                  address: contactInfo.address,
                },
                createdAt: new Date(),
                notes: "",
              };

              // Create order in Firestore
              const orderId = await createOrder(orderData);

              if (orderId) {
                // Clear local payment method state
                setPaymentMethod(null);

                if (paymentMethod === "momo") {
                  // Clear the cart now that the order is created
                  clearCart();

                  // Navigate to mock payment screen with orderId and amount
                  router.push({
                    pathname: "/momo/qr",
                    params: {
                      orderId: orderId,
                      amount: String(totalPrice),
                    },
                  } as any);
                } else {
                  // For cash payment, mark order as confirmed immediately
                  Alert.alert(
                    t("cart.alerts.success"),
                    t("cart.alerts.successMessage"),
                    [
                      {
                        text: t("common.ok"),
                        onPress: () => {
                          clearCart();
                          router.replace("/(customer)/(stack)/orders");
                        },
                      },
                    ]
                  );
                }
              } else {
                Alert.alert(t("cart.alerts.orderError"), t("cart.alerts.orderErrorMessage"));
              }
            } catch (error) {
              console.error("Error creating order:", error);
              Alert.alert(t("cart.alerts.createOrderError"), t("cart.alerts.createOrderErrorMessage"));
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Fetch user contact info (name, phone) from Firestore on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data: any = snap.data();
          const userAddresses: string[] = Array.isArray(data.address)
            ? data.address
            : [];
          setAddresses(userAddresses);

          setContactInfo({
            name: data.name || "",
            phone: data.phone || "",
            // if addresses available use first, otherwise empty string
            address: userAddresses.length > 0 ? userAddresses[0] : "",
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

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
        <Text style={styles.headerTitle}>{t("cart.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact Info */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <Text style={styles.sectionTitle}>{t("cart.contactInfo")}</Text>
            <TouchableOpacity onPress={handleToggleEdit}>
              <Text style={styles.editButton}>
                {isEditingContact ? t("cart.save") : t("cart.edit")}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingContact ? (
            <View style={styles.contactForm}>
              <TextInput
                style={styles.input}
                placeholder={t("cart.namePlaceholder")}
                value={contactInfo.name}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder={t("cart.phonePlaceholder")}
                value={contactInfo.phone}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, phone: text })
                }
                keyboardType="phone-pad"
              />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={t("cart.addressPlaceholder")}
                    value={contactInfo.address}
                    onChangeText={handleAddressChange}
                    onKeyPress={(e: any) => {
                      const key = e?.nativeEvent?.key;
                      if (!key) return;
                      if (
                        !addressSuggestions ||
                        addressSuggestions.length === 0
                      )
                        return;
                      if (key === "ArrowDown") {
                        setSelectedSuggestionIndex((s) =>
                          Math.min(
                            addressSuggestions.length - 1,
                            Math.max(0, s + 1)
                          )
                        );
                      } else if (key === "ArrowUp") {
                        setSelectedSuggestionIndex((s) =>
                          Math.max(0, s === -1 ? 0 : s - 1)
                        );
                      }
                    }}
                    onSubmitEditing={() => {
                      if (addressSuggestions && addressSuggestions.length > 0) {
                        const idx =
                          selectedSuggestionIndex >= 0
                            ? selectedSuggestionIndex
                            : 0;
                        handleSelectAddressSuggestion(addressSuggestions[idx]);
                      }
                    }}
                    multiline
                  />
                  {/* Address Suggestions Dropdown */}
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <View
                      style={styles.suggestionsDropdown}
                      pointerEvents="box-none"
                    >
                      <ScrollView
                        style={{ maxHeight: 208 }}
                        contentContainerStyle={{ paddingVertical: 4 }}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                      >
                        {addressSuggestions.map(
                          (suggestion: any, index: number) => {
                            const isActive = index === selectedSuggestionIndex;
                            const display =
                              typeof suggestion === "string"
                                ? suggestion
                                : suggestion.display_name || String(suggestion);
                            const parts =
                              typeof suggestion === "string"
                                ? suggestion
                                    .split(",")
                                    .map((p) => p.trim())
                                    .slice(0, 3)
                                : suggestion.parts || [display];

                            const primary = parts[0] || display;
                            const secondary = parts.slice(1).join(", ");

                            const query = (contactInfo.address || "").trim();

                            const renderHighlighted = (
                              text: string,
                              q: string
                            ) => {
                              if (!q)
                                return (
                                  <Text style={styles.suggestionLinePrimary}>
                                    {text}
                                  </Text>
                                );
                              const lower = text.toLowerCase();
                              const qi = q.toLowerCase();
                              const idx = lower.indexOf(qi);
                              if (idx === -1)
                                return (
                                  <Text style={styles.suggestionLinePrimary}>
                                    {text}
                                  </Text>
                                );
                              return (
                                <Text style={styles.suggestionLinePrimary}>
                                  {text.slice(0, idx)}
                                  <Text style={styles.highlight}>
                                    {text.slice(idx, idx + q.length)}
                                  </Text>
                                  {text.slice(idx + q.length)}
                                </Text>
                              );
                            };

                            return (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.suggestionItem,
                                  isActive && styles.suggestionItemActive,
                                ]}
                                onPress={() =>
                                  handleSelectAddressSuggestion(suggestion)
                                }
                                onPressIn={() =>
                                  setSelectedSuggestionIndex(index)
                                }
                              >
                                <Ionicons
                                  name="location-outline"
                                  size={16}
                                  color="#f5c518"
                                />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                  {renderHighlighted(primary, query)}
                                  {secondary ? (
                                    <Text
                                      style={styles.suggestionLineSecondary}
                                      numberOfLines={1}
                                    >
                                      {secondary}
                                    </Text>
                                  ) : null}
                                </View>
                              </TouchableOpacity>
                            );
                          }
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={{ marginLeft: 8, paddingHorizontal: 8 }}
                  onPress={() => setAddressModalVisible(true)}
                >
                  <Text style={{ color: "#FFC107", fontWeight: "600" }}>
                    {t("cart.changeAddress")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={18} color="#333" />
                <Text style={styles.contactTextRow}>{contactInfo.name}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color="#333" />
                <Text style={styles.contactTextRow}>{contactInfo.phone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={18} color="#333" />
                <Text style={styles.contactTextRow}>{contactInfo.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cart Items */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>
            {t("cart.cartItems").replace("{count}", String(cartItems.length))}
          </Text>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>{t("cart.emptyCart")}</Text>
              <Text style={styles.emptyCartMessage}>
                {t("cart.emptyCartMessage")}
              </Text>
              <TouchableOpacity
                style={styles.continueShopping}
                onPress={() => router.back()}
              >
                <Text style={styles.continueShoppingText}>
                  {t("cart.continueShopping")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            cartItems.map((item) => (
              <CartItemCard
                key={`${item.id}-${item.selectedSize}`}
                item={item}
                onQuantityChange={handleQuantityChange}
                t={t}
              />
            ))
          )}
        </View>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <View style={styles.suggestedSection}>
            <Text style={styles.sectionTitle}>{t("cart.suggestedProducts")}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedList}
            >
              {suggestedProducts.map((product) => (
                <SuggestedProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAddSuggested(product)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>{t("cart.total")}</Text>
          <Text style={styles.totalAmount}>
            {getTotalPrice().toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>{t("cart.paymentMethod")}</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cash" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("cash")}
          >
            <View
              style={[
                styles.radioButton,
                paymentMethod === "cash" && styles.radioButtonActive,
              ]}
            >
              {paymentMethod === "cash" && (
                <View style={styles.radioButtonDot} />
              )}
            </View>
            <Text style={styles.paymentOptionText}>
              {t("cart.cashOnDelivery")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "momo" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("momo")}
          >
            <View
              style={[
                styles.radioButton,
                paymentMethod === "momo" && styles.radioButtonActive,
              ]}
            >
              {paymentMethod === "momo" && (
                <View style={styles.radioButtonDot} />
              )}
            </View>
            <Text style={styles.paymentOptionText}>
              {t("cart.momoPayment")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Size Selection Modal for suggested burgers */}
      <SizeSelectionModal
        visible={sizeModalVisible}
        product={selectedProductForSize}
        onClose={() => {
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
        }}
        onConfirm={(product: Product, size: any) => {
          addToCart(product, 1, size.name, size.price);
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
        }}
        t={t}
      />

      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
            {addresses.length === 0 ? (
              <View style={{ alignItems: "center", padding: 16 }}>
                <Text style={{ color: "#666" }}>Không có địa chỉ nào.</Text>
              </View>
            ) : (
              addresses.map((a, idx) => (
                <View
                  key={idx}
                  style={[
                    {
                      width: "100%",
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, paddingRight: 8 }}
                    onPress={() => {
                      setContactInfo({ ...contactInfo, address: a });
                      setAddressModalVisible(false);
                    }}
                  >
                    <Text style={styles.addressText} numberOfLines={2}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      onPress={() => handleSetDefaultAddress(idx)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Đặt mặc định</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(idx)}
                      style={[styles.actionButton, { marginLeft: 8 }]}
                    >
                      <Text
                        style={[styles.actionButtonText, { color: "#d9534f" }]}
                      >
                        Xóa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.modalCancelBtn, { marginTop: 12 }]}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Checkout Button */}
      <SizeSelectionModal
        visible={sizeModalVisible}
        product={selectedProductForSize}
        onClose={() => {
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
        }}
        onConfirm={(product: Product, size: any) => {
          addToCart(product, 1, size.name, size.price);
          setSizeModalVisible(false);
          setSelectedProductForSize(null);
        }}
        t={t}
      />

      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
            {addresses.length === 0 ? (
              <View style={{ alignItems: "center", padding: 16 }}>
                <Text style={{ color: "#666" }}>Không có địa chỉ nào.</Text>
              </View>
            ) : (
              addresses.map((a, idx) => (
                <View
                  key={idx}
                  style={[
                    {
                      width: "100%",
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={{ flex: 1, paddingRight: 8 }}
                    onPress={() => {
                      setContactInfo({ ...contactInfo, address: a });
                      setAddressModalVisible(false);
                    }}
                  >
                    <Text style={styles.addressText} numberOfLines={2}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      onPress={() => handleSetDefaultAddress(idx)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>Đặt mặc định</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(idx)}
                      style={[styles.actionButton, { marginLeft: 8 }]}
                    >
                      <Text
                        style={[styles.actionButtonText, { color: "#d9534f" }]}
                      >
                        Xóa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            <TouchableOpacity
              style={[styles.modalCancelBtn, { marginTop: 12 }]}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Checkout Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.checkoutButton, isProcessing && { opacity: 0.6 }]}
          onPress={handleCheckout}
          disabled={isProcessing}
        >
          <Text style={styles.checkoutButtonText}>
            {isProcessing ? t("cart.processing") : t("cart.checkout")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Cart Item Card Component
function CartItemCard({ item, onQuantityChange, t }: any) {
  const imageUrl =
    item.imageUrl || item.image || "https://via.placeholder.com/80";
  const displayPrice = item.selectedSizePrice || item.price;

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: imageUrl }} style={styles.cartItemImage} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        {item.selectedSize && (
          <Text style={styles.cartItemSize}>{t("cart.sizeLabel")} {item.selectedSize}</Text>
        )}
        <Text style={styles.cartItemPrice}>
          {displayPrice.toLocaleString("vi-VN")} đ
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
          {(displayPrice * item.quantity).toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </View>
  );
}

// Suggested Product Card Component
function SuggestedProductCard({ product, onAdd }: any) {
  const imageUrl =
    product.imageUrl || product.image || "https://via.placeholder.com/140";
  // Use small size price if sizes exist, otherwise fallback to product.price
  const displayPrice =
    product.sizes && product.sizes.length > 0
      ? product.sizes.find((s: any) => s.key === "small")?.price ||
        product.price
      : product.price;

  return (
    <View style={styles.suggestedCard}>
      <Image source={{ uri: imageUrl }} style={styles.suggestedImage} />
      <Text style={styles.suggestedName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.suggestedPrice}>
        {displayPrice.toLocaleString("vi-VN")} đ
      </Text>
      <TouchableOpacity style={styles.suggestedAddButton} onPress={onAdd}>
        <Text style={styles.suggestedAddButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// Size Selection Modal Component (used for suggested burgers)
function SizeSelectionModal({ visible, product, onClose, onConfirm, t }: any) {
  const [selectedSize, setSelectedSize] = useState<any>(null);

  const handleConfirm = () => {
    if (!selectedSize || !product) return;
    onConfirm(product, selectedSize);
    setSelectedSize(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("cart.sizeModal.title").replace("{productName}", product?.name || "")}</Text>

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
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => {
                setSelectedSize(null);
                onClose();
              }}
            >
              <Text style={styles.modalCancelBtnText}>{t("cart.sizeModal.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                !selectedSize && styles.modalConfirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedSize}
            >
              <Text style={styles.modalConfirmBtnText}>{t("cart.sizeModal.addToCart")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
  suggestionsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  suggestionLinePrimary: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  suggestionLineSecondary: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  suggestionItemActive: {
    backgroundColor: "#fff7e6",
  },
  highlight: {
    backgroundColor: "#FFF3CD",
    color: "#b36b00",
  },
  contactInfo: {
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  contactTextRow: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
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
  paymentSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  paymentOptionActive: {
    borderColor: "#FFC107",
    backgroundColor: "#fffaf0",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: "#FFC107",
  },
  radioButtonDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFC107",
  },
  paymentOptionText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: "#333",
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
});
