import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend"; // Optional: for loading translations from a server
import LanguageDetector from "i18next-browser-languagedetector"; // Optional: for detecting user language

i18n
  .use(HttpApi) // Optional: for loading translations from a server
  .use(LanguageDetector) // Optional: for detecting user language
  .use(initReactI18next)
  .init({
    fallbackLng: "en", // Default language
    // debug: true, // Optional: for debugging
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    // Optional: configuration for backend plugin
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // Path where translations are stored
    },
  });

export default i18n;
