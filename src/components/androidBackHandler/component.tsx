import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { useAppStore } from "../../store/useAppStore";
import { isAndroidNative, isAndroidPreviewMode } from "../../utils/platform";

const dismissBackLayer = () => {
  const controls = [
    ".manager .drag-background",
    ".setting-dialog-main .setting-close-container",
    ".m3-scrim:not([hidden])",
    ".more-import-toggle[aria-expanded='true']",
    ".m3-search-close",
  ];
  for (const selector of controls) {
    const control = document.querySelector<HTMLElement>(selector);
    if (control?.getClientRects().length) {
      control.click();
      return true;
    }
  }
  return false;
};

/** Close the active layer first, then navigate within the app, then minimize. */
const AndroidBackHandler = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isAndroidPreviewMode()) {
      const onEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && dismissBackLayer()) event.preventDefault();
      };
      window.addEventListener("keydown", onEscape);
      return () => window.removeEventListener("keydown", onEscape);
    }
    if (!isAndroidNative()) return;

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (dismissBackLayer()) return;

      const isLibraryHome =
        pathname === "/manager/home" ||
        (pathname === "/manager/empty" && useAppStore.getState().sidebar.mode === "home");
      if (pathname === "/" || isLibraryHome) {
        void App.minimizeApp().catch(() => App.exitApp());
        return;
      }
      if (!pathname.startsWith("/manager/") && pathname !== "/manager" && canGoBack) {
        navigate(-1);
        return;
      }
      navigate("/manager/home", { replace: true });
    });

    return () => {
      void listener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [navigate, pathname]);

  return null;
};

export default AndroidBackHandler;
