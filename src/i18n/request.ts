import { getRequestConfig } from "next-intl/server";
import { getLocaleAction } from "./get-locale";
import deepmerge from "deepmerge";

let defaultMessages: any = undefined;

export default getRequestConfig(async () => {
  console.log("🔍 [i18n] Loading configuration...");

  let locale = "en"; // Default fallback

  try {
    locale = await getLocaleAction();
    console.log("🌍 [i18n] Detected locale:", locale);
  } catch (error) {
    console.error("❌ [i18n] Failed to get locale, using default:", error);
    locale = "en";
  }

  // Ensure we have a valid locale
  const validLocales = ["en", "ko", "es", "fr", "ja", "zh"];
  if (!validLocales.includes(locale)) {
    console.warn("⚠️ [i18n] Invalid locale, using default:", locale);
    locale = "en";
  }

  if (!defaultMessages) {
    try {
      defaultMessages = (await import(`../../messages/en.json`)).default;
      console.log(
        "✅ [i18n] Loaded default messages:",
        Object.keys(defaultMessages).length,
        "sections",
      );
    } catch (error) {
      console.error("❌ [i18n] Failed to load default messages:", error);
      defaultMessages = {};
    }
  }

  let messages = defaultMessages;

  if (locale !== "en") {
    try {
      const localeMessages = (await import(`../../messages/${locale}.json`))
        .default;
      messages = deepmerge(defaultMessages, localeMessages);
      console.log("✅ [i18n] Merged messages for locale:", locale);
    } catch (error) {
      console.warn(
        "⚠️ [i18n] Failed to load locale messages, using default:",
        error,
      );
      messages = defaultMessages;
    }
  }

  console.log("🎯 [i18n] Final configuration:", {
    locale,
    messageKeys: Object.keys(messages),
  });

  return {
    locale,
    messages,
    getMessageFallback({ key, namespace }) {
      const fallback = `${namespace}.${key}`;
      console.warn("⚠️ [i18n] Using fallback message:", fallback);
      return fallback;
    },
  };
});
