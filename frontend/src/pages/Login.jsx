import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";

function Login() {
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin");
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <svg className="w-6 h-6 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t("login.title")}</h1>
          <p className="text-zinc-500 text-sm mt-1">{t("login.subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6">
          {error && (
            <div className="bg-red-900/30 border border-red-800/50 text-red-400 text-sm rounded-xl px-4 py-2.5 text-center">
              {error}
            </div>
          )}
          <input
            placeholder={t("login.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-zinc-500"
          />
          <input
            type="password"
            placeholder={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                {t("login.login")}
              </span>
            ) : (
              t("login.login")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
