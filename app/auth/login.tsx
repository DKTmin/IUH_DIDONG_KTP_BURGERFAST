// app/auth/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";
import useTranslation from "../hooks/useTranslation";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { t } = useTranslation();

  // ✅ Kiểm tra hợp lệ
  const validate = () => {
    let newErrors: any = {};

    if (!email) newErrors.email = t('login.errors.requiredEmail');
    else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net|org|edu|gov|vn|info|co|io|us|uk|jp|kr|au|ca)$/i.test(
        email.trim().toLowerCase()
      )
    ) {
      newErrors.email = t('login.errors.invalidEmail');
    }

    if (!password) newErrors.password = t('login.errors.requiredPassword');
    else if (password.length < 6)
      newErrors.password = t('login.errors.passwordMin');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Xử lý đăng nhập
  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || "customer";

        if (role === "customer") {
          router.push("/(customer)/home");
        } else if (role === "admin") {
          // router.push("/(admin)/dashboard");
        } else {
          Alert.alert(t('login.errors.unknownError'));
        }
      } else {
        Alert.alert(t('login.errors.userNotFound'));
      }
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        setErrors({ password: t('login.errors.invalidCredentials') });
      } else if (error.code === "auth/user-not-found") {
        setErrors({ email: t('login.errors.userNotFound') });
      } else {
        Alert.alert(t('login.errors.unknownError'), error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Quên mật khẩu
  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: t('login.errors.requiredEmail') });
      return;
    }

    // Thông báo ngay cho người dùng kiểm tra email (bao gồm thư rác)
    Alert.alert(t('login.errors.resetNoticeTitle'), t('login.errors.resetNoticeMessage'));

    try {
      await sendPasswordResetEmail(auth, email);
      // Không cần hiện thêm alert thành công nữa vì đã thông báo ở trên.
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setErrors({ email: t('login.errors.resetUserNotFound') });
      } else {
        Alert.alert(t('login.errors.unknownError'), error.message);
      }
    }
  };

  // ✅ Tiếp tục với tư cách khách
  const handleGuestAccess = () => {
    router.push("/(guest)/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('login.title')}</Text>

      {/* Email */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t('login.emailPlaceholder')}<Text style={styles.required}>*</Text></Text>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder={t('login.emailPlaceholder')}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: undefined });
          }}
        />
      </View>

      {/* Mật khẩu */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{t('login.passwordPlaceholder')}<Text style={styles.required}>*</Text></Text>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              { flex: 1, marginBottom: 0 },
              errors.password && styles.inputError,
            ]}
            placeholder={t('login.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: undefined });
            }}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Nút đăng nhập */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('login.loginButton')}</Text>
        )}
      </TouchableOpacity>

      {/* Quên mật khẩu */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.link}>{t('login.forgot')}</Text>
      </TouchableOpacity>

      {/* Đăng ký */}
      <View style={styles.registerRow}>
        <Text>{t('login.noAccount')} </Text>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text style={[styles.link, styles.linkInline]}>{t('login.createAccount')}</Text>
        </TouchableOpacity>
      </View>

      {/* 🚀 Tiếp tục với tư cách khách */}
      <TouchableOpacity onPress={handleGuestAccess} style={styles.guestButton}>
        <Text style={styles.guestText}>{t('guestAccount.continueAsGuest')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// === Styles ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#FFC107",
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "600",
  },
  required: {
    color: "red",
  },
  errorText: {
    color: "red",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  inputError: {
    borderColor: "red",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute",
    right: 15,
  },
  button: {
    backgroundColor: "#FFC107",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  link: {
    color: "#FFC107",
    textAlign: "center",
    marginTop: 10,
  },
  linkInline: {
    color: "#FFC107",
    marginLeft: 6,
    marginTop: 0,
    textAlign: "left",
  },
  guestButton: {
    marginTop: 25,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
  },
  guestText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center", // căn giữa theo chiều ngang
    alignItems: "center", // căn giữa theo chiều dọc
    marginTop: 10,
  },
});
