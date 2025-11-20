import { Linking } from "react-native";
import momoConfig from "../config/momoConfig";
import { updateOrder } from "./firebaseService";

// Simple Momo deeplink builder and opener. This is a first-pass integration using deep links.
// NOTE: Momo's exact URL scheme may vary; you should confirm Momo's developer docs for production.

export interface MomoPaymentOptions {
    orderId: string;
    amount: number; // integer VND
    recipientPhone?: string; // merchant phone or momo account
    note?: string;
    returnUrl?: string; // deep link back to the app
}

export async function initiateMomoPayment(opts: MomoPaymentOptions) {
    const { orderId, amount, recipientPhone = "", note = "", returnUrl } = opts;

    // Construct a basic momo deeplink. This format is commonly used but ensure with Momo docs.
    // Example custom scheme: momo://pay?amount=10000&extra=note
    // We'll include a returnUrl so Momo can send the user back to the app after payment.

    const params = new URLSearchParams();
    params.append("amount", String(Math.round(amount)));
    // Add multiple possible parameter names to maximize chance of prefill
    const phoneToUse = recipientPhone || momoConfig.merchantPhone || "";
    if (phoneToUse) {
        params.append("partner", phoneToUse);
        params.append("merchant", phoneToUse);
        params.append("phone", phoneToUse);
        params.append("receiver", phoneToUse);
    }
    if (note) params.append("note", note);
    if (returnUrl) params.append("returnUrl", returnUrl);
    params.append("orderId", orderId);

    // Several Momo deeplink formats exist; try a standard scheme first
    const deeplink = `momo://pay?${params.toString()}`;
    const deeplinkAlt = `momo://payment?${params.toString()}`;

    try {
        // Store payment attempt metadata on the order (optional but useful)
        await updateOrder(orderId, {
            paymentAttempt: {
                provider: "momo",
                amount,
                startedAt: new Date().toISOString(),
            },
            paymentStatus: "pending",
        });
    } catch (e) {
        console.warn("Could not write paymentAttempt to order:", e);
    }

    // Try to open Momo app via deeplink
    try {
        // Try primary deeplink
        const supported = await Linking.canOpenURL(deeplink);
        if (supported) {
            await Linking.openURL(deeplink);
            return;
        }

        // Try alternate deeplink
        const supportedAlt = await Linking.canOpenURL(deeplinkAlt);
        if (supportedAlt) {
            await Linking.openURL(deeplinkAlt);
            return;
        }

        // Fallback: attempt web checkout or show instructions to user
        const webFallback = `https://momo.vn/`;
        await Linking.openURL(webFallback);
    } catch (error) {
        console.error("Error opening Momo deeplink:", error);
        // fallback
        const webFallback = `https://momo.vn/`;
        Linking.openURL(webFallback).catch((e) => console.error(e));
    }
}
