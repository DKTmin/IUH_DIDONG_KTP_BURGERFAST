import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useTranslation from "../hooks/useTranslation";

type Props = {
    current?: "vi" | "en" | "zh";
    onSelect: (lang: "vi" | "en" | "zh") => void;
    onClose?: () => void;
};

export default function LanguageSelector({ current = "vi", onSelect, onClose }: Props) {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('guestAccount.language')}</Text>

            <TouchableOpacity
                style={styles.languageOption}
                onPress={() => {
                    onSelect('vi');
                    onClose?.();
                }}
            >
                <Text style={[styles.languageText, current === 'vi' && styles.languageActive]}>🇻🇳 {t('languages.vi')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.languageOption}
                onPress={() => {
                    onSelect('en');
                    onClose?.();
                }}
            >
                <Text style={[styles.languageText, current === 'en' && styles.languageActive]}>🇬🇧 {t('languages.en')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.languageOption}
                onPress={() => {
                    onSelect('zh');
                    onClose?.();
                }}
            >
                <Text style={[styles.languageText, current === 'zh' && styles.languageActive]}>🇨🇳 {t('languages.zh')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={() => onClose?.()}>
                <Text style={styles.closeText}>{t('common.close') || 'Close'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    languageOption: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
    },
    languageText: {
        fontSize: 16,
        color: '#333',
    },
    languageActive: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 12,
        backgroundColor: '#ccc',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    closeText: {
        color: '#333',
        fontWeight: '600',
    },
});
