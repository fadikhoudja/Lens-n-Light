import BookingForm from "../components/BookingForm";
import { useLanguage } from "../i18n/LanguageContext";

function Booking() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-lg mx-auto text-center mb-10">
        <p className="text-ink-muted text-sm mb-4 font-[family-name:var(--font-display)] italic">
          {t("booking.badge")}
        </p>
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] leading-tight mb-3">
          {t("booking.title1")}
          <span className="block text-warm">{t("booking.title2")}</span>
        </h1>
        <p className="text-ink-muted max-w-sm mx-auto">
          {t("booking.subtitle")}
        </p>
      </div>
      <BookingForm />
    </div>
  );
}

export default Booking;
