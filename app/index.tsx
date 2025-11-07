// app/index.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import LanguageSelector from "./components/LanguageSelector";
import useTranslation from "./hooks/useTranslation";

export default function SelectRoleScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t('selectRole.welcome')}</Text>
      </View>

      <TouchableOpacity style={styles.langRow} onPress={() => setLanguageModalVisible(true)}>
        <Text style={styles.langText}>{t('guestAccount.language')}: {t(`languages.${language}`)}</Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FFC107" }]}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={[styles.buttonText, { color: "#000" }]}>{t('selectRole.loginButton')}</Text>
      </TouchableOpacity>

      {/* Nút Tiếp tục với tư cách khách */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => router.push("/(guest)/home")}
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>
          {t('selectRole.continueGuest')}
        </Text>
      </TouchableOpacity>

      {/* Language modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: Math.min(340, width - 40) }]}>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: 'center',
    lineHeight: 28,
  },
  titleContainer: {
    // use padding instead of fixed height so multi-line titles (e.g. Vietnamese)
    // can grow naturally and remain vertically centered with the rest of the layout
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
  },
  outlineButtonText: {
    color: "#000",
  },
  langRow: {
    marginBottom: 12,
  },
  langText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
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
    alignItems: "center",
  },
});
