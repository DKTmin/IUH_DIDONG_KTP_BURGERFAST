import { Asset } from "expo-asset";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import momoConfig from "../config/momoConfig";
import useTranslation from "../hooks/useTranslation";
import { updateOrder } from "../services/firebaseService";

export default function MomoQrScreen({ route }: any) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();

  let orderId: string | undefined;
  let amount: any;

  if (route?.params) {
    orderId = route.params.orderId;
    amount = route.params.amount;
  }

  if (!orderId) {
    orderId = params.orderId as string | undefined;
  }
  if (!amount) {
    amount = params.amount as string | undefined;
  }

  // Parse amount to number if it's a string
  const parsedAmount =
    typeof amount === "string" ? parseInt(amount, 10) : amount;

  // Generate a mock transaction ID for display
  const mockTransactionId = useMemo(() => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 11);
    return `MOCK_${timestamp}_${random}`;
  }, []);

  // Load QR code image
  const localAssetModule = require("../image/QR.png");
  const [assetUri, setAssetUri] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const asset = Asset.fromModule(localAssetModule);
        await asset.downloadAsync();
        if (mounted) setAssetUri(asset.localUri || asset.uri);
      } catch (e) {
        console.warn("Could not load QR asset:", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Simulate payment confirmation
   * In real implementation: would wait for actual Momo payment callback
   */
  const handleSimulatePayment = async () => {
    if (!orderId) {
      Alert.alert(
        t("momo.alertError"),
        t("momo.alertInvalidOrder")
      );
      return;
    }

    // Show loading
    Alert.alert(
      t("momo.alertConfirmTitle"),
      t("momo.alertConfirmMessage").replace("{amount}", parsedAmount?.toLocaleString("vi-VN") || "0"),
      [
        { text: t("momo.alertCancel"), style: "cancel" },
        {
          text: t("momo.alertConfirm"),
          onPress: async () => {
            try {
              // Mark order as paid with mock transaction ID
              await updateOrder(orderId!, {
                status: "confirmed",
                paymentStatus: "paid",
                momoTransactionId: mockTransactionId,
                updatedAt: new Date(),
              });

              // Redirect to orders page with success
              router.replace({
                pathname: "/(customer)/(stack)/orders",
                params: { paymentSuccess: "true" },
              } as any);
            } catch (error) {
              console.error("Error confirming payment:", error);
              Alert.alert(
                t("momo.alertErrorTitle"),
                t("momo.alertErrorMessage")
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("momo.title")}</Text>
        <Text style={styles.subtitle}>
          {t("momo.subtitle")}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* QR Code Display */}
        <View style={styles.qrContainer}>
          {assetUri ? (
            <Image source={{ uri: assetUri }} style={styles.qr} />
          ) : (
            <View
              style={[
                styles.qr,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Text>{t("momo.loadingQR")}</Text>
            </View>
          )}
        </View>

        {/* Payment Information Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("momo.recipientAccount")}</Text>
            <Text style={styles.infoValue}>{momoConfig.merchantPhone}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("momo.amount")}</Text>
            <Text style={styles.infoAmount}>
              {parsedAmount?.toLocaleString("vi-VN")} đ
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("momo.orderId")}</Text>
            <Text style={[styles.infoValue, { fontFamily: "monospace" }]}>
              {orderId}
            </Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t("momo.notes")}</Text>
            <Text style={styles.infoValue}>{t("momo.paymentNote")}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>
            {t("momo.instructionTitle")}
          </Text>
          <Text style={styles.instructionText}>
            {t("momo.instruction1")}{"\n"}
            {t("momo.instruction2")}{"\n"}
            {t("momo.instruction3")}
          </Text>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {t("momo.simulationNote")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleSimulatePayment}
        >
          <Text style={styles.completeButtonText}>
            {t("momo.completeButton")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>{t("momo.backButton")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  qr: {
    width: 280,
    height: 280,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  infoAmount: {
    fontSize: 16,
    color: "#f5c518",
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 4,
  },
  instructionCard: {
    backgroundColor: "#fffaf0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f5c518",
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  noteBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#f5c518",
  },
  noteText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  completeButton: {
    backgroundColor: "#f5c518",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
});
