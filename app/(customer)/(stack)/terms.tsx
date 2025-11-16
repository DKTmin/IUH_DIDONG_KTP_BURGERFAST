import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTranslation from "../../hooks/useTranslation";

export default function CustomerTerms() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('common.termsAndConditions')}</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{t('common.termsAndConditions')}</Text>

                <Text style={styles.paragraph}>{t('terms.updated')}</Text>
                <Text style={styles.paragraph}>{t('terms.intro')}</Text>

                <Text style={styles.sectionTitle}>1. {t('terms.s1').split('.')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s1')}</Text>

                <Text style={styles.sectionTitle}>2. {t('terms.s2_1').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s2_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.s2_2')}</Text>
                <Text style={styles.paragraph}>{t('terms.s2_3')}</Text>

                <Text style={styles.sectionTitle}>3. {t('terms.s3_1').split('.')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s3_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.s3_2')}</Text>
                <Text style={styles.paragraph}>{t('terms.s3_3')}</Text>

                <Text style={styles.sectionTitle}>4. {t('terms.s4_1').split('(')[0].trim()}</Text>
                <Text style={styles.paragraph}>{t('terms.s4_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.s4_2')}</Text>
                <Text style={styles.paragraph}>{t('terms.s4_3')}</Text>

                <Text style={styles.sectionTitle}>5. {t('terms.s5_1').split('.')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s5_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.s5_2')}</Text>

                <Text style={styles.sectionTitle}>6. {t('terms.s6_1').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s6_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.s6_2')}</Text>
                <Text style={styles.paragraph}>{t('terms.s6_3')}</Text>

                <Text style={styles.sectionTitle}>7. {t('terms.s7').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s7')}</Text>

                <Text style={styles.sectionTitle}>8. {t('terms.s8').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s8')}</Text>

                <Text style={styles.sectionTitle}>9. {t('terms.s9').split(':')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s9')}</Text>

                <Text style={styles.sectionTitle}>10. {t('terms.s10').split(':')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s10')}</Text>

                <Text style={styles.sectionTitle}>11. {t('terms.s11').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s11')}</Text>

                <Text style={styles.sectionTitle}>12. {t('terms.s12').split(' ')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.s12')}</Text>

                <Text style={styles.sectionTitle}>13. {t('terms.contact_1').split(':')[0]}</Text>
                <Text style={styles.paragraph}>{t('terms.contact_1')}</Text>
                <Text style={styles.paragraph}>{t('terms.contact_2')}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        backgroundColor: "#FFC107",
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    content: { padding: 16 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 6 },
    paragraph: { fontSize: 14, color: "#444", lineHeight: 20, marginBottom: 10 },
});
