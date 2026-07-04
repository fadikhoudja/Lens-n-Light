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
      <div className="animate-fade-up bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-10 rounded-3xl text-center">
        <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-3xl font-bold mb-2 text-white">{t("booking.successTitle")}</p>
        <p className="text-zinc-400 text-lg">{t("booking.successMsg")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8">
      <h2 className="text-2xl font-bold tracking-tight mb-1">{t("booking.formTitle")}</h2>
      <p className="text-zinc-400 text-sm -mt-2 mb-2">{t("booking.formSub")}</p>
      <div className="relative">
        <svg className="absolute form-icon left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <input
          placeholder={t("booking.name")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full form-input bg-zinc-900/80 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-zinc-500"
        />
      </div>
      <div className="relative">
        <svg className="absolute form-icon left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
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
          pattern="[0-9]{10}"
          title="Phone number must be exactly 10 digits"
          className="w-full form-input bg-zinc-900/80 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-zinc-500"
        />
      </div>
      <div className="relative">
        <svg className="absolute form-icon left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <input
          type="date"
          value={form.date}
          min={today}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="w-full form-input bg-zinc-900/80 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all [color-scheme:dark]"
        />
      </div>
      <div className="relative">
        <svg className="absolute form-icon left-4 top-4 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <textarea
          placeholder={t("booking.message")}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows="4"
          className="w-full form-input bg-zinc-900/80 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-y placeholder-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold py-3.5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-base shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
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
