import { useState } from "react";
import { createBooking } from "../api/bookings";
import { useLanguage } from "../i18n/LanguageContext";
import { useToast } from "./Toast";

function BookingForm() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", date: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBooking(form);
      setSent(true);
      setForm({ name: "", phone: "", date: "", message: "" });
    } catch (err) {
      addToast(err.message || t("booking.submitFailed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-lg mx-auto text-center p-10 border border-warm/20 rounded-sm animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-warm/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-2xl font-[family-name:var(--font-display)] mb-2">{t("booking.successTitle")}</p>
        <p className="text-ink-muted">{t("booking.successMsg")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col gap-4 border border-warm/10 p-8 rounded-sm animate-fade-in-up">
      <h2 className="text-xl font-[family-name:var(--font-display)]">{t("booking.formTitle")}</h2>
      <p className="text-ink-muted text-sm -mt-3">{t("booking.formSub")}</p>
      <input
        placeholder={t("booking.name")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp placeholder:text-ink-muted/40"
      />
      <input
        type="tel"
        inputMode="numeric"
        placeholder={t("booking.phone")}
        value={form.phone}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
          setForm({ ...form, phone: val });
        }}
        required
        className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp placeholder:text-ink-muted/40"
      />
      <input
        type="date"
        value={form.date}
        min={today}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
        className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp [color-scheme:light]"
      />
      <textarea
        placeholder={t("booking.message")}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        rows="4"
        className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp resize-y placeholder:text-ink-muted/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-warm text-paper font-medium py-3 rounded-sm btn hover:bg-warm-dark disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-paper/50 border-t-transparent rounded-full animate-spin" />
            {t("booking.sending")}
          </span>
        ) : (
          t("booking.submit")
        )}
      </button>
    </form>
  );
}

export default BookingForm;
