import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import "./androidShell.css";
import SearchBox from "../../components/searchBox";
import { useAppStore } from "../../store/useAppStore";

const bottomNavItems = [
  { mode: "home", name: "Books", icon: "home-line" },
  { mode: "favorite", name: "Favorites", icon: "heart" },
  { mode: "note", name: "Notes", icon: "idea-line" },
  { mode: "highlight", name: "Highlights", icon: "highlight-line" },
];

export interface AndroidDrawerControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const AndroidShell = ({
  drawer,
  onSync,
  isSyncing,
}: {
  drawer: AndroidDrawerControls;
  onSync: () => void;
  isSyncing: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mode = useAppStore((s) => s.sidebar.mode);
  const shelfTitle = useAppStore((s) => s.sidebar.shelfTitle);
  const isSortDisplay = useAppStore((s) => s.manager.isSortDisplay);
  const handleMode = useAppStore((s) => s.handleMode);
  const handleShelf = useAppStore((s) => s.handleShelf);
  const handleSelectBook = useAppStore((s) => s.handleSelectBook);
  const handleSearch = useAppStore((s) => s.handleSearch);
  const handleSearchResults = useAppStore((s) => s.handleSearchResults);
  const handleSortDisplay = useAppStore((s) => s.handleSortDisplay);
  const handleSetting = useAppStore((s) => s.handleSetting);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSearchOpen(false);
    handleSearch(false);
    handleSearchResults([]);
    handleSortDisplay(false);
  }, [pathname, handleSearch, handleSearchResults, handleSortDisplay]);

  useEffect(() => {
    if (isSearchOpen) {
      searchBarRef.current?.querySelector("input")?.focus();
    }
  }, [isSearchOpen]);

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
    closeSearch();
    handleSelectBook(false);
    handleMode(itemMode);
    handleShelf("");
    handleSortDisplay(false);
    navigate(`/manager/${itemMode}`);
  };

  return (
    <>
      <header className="m3-app-bar">
        {isSearchOpen ? (
          <div className="m3-search-bar" ref={searchBarRef}>
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
              aria-controls="android-drawer"
              aria-expanded={drawer.isOpen}
              onClick={drawer.open}
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
              aria-label={t("Sort by")}
              aria-expanded={isSortDisplay}
              onClick={() => handleSortDisplay(!isSortDisplay)}
            >
              <span className="icon-sort-desc"></span>
            </button>
            <button
              type="button"
              className="m3-icon-button"
              aria-label={t("Sync")}
              disabled={isSyncing}
              onClick={onSync}
            >
              <span className={isSyncing ? "icon-sync icon-rotate" : "icon-sync"}></span>
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
        aria-hidden="true"
        hidden={!drawer.isOpen}
        onClick={drawer.close}
      ></div>

      <nav className="m3-bottom-nav" aria-label={t("Navigation")}>
        {bottomNavItems.map((item) => (
          <button
            key={item.mode}
            type="button"
            className="m3-bottom-nav-item"
            aria-current={mode === item.mode ? "page" : undefined}
            onClick={() => goTo(item.mode)}
          >
            <span className="m3-bottom-nav-indicator" aria-hidden="true">
              <span className={`icon-${item.icon}`}></span>
            </span>
            <span className="m3-bottom-nav-label">{t(item.name)}</span>
          </button>
        ))}
        <button
          type="button"
          className="m3-bottom-nav-item"
          aria-current={
            bottomNavItems.some((item) => item.mode === mode) ? undefined : "page"
          }
          aria-controls="android-drawer"
          aria-expanded={drawer.isOpen}
          onClick={drawer.open}
        >
          <span className="m3-bottom-nav-indicator" aria-hidden="true">
            <span className="icon-menu"></span>
          </span>
          <span className="m3-bottom-nav-label">{t("More")}</span>
        </button>
      </nav>
    </>
  );
};

export default AndroidShell;
