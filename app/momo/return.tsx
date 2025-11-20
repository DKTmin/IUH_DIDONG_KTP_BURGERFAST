import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTranslation from "../hooks/useTranslation";
import { markOrderPaid } from "../services/firebaseService";

export default function MomoReturn() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");

    useEffect(() => {
        // Expo Router parses query params from incoming deep links like: burgerfast://momo-return?orderId=xxx&status=success&tx=123
        const orderId = params.orderId as string | undefined;
        const paymentStatus = (params.status as string) || "failed";
        const tx = params.tx as string | undefined;

        async function handle() {
            if (!orderId) {
                setStatus("failed");
                return;
            }

            if (paymentStatus === "success") {
                // mark order paid
                await markOrderPaid(orderId, tx);
                setStatus("success");
            } else {
                // update order paymentStatus to failed
                try {
                    await markOrderPaid(orderId, tx);
                } catch (e) {
                    console.warn(e);
                }
                setStatus("failed");
            }
        }

        handle();
    }, [params]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {status === "pending" && (
                    <>
                        <ActivityIndicator size="large" color="#f5c518" />
                        <Text style={styles.text}>{t("orders.loading")}</Text>
                    </>
                )}
                {status === "success" && (
                    <>
                        <Text style={styles.successTitle}>{t("orders.paymentSuccess")}</Text>
                        <Text style={styles.text}>{t("orders.paymentSuccessMessage")}</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => router.replace("/")}
                        >
                            <Text style={styles.buttonText}>{t("orders.continueShopping")}</Text>
                        </TouchableOpacity>
                    </>
                )}
                {status === "failed" && (
                    <>
                        <Text style={styles.failTitle}>{t("orders.paymentFailed")}</Text>
                        <Text style={styles.text}>{t("orders.paymentFailedMessage")}</Text>
                        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                            <Text style={styles.buttonText}>{t("common.ok")}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    text: { marginTop: 12, fontSize: 14, color: "#444", textAlign: "center" },
    successTitle: { fontSize: 20, fontWeight: "700", color: "#4CAF50" },
    failTitle: { fontSize: 20, fontWeight: "700", color: "#F44336" },
    button: { marginTop: 20, backgroundColor: "#f5c518", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    buttonText: { color: "#fff", fontWeight: "700" },
});
