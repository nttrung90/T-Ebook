import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import "./androidShell.css";
import SearchBox from "../../components/searchBox";
import { isAndroidUi } from "../../utils/platform";
import { useAppStore } from "../../store/useAppStore";

const bottomNavItems = [
  { mode: "home", name: "Books", icon: "home-line" },
  { mode: "favorite", name: "Favorites", icon: "heart" },
  { mode: "note", name: "Notes", icon: "idea-line" },
  { mode: "highlight", name: "Highlights", icon: "highlight-line" },
];

const AndroidShell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = useAppStore((s) => s.sidebar.mode);
  const shelfTitle = useAppStore((s) => s.sidebar.shelfTitle);
  const handleMode = useAppStore((s) => s.handleMode);
  const handleShelf = useAppStore((s) => s.handleShelf);
  const handleSelectBook = useAppStore((s) => s.handleSelectBook);
  const handleSearch = useAppStore((s) => s.handleSearch);
  const handleSearchResults = useAppStore((s) => s.handleSearchResults);
  const handleSortDisplay = useAppStore((s) => s.handleSortDisplay);
  const handleSetting = useAppStore((s) => s.handleSetting);
  const handleImportDialog = useAppStore((s) => s.handleImportDialog);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isAndroid = isAndroidUi();

  const openDrawer = () => {
    document.documentElement.classList.add("m3-drawer-open");
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    document.documentElement.classList.remove("m3-drawer-open");
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    if (!isAndroid) return;
    closeDrawer();
    setIsSearchOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const timer = window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>(".m3-search-bar .header-search-box")
        ?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isAndroid) return;
    const handleSidebarClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(".sidebar .side-menu-item")) {
        closeDrawer();
      }
    };
    document.addEventListener("click", handleSidebarClick, true);
    return () => document.removeEventListener("click", handleSidebarClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAndroid]);

  if (!isAndroid) return null;

  const closeSearch = () => {
    setIsSearchOpen(false);
    handleSearch(false);
    handleSearchResults([]);
  };

  const title =
    mode === "shelf"
      ? shelfTitle || t("Shelf")
      : t(
          bottomNavItems.find((item) => item.mode === mode)?.name ||
            (mode === "trash" ? "Deleted Books" : "Books")
        );

  const goTo = (itemMode: string) => {
    handleSelectBook(false);
    handleMode(itemMode);
    handleShelf("");
    handleSearch(false);
    handleSortDisplay(false);
    navigate(`/manager/${itemMode}`);
  };

  const isLibraryMode = ["home", "shelf", "favorite"].includes(mode);
  const isMoreActive =
    isDrawerOpen || !["home", "favorite", "note", "highlight"].includes(mode);

  return (
    <>
      <header className="m3-app-bar">
        {isSearchOpen ? (
          <div className="m3-search-bar">
            <SearchBox />
            <button
              type="button"
              className="m3-icon-button m3-search-close"
              aria-label={t("Close")}
              onClick={closeSearch}
            >
              <span className="icon-close"></span>
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="m3-icon-button"
              aria-label={t("Menu")}
              onClick={openDrawer}
            >
              <span className="icon-menu"></span>
            </button>
            <h1 className="m3-app-bar-title">{title}</h1>
            <button
              type="button"
              className="m3-icon-button"
              aria-label={t("Search")}
              onClick={() => setIsSearchOpen(true)}
            >
              <span className="icon-search"></span>
            </button>
            <button
              type="button"
              className="m3-icon-button"
              aria-label={t("Setting")}
              onClick={() => handleSetting(true)}
            >
              <span className="icon-setting"></span>
            </button>
          </>
        )}
      </header>

      <div
        className="m3-scrim"
        aria-hidden={!isDrawerOpen}
        onClick={closeDrawer}
      ></div>

      <nav className="m3-bottom-nav" aria-label={t("Navigation")}>
        {bottomNavItems.map((item) => (
          <button
            key={item.mode}
            type="button"
            className={
              "m3-bottom-nav-item" +
              (mode === item.mode ? " m3-bottom-nav-item-active" : "")
            }
            onClick={() => goTo(item.mode)}
          >
            <span className="m3-bottom-nav-indicator">
              <span className={`icon-${item.icon}`}></span>
            </span>
            <span className="m3-bottom-nav-label">{t(item.name)}</span>
          </button>
        ))}
        <button
          type="button"
          className={
            "m3-bottom-nav-item" + (isMoreActive ? " m3-bottom-nav-item-active" : "")
          }
          onClick={openDrawer}
        >
          <span className="m3-bottom-nav-indicator">
            <span className="icon-menu"></span>
          </span>
          <span className="m3-bottom-nav-label">{t("More")}</span>
        </button>
      </nav>

      {isLibraryMode && (
        <button
          type="button"
          className="m3-fab"
          aria-label={t("Import")}
          onClick={() => handleImportDialog(true)}
        >
          <span className="icon-add"></span>
          <span className="m3-fab-label">{t("Import")}</span>
        </button>
      )}
    </>
  );
};

export default AndroidShell;
