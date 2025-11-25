import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getProducts } from "../services/firebaseService";
import FloatingCart from "./FloatingCart";

type Product = {
  id: string;
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
};

// Google Gemini Pro API endpoint và key
const AI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const AI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Thay bằng key của bạn

interface ChatAssistantProps {
  cartActive: boolean;
}

export default function ChatAssistant({ cartActive }: ChatAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn về menu hoặc đặt hàng?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, open]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);
    setInput("");

    // Check for product-related queries
    const lower = input.toLowerCase();
    if (
      lower.includes("burger") ||
      lower.includes("combo") ||
      lower.includes("drink") ||
      lower.includes("side dish") ||
      lower.includes("món") ||
      lower.includes("sản phẩm")
    ) {
      // Fetch products and suggest
      const products = await getProducts(); // Should return all products
      // Simple filter by name/desc
      const matches = (products as Product[]).filter(
        (p: Product) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      );
      if (matches.length > 0) {
        setSuggestedProducts(matches);
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", content: "Tôi tìm thấy các sản phẩm phù hợp:" },
        ]);
        setLoading(false);
        return;
      }
    }

    // Otherwise, call Gemini AI API
    try {
      const prompt = [
        "Bạn là trợ lý cho cửa hàng BurgerFast. Hãy trả lời thân thiện, ngắn gọn, gợi ý món ăn phù hợp dựa trên menu burger, combo, nước uống và món ăn kèm.",
        ...messages.map((m) => m.content),
        input,
      ].join("\n");
      const res = await fetch(`${AI_API_URL}?key=${AI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });
      const data = await res.json();
      const aiMsg =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Xin lỗi, tôi chưa có thông tin phù hợp.";
      setMessages((msgs) => [...msgs, { role: "assistant", content: aiMsg }]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Có lỗi xảy ra, vui lòng thử lại." },
      ]);
    }
    setLoading(false);
    setSuggestedProducts([]);
  }

  function handleProductClick(product: Product) {
    router.push(`/product-detail?id=${product.id}`);
    setOpen(false);
  }

  // ...existing code...

  const styles = StyleSheet.create({
    chatIconContainer: {
      position: "absolute",
      right: 20,
      bottom: 80,
      zIndex: 2000, // higher than FloatingCart
      elevation: 2000,
    },
    chatButton: {
      backgroundColor: "#FFC107",
      borderRadius: 50,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    dialogContainer: {
      position: "absolute",
      right: 15,
      bottom: 80,
      width: 360,
      maxHeight: 480,
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 2001,
      flexDirection: "column",
      zIndex: 2001, // higher than FloatingCart
    },
    dialogHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    dialogTitle: {
      fontWeight: "bold",
      color: "#FFC107",
      fontSize: 18,
    },
    dialogMessages: {
      flex: 1,
      padding: 12,
    },
    messageBubble: {
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginBottom: 8,
      maxWidth: "90%",
      alignSelf: "flex-start",
    },
    userBubble: {
      backgroundColor: "#FFC107",
      alignSelf: "flex-end",
    },
    assistantBubble: {
      backgroundColor: "#f3f4f6",
      alignSelf: "flex-start",
    },
    messageText: {
      fontSize: 15,
    },
    userText: {
      color: "#fff",
      fontWeight: "bold",
    },
    assistantText: {
      color: "#222",
    },
    productSuggestion: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#eee",
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
      backgroundColor: "#fff",
    },
    productImage: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: "#eee",
    },
    productName: {
      fontWeight: "bold",
      color: "#FFC107",
      fontSize: 15,
    },
    productDesc: {
      fontSize: 13,
      color: "#555",
    },
    productPrice: {
      fontSize: 13,
      color: "#eab308",
      fontWeight: "bold",
    },
    dialogInputRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: "#eee",
      backgroundColor: "#fff",
    },
    dialogInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      backgroundColor: "#fff",
    },
    sendButton: {
      backgroundColor: "#FFC107",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginLeft: 8,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
    },
  });

  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      {/* Chat Icon */}
      {!open && (
        <View style={styles.chatIconContainer} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => setOpen(true)}
            style={styles.chatButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {/* Chat Dialog */}
      {open && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.dialogContainer}
        >
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Trợ lý AI</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Ionicons name="close" size={24} color="#FFC107" />
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollRef}
            style={styles.dialogMessages}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === "user"
                      ? styles.userText
                      : styles.assistantText,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            ))}
            {/* Product suggestions */}
            {suggestedProducts.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {suggestedProducts.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.productSuggestion}
                    onPress={() => handleProductClick(p)}
                  >
                    <Image
                      source={{ uri: p.imageUrl }}
                      style={styles.productImage}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productDesc}>{p.description}</Text>
                      <Text style={styles.productPrice}>
                        {p.price ? `${p.price}₫` : ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          <View style={styles.dialogInputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Nhập câu hỏi..."
              style={styles.dialogInput}
              editable={!loading}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={[
                styles.sendButton,
                (loading || !input.trim()) && styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>
                {loading ? "..." : "Gửi"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
      {/* Hide FloatingCart when chat is open */}
      {!open && cartActive !== undefined && <FloatingCart />}
    </View>
  );
}
