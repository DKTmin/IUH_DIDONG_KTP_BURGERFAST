// app/(customer)/(stack)/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebaseConfig";
import useTranslation from "../../hooks/useTranslation";

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const { t, language } = useTranslation();

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
            }
        });

        return () => unsubscribe();
    }, []);

    if (!userData) {
        return (
            <View style={styles.loadingContainer}>
                <Text>{t('profile.loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header giống với orders & change-password */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/account")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.headerTitle')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Avatar & Thông tin cơ bản */}
                <View style={styles.profileHeader}>
                    <Ionicons name="person-circle-outline" size={100} color="#f5c518" />
                    <Text style={styles.name}>{userData.name}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                    <Text style={styles.role}>
                        {userData.role === "customer" ? t('profile.roleCustomer') : userData.role}
                    </Text>
                </View>

                {/* Thông tin cá nhân */}
                <View style={styles.infoBox}>
                    <Text style={styles.sectionTitle}>{t('profile.sectionTitle')}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.name')}</Text>
                        <Text style={styles.value}>{userData.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.email')}</Text>
                        <Text style={styles.value}>{userData.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.phone')}</Text>
                        <Text style={styles.value}>{userData.phone || t('profile.notUpdated')}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.gender')}</Text>
                        <Text style={styles.value}>{userData.gender || t('profile.notUpdated')}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.dob')}</Text>
                        <Text style={styles.value}>{userData.dob || t('profile.notUpdated')}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.createdAt')}</Text>
                        <Text style={styles.value}>
                            {new Date(userData.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>{t('profile.labels.points')}</Text>
                        <Text style={[styles.value, { color: "#f5c518", fontWeight: "700" }]}>
                            {userData.points || 0} {t('customerAccount.points')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fffbe6" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    /* Header đồng bộ */
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

    scrollContent: { padding: 20 },

    profileHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    name: { fontSize: 22, fontWeight: "700", color: "#333", marginTop: 5 },
    email: { fontSize: 16, color: "#666", marginTop: 3 },
    role: { fontSize: 14, color: "#999", marginTop: 2 },

    infoBox: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#333" },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    label: { fontWeight: "600", color: "#555" },
    value: { color: "#333" },
});
