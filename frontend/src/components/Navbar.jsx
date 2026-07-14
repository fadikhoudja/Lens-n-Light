import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (path) =>
    `text-sm tracking-wide transition-all ${
      pathname === path ? "text-white" : "text-zinc-400 hover:text-white"
    }`;

  const closeMenu = () => setMenuOpen(false);

  const links = (
    <>
      <Link to="/" className={`${linkClass("/")} py-3`} onClick={closeMenu}>
        {t("nav.gallery")}
      </Link>
      <Link to="/book" className={`${linkClass("/book")} py-3`} onClick={closeMenu}>
        {t("nav.book")}
      </Link>
      {authed ? (
        <>
          <Link to="/admin" className={`${linkClass("/admin")} py-3`} onClick={closeMenu}>
            {t("nav.admin")}
          </Link>
          <button
            onClick={() => { logout(); navigate("/"); closeMenu(); }}
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer bg-transparent font-normal py-3 text-start"
          >
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <Link to="/admin/login" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors py-3" onClick={closeMenu}>
          {t("nav.adminLogin")}
        </Link>
      )}
    </>
  );

  return (
    <nav className={`flex items-center justify-between px-4 md:px-12 py-5 z-20 fixed top-0 left-0 right-0 ${
      isHome && !scrolled ? "bg-transparent" : "bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800"
    }`}>
      <Link to="/" className="flex items-center gap-3 group shrink-0">
        <img src="/logo.jpeg" alt="Creative Studio" className="h-10 w-auto rounded-lg" />
        <span className="hidden sm:inline text-xl font-bold tracking-tight">
          <span className="font-[family-name:var(--font-display)] italic text-amber-400">Creative</span>
          <span className="text-white">Studio</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {links}
        <LanguageSwitcher />
      </div>

      <div className="flex md:hidden items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/5 border border-zinc-700/50 cursor-pointer"
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
        <>
          <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={closeMenu} />
          <div
            className="fixed top-[73px] left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-4 flex flex-col gap-3 animate-fade-in md:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {links}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
