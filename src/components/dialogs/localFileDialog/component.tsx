import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./localFileDialog.css";
import { useAppStore } from "../../../store/useAppStore";
import LazyLottie from "../../lazyLottie";
import toast from "react-hot-toast";
import { isElectron } from "react-device-detect";
import { Capacitor } from "@capacitor/core";
import { ConfigService } from "../../../assets/lib/kookit-extra-browser.min";
import {
  exportToLocalFile,
  LocalFileManager,
} from "../../../utils/file/localFile";

const LocalFileDialog = () => {
  if (Capacitor.isNativePlatform()) {
    return null;
  }
  const handleLocalFileDialog = useAppStore((s) => s.handleLocalFileDialog);
  const handleFetchBooks = useAppStore((s) => s.handleFetchBooks);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFinish, setIsFinish] = useState(false);
  const [status, setStatus] = useState<{
    hasAccess: boolean;
    needsReauthorization: boolean;
    directoryName?: string;
  }>({
    hasAccess: false,
    needsReauthorization: false,
    directoryName: "",
  });

  useEffect(() => {
    if (!isElectron) {
      LocalFileManager.getPermissionStatus().then((nextStatus) => {
        setStatus(nextStatus);
      });
    }
  }, []);

  const handleClose = () => {
    handleLocalFileDialog(false);
  };
  const showMessage = (message: string) => {
    toast(t(message));
  };
  const handleSelectFolder = async () => {
    if (!LocalFileManager.isSupported()) {
      showMessage("Your browser doesn't support local file access");
      return;
    }

    try {
      const directoryHandle = await LocalFileManager.requestDirectoryAccess();

      if (directoryHandle) {
        toast.loading(
          t("Granting access to local folder, please wait"),
          {
            id: "local-folder-access",
          }
        );
        let fileList = await LocalFileManager.listFiles("config");
        if (fileList.length > 0 && fileList.indexOf("books.db") > -1) {
        } else {
          await exportToLocalFile();
        }
        toast.dismiss("local-folder-access");
        setIsFinish(true);
        ConfigService.setItem("isUseLocal", "yes");
        showMessage("Local folder access granted successfully");
        handleFetchBooks();
        setTimeout(() => {
          navigate("/manager/home");
        }, 2000);
      } else {
        showMessage("Failed to get folder access permission");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error("Error selecting folder:" + errorMessage);
      console.error("Error selecting folder:", error);
      showMessage("Error occurred while selecting folder");
    }
  };

  return (
    <div
      className="backup-page-container local-file-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={t("Never lose your data")}
    >
      <div className="local-file-dialog-title">{t("Never lose your data")}</div>
      {!isFinish ? (
        <>
          <LazyLottie
            animation="safe"
            loop={false}
            style={{ height: 120, width: "100%", flexShrink: 0 }}
          />
          <div className="backup-page-warning-text">
            {status.needsReauthorization
              ? t("Need to reauthorize the access to directory") +
                " " +
                status.directoryName +
                ", " +
                t(
                  "Please click the allow on every visit button to avoid this popup once and for all"
                )
              : t(
                  "Grant access to local folder to save your data and reduce the risk of data loss"
                )}
          </div>
          <div className="local-file-dialog-actions">
            <button
              type="button"
              className="add-dialog-cancel"
              onClick={() => {
                ConfigService.setItem("isUseLocal", "no");
                handleClose();
              }}
            >
              {t("Continue to store in the browser")}
            </button>
            {status.needsReauthorization ? (
              <button
                type="button"
                className="add-dialog-confirm"
                onClick={async () => {
                  await LocalFileManager.ensureDirectoryAccess();
                  setIsFinish(true);

                  handleFetchBooks();
                  setTimeout(() => {
                    navigate("/manager/home");
                  }, 2000);
                }}
              >
                {t("Authorize")}
              </button>
            ) : (
              <button
                type="button"
                className="add-dialog-confirm"
                onClick={handleSelectFolder}
              >
                {t("Select folder")}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="local-file-dialog-result">
          <LazyLottie
            animation="success"
            loop={false}
            style={{ height: 80, width: "100%" }}
          />
          <div>{t("Setup successful")}</div>
        </div>
      )}
      <button
        type="button"
        className="backup-page-close-icon"
        aria-label={t("Close")}
        onClick={handleClose}
      >
        <span className="icon-close" aria-hidden="true" />
      </button>
    </div>
  );
};

export default LocalFileDialog;
