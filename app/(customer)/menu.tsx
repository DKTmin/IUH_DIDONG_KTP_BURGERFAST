import { StyleSheet, Text, View } from "react-native";

export default function CustomerMenu() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Trang menu (Khách Hàng)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    text: { fontSize: 20, fontWeight: "bold" },
});
