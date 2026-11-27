import { useEffect, useRef } from "react";
import "./settingDialog.css";
import { useAppStore } from "../../../store/useAppStore";
import { useTranslation } from "react-i18next";
import GeneralSetting from "../../../containers/settings/generalSetting";
import SyncSetting from "../../../containers/settings/syncSetting";
import AccountSetting from "../../../containers/settings/accountSetting";
import PluginSetting from "../../../containers/settings/pluginSetting";
import ReadingSetting from "../../../containers/settings/readingSetting";
import AppearanceSetting from "../../../containers/settings/appearanceSetting";
import AboutSetting from "../../../containers/settings/aboutSetting";
import DataSetting from "../../../containers/settings/dataSetting";
import AISetting from "../../../containers/settings/aiSetting";
import BackgroundSetting from "../../../containers/settings/backgroundSetting";
import FontSetting from "../../../containers/settings/fontSetting";
import ChapterSetting from "../../../containers/settings/chapterSetting";
import TextSetting from "../../../containers/settings/textSetting";
import DictSetting from "../../../containers/settings/dictSetting";
import MoreSetting from "../../../containers/settings/moreSetting";
import ShortcutSetting from "../../../containers/settings/shortcutSetting";
import { isElectron } from "react-device-detect";

const categories = [
  [
    { mode: "account", icon: "icon-user", label: "Account", fontSize: "18px" },
    { mode: "general", icon: "icon-setting", label: "General" },
    { mode: "data", icon: "icon-archive", label: "Data", fontSize: "15px" },
    { mode: "reading", icon: "icon-bookshelf-line", label: "Reading" },
    { mode: "shortcut", icon: "icon-keyboard", label: "Shortcuts" },
    {
      mode: "appearance",
      icon: "icon-highlight-line",
      label: "Appearance",
      fontSize: "20px",
    },
    { mode: "sync", icon: "icon-sync", label: "Sync and backup" },
    { mode: "more", icon: "icon-more", label: "More settings", fontSize: "13px" },
    { mode: "about", icon: "icon-detail", label: "About", fontSize: "18px" },
  ],
  [
    { mode: "plugins", icon: "icon-internet", label: "Plugins" },
    { mode: "ai", icon: "icon-idea-line", label: "AI service", fontSize: "18px" },
    {
      mode: "background",
      icon: "icon-image",
      label: "Background",
      fontSize: "18px",
    },
    {
      mode: "font",
      icon: "icon-font",
      label: "Font management",
      fontSize: "18px",
    },
    {
      mode: "chapter",
      icon: "icon-convert-text",
      label: "TXT parser",
      fontSize: "19px",
    },
    {
      mode: "text",
      icon: "icon-edit-line",
      label: "Text rules",
      fontSize: "18px",
    },
    ...(isElectron
      ? [
          {
            mode: "dict",
            icon: "icon-address-book",
            label: "Local dictionary",
            fontSize: "18px",
          },
        ]
      : []),
  ],
];

const allCategories = categories.flat();

const SettingDialog = () => {
  const { t } = useTranslation();
  const settingMode = useAppStore((s) => s.manager.settingMode);
  const handleSetting = useAppStore((s) => s.handleSetting);
  const handleFetchPlugins = useAppStore((s) => s.handleFetchPlugins);
  const handleFetchDataSourceList = useAppStore(
    (s) => s.handleFetchDataSourceList
  );
  const handleFetchDefaultSyncOption = useAppStore(
    (s) => s.handleFetchDefaultSyncOption
  );
  const handleSettingMode = useAppStore((s) => s.handleSettingMode);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleFetchPlugins();
    handleFetchDataSourceList();
    handleFetchDefaultSyncOption();
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [settingMode]);

  const renderSidebarItem = ({
    mode,
    icon,
    label,
    fontSize,
  }: (typeof allCategories)[number]) => {
    const isActive = settingMode === mode;
    return (
      <button
        key={mode}
        type="button"
        className={"setting-dialog-sidebar-item" + (isActive ? " active" : "")}
        aria-current={isActive || undefined}
        onClick={() => handleSettingMode(mode)}
      >
        <span
          className={"setting-dialog-sidebar-icon " + icon}
          style={{ fontSize }}
          aria-hidden="true"
        />
        {t(label)}
      </button>
    );
  };

  const pageTitle =
    allCategories.find((category) => category.mode === settingMode)?.label ||
    "Setting";

  return (
    <div
      className="setting-dialog-container"
      role="dialog"
      aria-modal="true"
      aria-label={t("Setting")}
    >
      <div className="setting-dialog-sidebar">
        <div className="setting-dialog-sidebar-title">{t("Setting")}</div>
        <div className="setting-dialog-sidebar-group">
          {categories[0].map(renderSidebarItem)}
        </div>
        <hr className="setting-dialog-sidebar-divider" />
        <div className="setting-dialog-sidebar-group">
          {categories[1].map(renderSidebarItem)}
        </div>
      </div>

      <div className="setting-dialog-main">
        <div className="setting-dialog-main-header">{t(pageTitle)}</div>
        <select
          className="setting-dialog-category"
          aria-label={t("Setting")}
          value={settingMode}
          onChange={(event) => handleSettingMode(event.target.value)}
        >
          {allCategories.map(({ mode, label }) => (
            <option key={mode} value={mode}>
              {t(label)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="setting-close-container"
          aria-label={t("Close")}
          onClick={() => {
            handleSetting(false);
            handleSettingMode("general");
          }}
        >
          <span className="icon-close setting-close" aria-hidden="true" />
        </button>

        <div className="setting-dialog-info" ref={contentRef}>
          {settingMode === "general" ? (
            <GeneralSetting />
          ) : settingMode === "reading" ? (
            <ReadingSetting />
          ) : settingMode === "shortcut" ? (
            <ShortcutSetting />
          ) : settingMode === "appearance" ? (
            <AppearanceSetting />
          ) : settingMode === "sync" ? (
            <SyncSetting />
          ) : settingMode === "account" ? (
            <AccountSetting />
          ) : settingMode === "data" ? (
            <DataSetting />
          ) : settingMode === "about" ? (
            <AboutSetting />
          ) : settingMode === "ai" ? (
            <AISetting />
          ) : settingMode === "background" ? (
            <BackgroundSetting />
          ) : settingMode === "font" ? (
            <FontSetting />
          ) : settingMode === "chapter" ? (
            <ChapterSetting />
          ) : settingMode === "text" ? (
            <TextSetting />
          ) : settingMode === "dict" ? (
            <DictSetting />
          ) : settingMode === "more" ? (
            <MoreSetting />
          ) : (
            <PluginSetting />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingDialog;
