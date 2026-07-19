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
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-warm/10 border border-warm/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-[family-name:var(--font-display)]">{t("login.title")}</h1>
          <p className="text-ink-muted text-sm mt-1">{t("login.subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-8 polaroid">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 text-center animate-fade-in">
              {error}
            </div>
          )}
          <input
            placeholder={t("login.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp placeholder:text-ink-muted/40"
          />
          <input
            type="password"
            placeholder={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-warm/20 bg-transparent px-4 py-3 text-sm inp placeholder:text-ink-muted/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-warm text-paper font-medium py-3 rounded-sm btn hover:bg-warm-dark disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-paper/50 border-t-transparent rounded-full animate-spin" />
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
