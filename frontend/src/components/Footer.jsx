import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-warm/10 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <Link to="/" className="signature text-lg">Fadi Khoudja</Link>
          <p className="text-xs text-ink-muted/60 mt-1 font-[family-name:var(--font-mono)] tracking-wider uppercase">
            Photography
          </p>
        </div>
        <div className="text-xs text-ink-muted/50 font-[family-name:var(--font-mono)] tracking-wider uppercase">
          &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
