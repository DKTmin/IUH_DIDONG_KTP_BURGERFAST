import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import translations from "../i18n/translations";

type Language = "vi" | "en" | "zh";

type I18nContextType = {
    language: Language;
    setLanguage: (l: Language) => void;
    t: (path: string, fallback?: string) => string;
};

export const I18nContext = createContext<I18nContextType>({
    language: "vi",
    setLanguage: () => { },
    t: (p) => p,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("vi");

    useEffect(() => {
        // load saved language
        (async () => {
            try {
                const v = await AsyncStorage.getItem("@language");
                if (v === "en" || v === "vi" || v === "zh") setLanguageState(v as Language);
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const setLanguage = useCallback(async (l: Language) => {
        try {
            await AsyncStorage.setItem("@language", l);
        } catch (e) {
            Alert.alert("Error", "Could not save language");
        }
        setLanguageState(l);
    }, []);

    const t = useCallback(
        (path: string, fallback?: string) => {
            const parts = path.split(".");
            let cur: any = translations[language];
            for (const p of parts) {
                if (!cur) break;
                cur = cur[p];
            }
            if (cur == null) return fallback ?? path;
            return cur as string;
        },
        [language]
    );

    const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
