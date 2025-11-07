import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LanguageSelector from "../components/LanguageSelector";
import useTranslation from "../hooks/useTranslation";

export default function GuestAccount() {
    const router = useRouter();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const { t, language, setLanguage } = useTranslation();

    return (
        <View style={styles.container}>
            {/* --- Khung trên: Đăng nhập / Đăng ký --- */}
            <View style={styles.authBox}>
                <TouchableOpacity
                    style={[styles.authButton, { backgroundColor: "#FFC107" }]}
                    onPress={() => router.push("/auth/login")}
                >
                    <Text style={styles.authText}>{t('guestAccount.login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.authButton, styles.registerButton]}
                    onPress={() => router.push("/auth/register")}
                >
                    <Text style={styles.registerText}>{t('guestAccount.register')}</Text>
                </TouchableOpacity>
            </View>

            {/* --- Khung dưới: Theo dõi đơn hàng / Ngôn ngữ --- */}
            <View style={styles.optionBox}>
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => router.push("/(guest)/(stack)/orders")}
                >
                    <Ionicons name="receipt-outline" size={22} color="#333" />
                    <Text style={styles.optionText}>{t('guestAccount.trackOrders')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => setLanguageModalVisible(true)}
                >
                    <Ionicons name="language-outline" size={22} color="#333" />
                    <Text style={styles.optionText}>{t('guestAccount.language')}: {t(`languages.${language}`)}</Text>
                </TouchableOpacity>
            </View>

            {/* --- Modal chọn ngôn ngữ --- */}
            <Modal
                visible={languageModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Use shared LanguageSelector component */}
                        <LanguageSelector
                            current={language}
                            onSelect={(l: "vi" | "en" | "zh") => {
                                setLanguage(l);
                                setLanguageModalVisible(false);
                            }}
                            onClose={() => setLanguageModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    authBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    authButton: {
        width: "100%",
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
    },
    authText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    optionBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#333",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: 300,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    languageOption: {
        width: "100%",
        paddingVertical: 10,
        alignItems: "center",
    },
    languageText: {
        fontSize: 16,
        color: "#333",
    },
    languageActive: {
        color: "#007bff",
        fontWeight: "bold",
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    closeText: {
        color: "#333",
        fontWeight: "600",
    },
    registerButton: {
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#000",
    },
    registerText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 16,
    },
});
