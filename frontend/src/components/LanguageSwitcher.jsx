import { useLanguage } from "../i18n/LanguageContext";

const labels = { en: "EN", fr: "FR", ar: "AR" };

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const languages = ["fr", "en", "ar"];

  return (
    <div className="flex items-center gap-0.5">
      {languages.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`text-xs px-2 py-1 cursor-pointer transition-colors ${
            lang === l
              ? "text-warm font-medium"
              : "text-ink-muted/50 hover:text-ink-muted"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
