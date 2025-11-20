import { Asset } from "expo-asset";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import momoConfig from "../config/momoConfig";

export default function MomoQrScreen({ route }: any) {
    // `useSearchParams` may be undefined in some expo-router/runtime combos.
    // Prefer route.params (provided by React Navigation) and only call
    // useSearchParams if it's present at runtime.
    const router = useRouter();

    let orderId: string | undefined;
    let amount: any;

    if (route?.params) {
        orderId = route.params.orderId;
        amount = route.params.amount;
    }

    // Try to call useSearchParams if available (guarded)
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const maybe = require("expo-router");
        if (maybe && typeof maybe.useSearchParams === "function") {
            const sp = maybe.useSearchParams();
            orderId = orderId ?? sp?.orderId;
            amount = amount ?? sp?.amount;
        }
    } catch (e) {
        // ignore - fallback to route params
    }

    // No amount displayed on this screen; we only show the QR image and provide a button to open MoMo.

    const deeplink = useMemo(() => {
        const params = new URLSearchParams();
        const phone = momoConfig?.merchantPhone || "";
        if (phone) {
            params.set("merchant", phone);
            params.set("receiver", phone);
        }
        if (orderId) params.set("orderId", String(orderId));
        return `momo://pay?${params.toString()}`;
    }, [orderId]);

    // Use the local bundled QR image
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

    const handleOpenMomo = async () => {
        try {
            // Try opening the Momo app using the deeplink we prepared
            const supported = await Linking.canOpenURL(deeplink);
            if (supported) {
                await Linking.openURL(deeplink);
                return;
            }
            // Fallback: try open the app homepage
            await Linking.openURL("momo://");
        } catch (e) {
            console.error(e);
            Alert.alert("Lỗi", "Không thể mở Momo. Vui lòng thử lại.");
        }
    };

    // Download/share functionality removed per user request.

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mã QR thanh toán MoMo</Text>
            <Text style={styles.subtitle}>Quét mã bằng ứng dụng MoMo để thanh toán</Text>
            {assetUri ? (
                <Image source={{ uri: assetUri }} style={styles.qr} />
            ) : (
                <View style={[styles.qr, { alignItems: "center", justifyContent: "center" }]}>
                    <Text>Đang tải hình QR…</Text>
                </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenMomo}>
                <Text style={styles.primaryButtonText}>Mở MoMo</Text>
            </TouchableOpacity>

            <Text style={styles.instruction}>Hãy quét mã QR trên để chuyển khoản</Text>
            {/* total removed per request */}

            <TouchableOpacity style={styles.link} onPress={() => router.push("/(customer)/(stack)/orders")}>
                <Text style={styles.linkText}>Quay lại đơn hàng</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "700", marginTop: 10 },
    subtitle: { fontSize: 14, color: "#666", marginVertical: 12 },
    qr: { width: 300, height: 300, backgroundColor: "#fff", marginBottom: 24 },
    primaryButton: { backgroundColor: "#ff3366", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 12 },
    primaryButtonText: { color: "#fff", fontWeight: "700" },
    secondaryButton: { borderColor: "#ccc", borderWidth: 1, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    secondaryButtonText: { color: "#333" },
    instruction: { fontSize: 15, color: "#333", marginTop: 8 },
    link: { marginTop: 18 },
    linkText: { color: "#007bff" },
});
