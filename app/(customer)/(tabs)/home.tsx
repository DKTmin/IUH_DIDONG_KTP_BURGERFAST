import { StyleSheet, Text, View } from "react-native";

export default function CustomerHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trang chủ (Khách Hàng)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
