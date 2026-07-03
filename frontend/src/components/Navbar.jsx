import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (path) =>
    `text-sm tracking-wide transition-all ${
      pathname === path ? "text-white" : "text-zinc-400 hover:text-white"
    }`;

  const links = (
    <>
      <Link to="/" className={linkClass("/")} onClick={() => setMenuOpen(false)}>
        {t("nav.gallery")}
      </Link>
      <Link to="/book" className={linkClass("/book")} onClick={() => setMenuOpen(false)}>
        {t("nav.book")}
      </Link>
      {authed ? (
        <>
          <Link to="/admin" className={linkClass("/admin")} onClick={() => setMenuOpen(false)}>
            {t("nav.admin")}
          </Link>
          <button
            onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer bg-transparent font-normal p-0"
          >
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <Link to="/admin/login" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors" onClick={() => setMenuOpen(false)}>
          {t("nav.adminLogin")}
        </Link>
      )}
    </>
  );

  return (
    <nav className={`flex items-center justify-between px-4 md:px-12 py-5 z-20 ${
      isHome ? "absolute top-0 left-0 right-0 bg-transparent" : "fixed top-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800"
    }`}>
      <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 group shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block group-hover:scale-150 transition-transform" />
        <span className="font-[family-name:var(--font-display)] italic text-amber-400">Lens</span>
        <span className="text-white">&</span>
        <span className="text-white">Light</span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {links}
        <LanguageSwitcher />
      </div>

      <div className="flex md:hidden items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-zinc-700/50 cursor-pointer"
        >
          <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4 flex flex-col gap-3 md:hidden animate-fade-in">
          {links}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
