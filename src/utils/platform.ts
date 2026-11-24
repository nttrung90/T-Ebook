import { Capacitor } from "@capacitor/core";

/**
 * True when the bundle runs inside a Capacitor native container.
 */
export const isCapacitorNative = () => Capacitor.isNativePlatform();

/**
 * True only for the Android Capacitor build.
 */
export const isAndroidNative = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

const isAndroidPreview = () => {
  if (typeof window === "undefined") return false;
  try {
    return (
      new URLSearchParams(window.location.search).get("androidShell") === "1"
    );
  } catch {
    return false;
  }
};

/**
 * Android UI (M3 app bar, bottom navigation and drawer) is enabled in the
 * native Android build, and can be previewed in a desktop browser with
 * `?androidShell=1` appended to the dev server URL.
 */
export const isAndroidUi = () => isAndroidNative() || isAndroidPreview();

export const isAndroidPreviewMode = () => !isAndroidNative() && isAndroidPreview();
