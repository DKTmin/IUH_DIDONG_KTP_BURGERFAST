import LanguageSelector from "@/app/components/LanguageSelector";
import { auth, db } from "@/app/config/firebaseConfig"; // ⚠️ cập nhật lại đường dẫn
import useTranslation from "@/app/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CustomerAccount() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { t, language, setLanguage } = useTranslation();

  // 🔹 Lấy dữ liệu user từ Firestore
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

  const getMemberTier = (points: number) => {
    if (points >= 2000) return t("customerAccount.tiers.gold");
    if (points >= 1000) return t("customerAccount.tiers.silver");
    if (points >= 500) return t("customerAccount.tiers.bronze");
    return t("customerAccount.tiers.new");
  };

  const handleLogout = async () => {
    await signOut(auth);
    Alert.alert(
      t("customerAccount.alerts.logout.title"),
      t("customerAccount.alerts.logout.message")
    );
    router.replace("/auth/login");
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t("customerAccount.alerts.delete.title"),
      t("customerAccount.alerts.delete.message"),
      [
        { text: t("customerAccount.alerts.delete.cancel"), style: "cancel" },
        {
          text: t("customerAccount.alerts.delete.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteDoc(doc(db, "users", user.uid));
                await user.delete();
                Alert.alert(
                  t("customerAccount.alerts.delete.successTitle"),
                  t("customerAccount.alerts.delete.successMessage")
                );
                router.replace("/auth/register");
              }
            } catch (error) {
              Alert.alert(
                t("customerAccount.alerts.delete.errorTitle"),
                t("customerAccount.alerts.delete.errorMessage")
              );
            }
          },
        },
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải thông tin...</Text>
      </View>
    );
  }

  const tier = getMemberTier(userData.points || 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Khung Thành viên */}
      <View style={styles.headerBox}>
        <Ionicons name="person-circle-outline" size={80} color="#fff" />
        <Text style={styles.memberTitle}>{tier}</Text>
        <Text style={styles.nameText}>{userData.name}</Text>
        <Text style={styles.pointText}>
          {userData.points || 0} {t("customerAccount.points")}
        </Text>
      </View>

      {/* Menu chức năng */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(stack)/profile" as any)}
        >
          <Ionicons name="person-outline" size={22} color="#333" />
          <Text style={styles.menuText}>{t("customerAccount.myProfile")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(customer)/(stack)/orders" as any)}
        >
          <Ionicons name="receipt-outline" size={22} color="#333" />
          <Text style={styles.menuText}>
            {t("customerAccount.trackOrders")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="language-outline" size={22} color="#333" />
          <TouchableOpacity onPress={() => setLanguageModalVisible(true)}>
            <Text style={styles.menuText}>
              {t("customerAccount.language")}: {t(`languages.${language}`)}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(stack)/change-password" as any)}
        >
          <Ionicons name="lock-closed-outline" size={22} color="#333" />
          <Text style={styles.menuText}>
            {t("customerAccount.changePassword")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#333" />
          <Text style={[styles.menuText, { color: "#d9534f" }]}>
            {t("customerAccount.logout")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={22} color="#333" />
          <Text style={[styles.menuText, { color: "#d9534f" }]}>
            {t("customerAccount.deleteAccount")}
          </Text>
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
    </ScrollView>
  );
}

// --- Modal chọn ngôn ngữ (tương tự guest account) ---
// Thêm Modal ngay trước cuối file styles

// ===== STYLE =====
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fffbe6",
    padding: 20,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBox: {
    backgroundColor: "#f5c518",
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  memberTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  nameText: { color: "#fff", fontSize: 16, marginTop: 5 },
  pointText: { color: "#fff", fontSize: 14, marginTop: 3 },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: { fontSize: 16, marginLeft: 12, color: "#333" },
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
});
