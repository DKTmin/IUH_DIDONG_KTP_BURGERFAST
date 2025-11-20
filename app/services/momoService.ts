import { updateOrder } from "./firebaseService";

// Mock Momo payment service for educational purposes
// This simulates a payment transaction without actual payment processing

export interface MomoPaymentOptions {
  orderId: string;
  amount: number; // integer VND
  recipientPhone?: string; // merchant phone or momo account
  note?: string;
  returnUrl?: string; // deep link back to the app
}

// Mock transaction ID generator
function generateMockTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 11);
  return `MOCK_${timestamp}_${random}`;
}

/**
 * Initiates a mock Momo payment transaction for educational purposes
 * This function simulates the payment flow without actual payment processing
 */
export async function initiateMomoPayment(opts: MomoPaymentOptions) {
  const { orderId, amount, recipientPhone = "" } = opts;

  try {
    // Record payment attempt
    await updateOrder(orderId, {
      paymentAttempt: {
        provider: "momo",
        amount,
        startedAt: new Date().toISOString(),
      },
      paymentStatus: "pending",
    });

    // Store mock transaction metadata for later use
    const mockTransaction = {
      id: generateMockTransactionId(),
      orderId,
      amount,
      recipientPhone: recipientPhone || "0399026084",
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // In a real app, this would be returned to indicate payment is ready
    return {
      success: true,
      transactionId: mockTransaction.id,
      message: "Mock payment transaction initiated",
    };
  } catch (error) {
    console.error("Error initiating mock payment:", error);
    return {
      success: false,
      error: "Failed to initiate payment",
    };
  }
}
