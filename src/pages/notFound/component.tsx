import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import "./notFound.css";

const NotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleMode = useAppStore((s) => s.handleMode);
  const handleSearch = useAppStore((s) => s.handleSearch);

  return (
    <main className="route-not-found">
      <h1>{t("It seems like you're lost")}</h1>
      <button
        type="button"
        onClick={() => {
          handleMode("home");
          handleSearch(false);
          navigate("/manager/home", { replace: true });
        }}
      >
        {t("Return to home")}
      </button>
    </main>
  );
};

export default NotFound;
