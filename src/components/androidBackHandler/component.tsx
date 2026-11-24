import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { isAndroidNative } from "../../utils/platform";

const closeDrawer = () => {
  if (document.documentElement.classList.contains("m3-drawer-open")) {
    document.documentElement.classList.remove("m3-drawer-open");
    return true;
  }
  return false;
};

const closeDialog = () => {
  const backdrop = document.querySelector<HTMLElement>(".drag-background");
  if (backdrop && getComputedStyle(backdrop).display !== "none") {
    backdrop.click();
    return true;
  }
  return false;
};

/**
 * Maps the Android hardware/gesture back button to the app's navigation:
 * close the drawer/dialog first, then go to the library home, then minimize.
 */
const AndroidBackHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAndroidNative()) return;

    let disposed = false;
    let listenerHandle: { remove: () => void } | undefined;

    App.addListener("backButton", () => {
      if (closeDrawer() || closeDialog()) return;

      const path = window.location.hash.replace(/^#/, "").split("?")[0];
      if (!path || path === "/" || path === "/manager/home" || path === "/manager/empty") {
        App.minimizeApp().catch(() => App.exitApp());
        return;
      }
      if (path.startsWith("/manager/")) {
        navigate("/manager/home");
        return;
      }
      if (path === "/login" || path === "/stats") {
        navigate(-1);
        return;
      }
      // Reader routes: return to the previous screen when possible.
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/manager/home");
      }
    }).then((handle) => {
      if (disposed) {
        handle.remove();
      } else {
        listenerHandle = handle;
      }
    });

    return () => {
      disposed = true;
      listenerHandle?.remove();
    };
  }, [navigate]);

  return null;
};

export default AndroidBackHandler;
