// app/auth/register.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../config/firebaseConfig";
import useTranslation from "../hooks/useTranslation";

export default function RegisterScreen() {
  const router = useRouter();

  // State quản lý form
  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // 1 = Nam, 2 = Nữ, 3 = Khác
  const [gender, setGender] = useState<number>(1);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State bắt lỗi
  const [errors, setErrors] = useState<any>({});
  const { t } = useTranslation();

  // ✅ Kiểm tra lỗi
  const validateForm = () => {
    const newErrors: any = {};
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net|org|edu|gov|vn|info|co|io|us|uk|jp|kr|au|ca)$/i;
    const phoneClean = phone.trim();

    if (!name.trim()) newErrors.name = t('register.errors.required').replace('{field}', t('register.labels.name'));
    if (!dob) newErrors.dob = t('register.errors.required').replace('{field}', t('register.labels.dob'));

    if (!phoneClean) {
      newErrors.phone = t('register.errors.required').replace('{field}', t('register.labels.phone'));
    } else if (!/^\d{9,12}$/.test(phoneClean)) {
      newErrors.phone = t('register.errors.invalidPhone');
    }

    if (!email.trim()) {
      newErrors.email = t('register.errors.required').replace('{field}', t('register.labels.email'));
    } else if (!emailRegex.test(email.trim().toLowerCase())) {
      newErrors.email = t('register.errors.invalidEmail');
    }

    if (!password.trim()) newErrors.password = t('register.errors.required').replace('{field}', t('register.labels.password'));
    else if (password.length < 6) newErrors.password = t('register.errors.passwordMin');

    if (!confirm.trim()) newErrors.confirm = t('register.errors.required').replace('{field}', t('register.labels.confirm'));
    if (password !== confirm) newErrors.confirm = t('register.errors.confirmMismatch');

    if (!agree) newErrors.agree = t('register.errors.agreeRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Đăng ký tài khoản
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // ✅ Lưu Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        dob: dob ? dob.toISOString().split("T")[0] : "",
        gender,
        phone,
        email,
        role: "customer",
        points: 0, // 🌟 Điểm khởi đầu
        createdAt: new Date().toISOString(),
        // New address field: empty array by default
        address: [],
      });

      Alert.alert(t('register.alerts.successTitle'), t('register.alerts.successMessage'));
      router.push("/auth/login");
    } catch (error: any) {
      // Xử lý lỗi phổ biến của Firebase Auth để hiển thị lỗi trường hợp cụ thể
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev: any) => ({ ...prev, email: t('register.errors.emailExists') }));
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev: any) => ({ ...prev, email: t('register.errors.invalidEmail') }));
      } else if (error.code === "auth/weak-password") {
        setErrors((prev: any) => ({ ...prev, password: t('register.errors.weakPassword') }));
      } else {
        Alert.alert(t('register.errors.registerFailedTitle'), error.message || t('register.errors.registerFailedMessage'));
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('register.title')}</Text>

      {/* Họ và tên */}
      <Text style={styles.label}>
        {t('register.labels.name')} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t('register.labels.name')}
        value={name}
        onChangeText={setName}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      {/* Ngày sinh */}
      <Text style={styles.label}>
        {t('register.labels.dob')} <Text style={styles.required}>*</Text>
      </Text>

      {Platform.OS === "web" ? (
        <input
          type="date"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 12,
            width: "100%",
            marginBottom: 10,
          }}
          onChange={(e) => setDob(new Date(e.target.value))}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{dob ? dob.toLocaleDateString("vi-VN") : t('register.labels.dob')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}
        </>
      )}
      {errors.dob && <Text style={styles.error}>{errors.dob}</Text>}

      {/* Giới tính */}
      <Text style={styles.label}>{t('register.labels.gender')}</Text>
      <View style={styles.genderContainer}>
        {[
          { value: 1, key: 'male', label: t('register.genderOptions.male') },
          { value: 2, key: 'female', label: t('register.genderOptions.female') },
          { value: 3, key: 'other', label: t('register.genderOptions.other') },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.genderButton,
              gender === opt.value && styles.genderSelected,
            ]}
            onPress={() => setGender(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: gender === opt.value }}
          >
            <Text style={{ color: gender === opt.value ? "#fff" : "#333" }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Số điện thoại */}
      <Text style={styles.label}>
        {t('register.labels.phone')} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      {/* Email */}
      <Text style={styles.label}>
        {t('register.labels.email')} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Mật khẩu */}
      <Text style={styles.label}>
        {t('register.labels.password')} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder={t('register.labels.password')}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      {/* Xác nhận mật khẩu */}
      <Text style={styles.label}>
        {t('register.labels.confirm')} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder={t('register.labels.confirm')}
          secureTextEntry={!showConfirmPassword}
          value={confirm}
          onChangeText={setConfirm}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}

      {/* Đồng ý điều khoản */}
      <View style={styles.checkboxRow}>
        <TouchableOpacity onPress={() => setAgree(!agree)}>
          <Ionicons
            name={agree ? "checkbox" : "square-outline"}
            size={24}
            color={agree ? "#FFC107" : "#888"}
          />
        </TouchableOpacity>
        <Text style={styles.checkboxText}>
          {t('register.labels.agreeText')?.replace('{terms}', t('register.labels.terms')).replace('{privacy}', t('register.labels.privacy'))}
        </Text>
      </View>
      {errors.agree && <Text style={styles.error}>{errors.agree}</Text>}

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>{t('register.registerButton')}</Text>
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={[styles.linkText, { color: "#000", marginTop: 0 }]}>
          {t('register.haveAccount').split('?')[0]}?
        </Text>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={[styles.linkText, { color: "#FFC107", marginLeft: 6, marginTop: 0 }]}>
            {t('register.haveAccount').split('?')[1] || 'Đăng nhập'}
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

// ======= STYLES =======
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFC107",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  genderButton: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f1f1f1",
  },
  genderSelected: {
    backgroundColor: "#FFC107",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
  },
  link: {
    color: "#FFC107",
    textDecorationLine: "underline",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 8,
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
  linkText: {
    textAlign: "center",
    color: "#FFC107",
    marginTop: 10,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});
