import { useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

function ConfirmModal({ message, onConfirm, onCancel }) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 animate-fade-in" onClick={onCancel}>
      <div className="bg-paper border border-warm/10 p-6 max-w-sm w-full shadow-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <p className="text-center text-ink text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-warm/20 text-ink-muted text-sm btn hover:text-ink hover:border-warm/40 bg-transparent">
            {t("admin.confirmCancel")}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium btn hover:bg-red-400">
            {t("admin.confirmDelete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
