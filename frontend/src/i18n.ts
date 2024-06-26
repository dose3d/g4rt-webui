import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DrfI18nResourceEn } from './drf-crud-client';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,

    interpolation: {
      escapeValue: false,
    },
  })
  .then();

i18n.addResourceBundle('en', 'drf', DrfI18nResourceEn);

export default i18n;
