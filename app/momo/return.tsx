import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useTranslation from "../hooks/useTranslation";

export default function MomoReturn() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );

  useEffect(() => {
    // Determine payment status from params
    const paymentStatus = (params.status as string) || "success";

    // Simulate processing delay
    const timer = setTimeout(() => {
      if (paymentStatus === "success") {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [params]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === "pending" && (
          <>
            <ActivityIndicator size="large" color="#f5c518" />
            <Text style={styles.text}>Đang xử lý thanh toán...</Text>
          </>
        )}
        {status === "success" && (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.text}>
              Đơn hàng của bạn đã được tạo. Bạn sẽ được chuyển hướng tới trang
              theo dõi đơn hàng.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(customer)/(stack)/orders")}
            >
              <Text style={styles.buttonText}>Xem đơn hàng của tôi</Text>
            </TouchableOpacity>
          </>
        )}
        {status === "failed" && (
          <>
            <View style={styles.failIcon}>
              <Text style={styles.failIconText}>✕</Text>
            </View>
            <Text style={styles.failTitle}>Thanh toán thất bại</Text>
            <Text style={styles.text}>
              Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 12,
    textAlign: "center",
  },
  failIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  failIconText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },
  failTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F44336",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#f5c518",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: "#f5c518",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
