import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../../config/firebaseConfig";
import useTranslation from "../../hooks/useTranslation";

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(""); // ⚠️ Thêm state để hiển thị lỗi
    const [success, setSuccess] = useState("");
    const { t } = useTranslation();

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");

        const user = auth.currentUser;
        if (!user || !user.email) {
            setError(t('changePassword.errors.updateFailed'));
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError(t('changePassword.errors.fillAll'));
            return;
        }

        // Kiểm tra độ mạnh/mật khẩu mới: tối thiểu 6 ký tự
        const pwRegex = /^.{6,}$/;
        if (!pwRegex.test(newPassword)) {
            setError(t('changePassword.errors.minLength'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('changePassword.errors.mismatch'));
            return;
        }

        try {
            // Xác thực lại bằng mật khẩu hiện tại
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Đổi mật khẩu
            await updatePassword(user, newPassword);

            setSuccess(t('changePassword.errors.success'));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                setError(t('changePassword.errors.wrongCurrent'));
            } else {
                setError(t('changePassword.errors.updateFailed'));
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(customer)/account")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('changePassword.title')}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 44 }]}
                        placeholder={t('changePassword.currentPlaceholder')}
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowCurrentPassword((s) => !s)}
                    >
                        <Ionicons
                            name={showCurrentPassword ? "eye-outline" : "eye-off-outline"}
                            size={22}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 44 }]}
                        placeholder={t('changePassword.newPlaceholder')}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={(text) => {
                            setNewPassword(text);
                            // live-validate mismatch when both fields have content
                            if (confirmPassword && text !== confirmPassword) {
                                setError(t('changePassword.errors.mismatch'));
                            } else if (error === t('changePassword.errors.mismatch')) {
                                setError("");
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowNewPassword((s) => !s)}
                    >
                        <Ionicons
                            name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                            size={22}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 44 }]}
                        placeholder={t('changePassword.confirmPlaceholder')}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            if (newPassword && text !== newPassword) {
                                setError(t('changePassword.errors.mismatch'));
                            } else if (error === t('changePassword.errors.mismatch')) {
                                setError("");
                            }
                        }}
                    />
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword((s) => !s)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                            size={22}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? <Text style={styles.successText}>{success}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>{t('changePassword.updateButton')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fffbe6" },
    header: {
        backgroundColor: "#f5c518",
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
    form: { padding: 20 },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        marginBottom: 10,
    },
    passwordContainer: {
        position: "relative",
        marginBottom: 10,
    },
    eyeButton: {
        position: "absolute",
        right: 12,
        top: 12,
    },
    button: {
        backgroundColor: "#f5c518",
        borderRadius: 8,
        padding: 15,
        marginTop: 10,
    },
    buttonText: { color: "#333", textAlign: "center", fontWeight: "bold", fontSize: 16 },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 10,
        fontWeight: "600",
    },
    successText: {
        color: "green",
        textAlign: "center",
        marginBottom: 10,
        fontWeight: "600",
    },
});
