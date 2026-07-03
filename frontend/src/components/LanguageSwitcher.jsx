import { useLanguage } from "../i18n/LanguageContext";

const flags = { en: "🇬🇧", fr: "🇫🇷", ar: "🇸🇦" };
const labels = { en: "EN", fr: "FR", ar: "AR" };

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const languages = ["fr", "en", "ar"];

  return (
    <div className="flex items-center gap-1 bg-white/5 border border-zinc-700/50 rounded-lg p-0.5">
      {languages.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`text-xs px-2 py-1 rounded-md cursor-pointer transition-all ${
            lang === l
              ? "bg-amber-500/20 text-amber-400 font-medium"
              : "text-zinc-500 hover:text-zinc-300 bg-transparent"
          }`}
        >
          <span className="me-1">{flags[l]}</span>
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
