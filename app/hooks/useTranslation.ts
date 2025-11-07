import { useContext } from "react";
import { I18nContext } from "../context/LanguageProvider";

export default function useTranslation() {
    const ctx = useContext(I18nContext);
    return ctx;
}
