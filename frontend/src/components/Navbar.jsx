import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

function Navbar() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (path) =>
    `text-sm transition-all duration-200 relative ${
      pathname === path ? "text-ink font-medium" : "text-ink-muted hover:text-ink"
    }`;

  const closeMenu = () => setMenuOpen(false);

  const linkClassWithIndicator = (path, label) => (
    <Link to={path} className={`${linkClass(path)} py-2 group`} onClick={closeMenu}>
      {label}
      {pathname === path && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-warm scale-x-100 transition-transform duration-300 hidden md:block" />
      )}
      {pathname !== path && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-warm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 hidden md:block" />
      )}
    </Link>
  );

  const links = (
    <>
      {linkClassWithIndicator("/", t("nav.gallery"))}
      {linkClassWithIndicator("/book", t("nav.book"))}
    </>
  );

  return (
    <nav className={`flex items-center justify-between px-4 md:px-10 py-4 fixed top-0 left-0 right-0 z-20 transition-all duration-500 ${
      isHome && !scrolled ? "bg-transparent" : "bg-paper/90 border-b border-warm/10"
    }`}>
      <Link to="/" className="flex items-center gap-2 shrink-0 group">
        <img src="/logo.png" alt="Fadi Khoudja" className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
        <span className="hidden sm:inline font-[family-name:var(--font-display)] italic text-lg text-warm transition-colors duration-300 group-hover:text-warm-dark">
          Fadi Khoudja
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
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-warm/20 btn bg-transparent"
        >
          <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
          <div className="fixed inset-0 z-30 bg-black/20 animate-fade-in" onClick={closeMenu} />
          <div className="fixed top-[57px] left-0 right-0 z-40 bg-paper border-b border-warm/10 px-4 py-4 flex flex-col gap-2 animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
            {links}
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
