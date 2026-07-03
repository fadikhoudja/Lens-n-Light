import BookingForm from "../components/BookingForm";
import { useLanguage } from "../i18n/LanguageContext";

function Booking() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-medium">{t("booking.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {t("booking.title1")}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">{t("booking.title2")}</span>
          </h1>
          <p className="text-zinc-400 max-w-sm mx-auto">
            {t("booking.subtitle")}
          </p>
        </div>
        <BookingForm />
      </div>
    </div>
  );
}

export default Booking;
