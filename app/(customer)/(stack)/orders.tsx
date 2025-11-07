// app/(customer)/(stack)/orders.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebaseConfig";
import useTranslation from "../../hooks/useTranslation";

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useTranslation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const q = query(collection(db, "orders"), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const orderList: any[] = [];
                querySnapshot.forEach((doc) => orderList.push({ id: doc.id, ...doc.data() }));
                setOrders(orderList);
            } catch (error) {
                console.error("Error loading orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>{t('orders.loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(customer)/account")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('orders.title')}</Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={60} color="#f5c518" />
                    <Text style={styles.emptyText}>{t('orders.emptyText')}</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.orderCard}>
                            <Text style={styles.orderTitle}>{t('orders.orderId')} {item.id}</Text>
                            {
                                (() => {
                                    const orderDateValue = item.date && (item.date as any).toDate ? (item.date as any).toDate() : item.date;
                                    const formattedDate = orderDateValue ? new Date(orderDateValue).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : '-';
                                    return <Text>{t('orders.orderDate')} {formattedDate}</Text>;
                                })()
                            }
                            <Text>{t('orders.total')} {item.total}₫</Text>
                            <Text>{t('orders.status')} {item.status}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fffbe6" },
    header: {
        backgroundColor: "#f5c518",
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: { marginTop: 10, fontSize: 16, color: "#777" },
    orderCard: {
        backgroundColor: "#fff",
        padding: 15,
        margin: 10,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    orderTitle: {
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
});
