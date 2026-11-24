import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for the Android build.
 *
 * The web app is built with `npm run build:android` into `build/` and then
 * copied into the native project with `npx cap sync android`.
 *
 * Keep `androidScheme: "https"` so the app runs in a secure context
 * (IndexedDB, WebAssembly, service workers and the clipboard API all need it).
 */
const config: CapacitorConfig = {
  appId: "com.ntt.tebook",
  appName: "T-Ebook",
  webDir: "build",
  backgroundColor: "#FEF7FF",
  android: {
    backgroundColor: "#FEF7FF",
    // The Android 8+ WebView is updatable through Play Store. 87 is the
    // oldest engine the modern web build is transpiled for.
    minWebViewVersion: 87,
    webContentsDebuggingEnabled: false,
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
    hostname: "localhost",
    cleartext: false,
  },
  plugins: {
    SystemBars: {
      // Edge-to-edge with safe-area variables injected as CSS custom
      // properties (--safe-area-inset-*). Android 15+ enforces edge-to-edge.
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
      style: "DEFAULT",
    },
  },
};

export default config;
