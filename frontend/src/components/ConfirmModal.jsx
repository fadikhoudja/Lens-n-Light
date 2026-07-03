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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={onCancel}>
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-center text-zinc-200 text-sm mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:text-white hover:border-zinc-500 transition-all bg-transparent">
            {t("admin.confirmCancel")}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium cursor-pointer hover:bg-red-400 transition-all">
            {t("admin.confirmDelete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
