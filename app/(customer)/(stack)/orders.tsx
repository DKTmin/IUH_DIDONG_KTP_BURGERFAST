// app/(customer)/(stack)/orders.tsx
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../config/firebaseConfig";
import momoConfig from "../../config/momoConfig";
import useTranslation from "../../hooks/useTranslation";
import { getOrdersByUser, Order } from "../../services/firebaseService";
import { initiateMomoPayment } from "../../services/momoService";

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { t, language } = useTranslation();

  const fetchOrders = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const orderList = await getOrdersByUser(user.uid);
      setOrders(orderList);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert(t("orders.error"), t("orders.errorLoadingMessage"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "confirmed":
        return "#2196F3";
      case "preparing":
        return "#FF9800";
      case "delivering":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "clock-outline";
      case "confirmed":
        return "check-circle-outline";
      case "preparing":
        return "chef-hat";
      case "delivering":
        return "truck-fast";
      case "delivered":
        return "home-check";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      pending: t("orders.status.pending"),
      confirmed: t("orders.status.confirmed"),
      preparing: t("orders.status.preparing"),
      delivering: t("orders.status.delivering"),
      delivered: t("orders.status.delivered"),
      cancelled: t("orders.status.cancelled"),
    };
    return statusMap[status] || status;
  };

  const formatDate = (date: any): string => {
    if (!date) return "-";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item);
        setDetailModalVisible(true);
      }}
    >
      {/* Status Badge */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderNumber}>
            {t("orders.orderId")} #{item.id?.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <MaterialCommunityIcons
            name={getStatusIcon(item.status) as any}
            size={14}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      {/* Items Preview */}
      <View style={styles.itemsPreview}>
        {item.items.slice(0, 2).map((product, index) => (
          <View key={index} style={styles.previewItem}>
            {product.imageUrl && (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.previewImage}
              />
            )}
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.previewQty}>x{product.quantity}</Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <View style={styles.previewMoreCount}>
            <Text style={styles.moreCountText}>
              +{item.items.length - 2} {t("orders.more")}
            </Text>
          </View>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.footerLabel}>{t("orders.shippingTo")}:</Text>
          <Text style={styles.shippingAddress} numberOfLines={1}>
            {item.contactInfo.address}
          </Text>
        </View>
        <View style={styles.totalAmount}>
          <Text style={styles.totalLabel}>{t("orders.total")}:</Text>
          <Text style={styles.totalPrice}>
            {item.total.toLocaleString("vi-VN")}₫
          </Text>
        </View>
      </View>

      {/* Click hint */}
      <View style={styles.clickHint}>
        <Text style={styles.clickHintText}>{t("orders.clickToView")}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {t("orders.orderDetails")} #
              {selectedOrder.id?.slice(-6).toUpperCase()}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Status Timeline */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>
                {t("orders.status.title")}
              </Text>
              <View style={styles.timeline}>
                {[
                  "pending",
                  "confirmed",
                  "preparing",
                  "delivering",
                  "delivered",
                ].map((status, index) => (
                  <View key={status} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineNode,
                          {
                            backgroundColor: getStatusColor(status),
                            opacity:
                              selectedOrder.status === status ||
                                [
                                  "pending",
                                  "confirmed",
                                  "preparing",
                                  "delivering",
                                  "delivered",
                                ].indexOf(selectedOrder.status) >= index
                                ? 1
                                : 0.3,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={getStatusIcon(status) as any}
                          size={16}
                          color="#fff"
                        />
                      </View>
                      {index < 4 && (
                        <View
                          style={[
                            styles.timelineLine,
                            {
                              backgroundColor:
                                [
                                  "pending",
                                  "confirmed",
                                  "preparing",
                                  "delivering",
                                  "delivered",
                                ].indexOf(selectedOrder.status) > index
                                  ? getStatusColor(status)
                                  : "#ddd",
                            },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={styles.timelineStatus}>
                        {getStatusLabel(status)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>{t("orders.items")}</Text>
              {selectedOrder.items.map((item, index) => (
                <View key={index} style={styles.detailItem}>
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.detailItemImage}
                    />
                  )}
                  <View style={styles.detailItemInfo}>
                    <Text style={styles.detailItemName}>{item.name}</Text>
                    {item.selectedSize && (
                      <Text style={styles.detailItemSize}>
                        {t("orders.size")}: {item.selectedSize}
                      </Text>
                    )}
                    <Text style={styles.detailItemPrice}>
                      {(item.selectedSizePrice || item.price).toLocaleString(
                        "vi-VN"
                      )}
                      ₫ x {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.detailItemTotal}>
                    {(
                      (item.selectedSizePrice || item.price) * item.quantity
                    ).toLocaleString("vi-VN")}
                    ₫
                  </Text>
                </View>
              ))}
            </View>

            {/* Shipping Info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>
                {t("orders.shippingInfo")}
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("orders.recipientName")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.contactInfo.name}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("orders.phone")}</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.contactInfo.phone}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("orders.address")}</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.contactInfo.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Info */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>{t("orders.paymentInfo")}</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{t("orders.subtotal")}</Text>
                <Text style={styles.paymentValue}>
                  {selectedOrder.items
                    .reduce(
                      (sum, item) =>
                        sum +
                        (item.selectedSizePrice || item.price) * item.quantity,
                      0
                    )
                    .toLocaleString("vi-VN")}
                  ₫
                </Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>
                  {t("orders.shippingFee")}
                </Text>
                <Text style={styles.paymentValue}>0₫</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentTotalLabel}>
                  {t("orders.total")}
                </Text>
                <Text style={styles.paymentTotalValue}>
                  {selectedOrder.total.toLocaleString("vi-VN")}₫
                </Text>
              </View>
              <View style={styles.paymentMethodRow}>
                <Ionicons name="card-outline" size={18} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("orders.paymentMethod")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder.paymentMethod === "cash"
                      ? t("orders.cash")
                      : "Momo"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notes */}
            {selectedOrder.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>{t("orders.notes")}</Text>
                <Text style={styles.notesText}>{selectedOrder.notes}</Text>
              </View>
            )}

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Action Button */}
          {selectedOrder.status !== "delivered" &&
            selectedOrder.status !== "cancelled" && (
              <View style={styles.modalFooter}>
                {/* If payment is via Momo and not paid, show a button to re-open Momo */}
                {selectedOrder.paymentMethod === "momo" &&
                  selectedOrder.paymentStatus !== "paid" && (
                    <TouchableOpacity
                      style={[styles.actionButton, { marginBottom: 8 }]}
                      onPress={async () => {
                        try {
                          const appScheme = momoConfig.appScheme || "burgerappreactnative";
                          const returnUrl = `${appScheme}://momo-return?orderId=${selectedOrder.id}`;
                          await initiateMomoPayment({
                            orderId: selectedOrder.id || "",
                            amount: selectedOrder.total,
                            recipientPhone: momoConfig.merchantPhone,
                            note: `Thanh toán đơn ${selectedOrder.id}`,
                            returnUrl,
                          });
                        } catch (e) {
                          console.error(e);
                          Alert.alert(t("orders.paymentFailed"), t("orders.paymentFailedMessage"));
                        }
                      }}
                    >
                      <Ionicons name="wallet" size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>{"Mở Momo để thanh toán"}</Text>
                    </TouchableOpacity>
                  )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert(
                      t("orders.needHelp"),
                      t("orders.contactSupport"),
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <Ionicons name="help-circle-outline" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>
                    {t("orders.help")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("orders.title")}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text>{t("orders.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("orders.title")}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Empty State */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={80}
            color="#f5c518"
          />
          <Text style={styles.emptyTitle}>{t("orders.emptyTitle")}</Text>
          <Text style={styles.emptyText}>{t("orders.emptyText")}</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.back()}
          >
            <Text style={styles.emptyButtonText}>
              {t("orders.continueShopping")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id || ""}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEnabled
        />
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffbe6",
  },
  header: {
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 12,
  },
  // Order Card
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  itemsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  previewQty: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  previewMoreCount: {
    justifyContent: "center",
    alignItems: "center",
    height: 48,
  },
  moreCountText: {
    fontSize: 12,
    color: "#f5c518",
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  shippingAddress: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    paddingRight: 8,
  },
  totalAmount: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f5c518",
  },
  clickHint: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  clickHintText: {
    fontSize: 11,
    color: "#999",
    marginRight: 4,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#f5c518",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  // Status Section
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  timeline: {
    paddingLeft: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineLeft: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
  },
  timelineNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginTop: 8,
  },
  timelineRight: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 8,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  // Items Section
  itemsSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  detailItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  detailItemSize: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  detailItemPrice: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  detailItemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f5c518",
  },
  // Info Section
  infoSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  // Payment Section
  paymentSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  paymentTotalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f5c518",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  // Notes Section
  notesSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  // Modal Footer
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
