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

  return (
    <nav className={`flex items-center justify-between px-6 md:px-12 py-5 z-20 ${
      isHome ? "absolute top-0 left-0 right-0 bg-transparent" : "fixed top-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-lg border-b border-zinc-800"
    }`}>
      <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 group">
        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block group-hover:scale-150 transition-transform" />
        <span className="font-[family-name:var(--font-display)] italic text-amber-400">Lens</span>
        <span className="text-white">&</span>
        <span className="text-white">Light</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className={`text-sm tracking-wide transition-all ${
          pathname === "/" ? "text-white" : "text-zinc-400 hover:text-white"
        }`}>
          {t("nav.gallery")}
        </Link>
        <Link to="/book" className={`text-sm tracking-wide transition-all ${
          pathname === "/book" ? "text-white" : "text-zinc-400 hover:text-white"
        }`}>
          {t("nav.book")}
        </Link>
        {authed ? (
          <>
            <Link to="/admin" className={`text-sm tracking-wide transition-all ${
              pathname === "/admin" ? "text-white" : "text-zinc-400 hover:text-white"
            }`}>
              {t("nav.admin")}
            </Link>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-sm text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer bg-transparent font-normal p-0"
            >
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <Link to="/admin/login" className="text-sm text-zinc-500 hover:text-amber-400 transition-colors">
            {t("nav.adminLogin")}
          </Link>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

export default Navbar;
