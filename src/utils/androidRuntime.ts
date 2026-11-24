import { SystemBars, SystemBarsStyle } from "@capacitor/core";
import { isAndroidNative } from "./platform";

let systemBarsObserver: MutationObserver | null = null;

const syncSystemBars = () => {
  if (!isAndroidNative()) return;
  const isDark = document.documentElement.dataset.theme === "dark";
  // Dark icons on a light background, light icons on a dark background.
  SystemBars.setStyle({
    style: isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
  }).catch(() => {
    // The system bars plugin is native-only; ignore failures in previews.
  });
};

/**
 * Adds the platform markers used by the Material 3 styles and keeps the
 * Android status/navigation bar icons in sync with the app theme.
 *
 * Call once, before React renders, so the first paint already uses the
 * Android layout.
 */
export const initAndroidRuntime = () => {
  if (!isAndroidNative()) return;
  document.documentElement.classList.add("android-app", "capacitor-native");
  document.documentElement.dataset.platform = "android";
  document.documentElement.dataset.nativePlatform = "android";

  syncSystemBars();
  if (!systemBarsObserver) {
    systemBarsObserver = new MutationObserver(syncSystemBars);
    systemBarsObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }
};
