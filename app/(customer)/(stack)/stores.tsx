import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import useTranslation from "../../hooks/useTranslation";

const STORES_DATA = [
  {
    id: "1",
    name: "BurgerFast - Chi nhánh Quận 1",
    address: "123 Nguyễn Hue, Quận 1, TP.HCM",
    phone: "0283456789",
    hours: "10:00 - 22:00",

  },
  {
    id: "2",
    name: "BurgerFast - Chi nhánh Quận 3",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    phone: "0283456790",
    hours: "09:30 - 23:00",

  },
  {
    id: "3",
    name: "BurgerFast - Chi nhánh Quận 5",
    address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
    phone: "0283456791",
    hours: "10:00 - 22:30",

  },
  {
    id: "4",
    name: "BurgerFast - Chi nhánh Bình Thạnh",
    address: "321 Cộng Hòa, Bình Thạnh, TP.HCM",
    phone: "0283456792",
    hours: "09:00 - 23:30",

  },
  {
    id: "5",
    name: "BurgerFast - Chi nhánh Tân Bình",
    address: "654 Sư Vạn Hạnh, Tân Bình, TP.HCM",
    phone: "0283456793",
    hours: "10:00 - 22:00",

  },
];

export default function StoresScreen() {
  const router = useRouter();
  const [stores] = useState(STORES_DATA);
  const { t } = useTranslation();



  const renderStoreCard = ({ item }: any) => (
    <View style={styles.storeCard}>
      <View style={styles.storeHeader}>
        <Ionicons name="storefront" size={24} color="#FFC107" />
        <Text style={styles.storeName}>{item.name}</Text>
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#666" />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoText}>{item.hours}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#666" />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
      </View>


    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("stores.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Stores List */}
      <FlatList
        data={stores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    backgroundColor: "#FFC107",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 12,
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },

  storeInfo: {
    marginBottom: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    flexWrap: "wrap",
  },

});
