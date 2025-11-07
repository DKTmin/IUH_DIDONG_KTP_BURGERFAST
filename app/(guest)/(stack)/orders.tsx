import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import useTranslation from "../../hooks/useTranslation";

export default function GuestOrders() {
    const router = useRouter();
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [searched, setSearched] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(guest)/account")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("orders.title")}</Text>
            </View>

            {/* Search area (design only) */}
            <View style={styles.searchWrap}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t("orders.searchPlaceholder")}
                        style={styles.searchInput}
                        keyboardType="default"
                        returnKeyType="search"
                        onSubmitEditing={() => setSearched(true)}
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => setSearched(true)}
                    >
                        <Text style={styles.searchButtonText}>{t("orders.searchButton")}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.searchHint}>{t("orders.searchHint")}</Text>
            </View>

            {/* Empty / result area (design-only placeholders) */}
            <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={70} color="#FFC107" />
                <Text style={styles.emptyTitle}>{t("orders.notLoggedInTitle")}</Text>
                <Text style={styles.emptySubtitle}>{t("orders.notLoggedInSubtitle")}</Text>

                {/* Keep login button as requested */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => router.push("/auth/login")}
                >
                    <Text style={styles.loginText}>{t("orders.loginNow")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fffbe6" },
    header: {
        backgroundColor: "#FFC107",
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
    searchWrap: {
        padding: 16,
        backgroundColor: "#fff",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f6f6",
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: "#FFC107",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    searchButtonText: { fontWeight: "bold", color: "#000" },
    searchHint: { fontSize: 12, color: "#666", marginTop: 8, textAlign: "center" },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 15,
        color: "#333",
    },
    emptySubtitle: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginTop: 5,
        marginBottom: 25,
    },
    loginButton: {
        backgroundColor: "#FFC107",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 25,
    },
    loginText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
});
