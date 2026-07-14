import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getPhotos } from "../api/photos";
import PhotoCard from "../components/PhotoCard";
import Lightbox from "../components/Lightbox";
import GallerySkeleton from "../components/GallerySkeleton";
import { useLanguage } from "../i18n/LanguageContext";

function Gallery() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const fetchPhotos = useCallback(async (p = 1, append = false) => {
    try {
      const filters = {};
      if (filter !== "All") filters.category = filter;
      const data = await getPhotos(p, 20, filters);
      if (append) {
        setPhotos((prev) => [...prev, ...(data.photos || data)]);
      } else {
        setPhotos(data.photos || data);
      }
      setTotalPages(data.pages || 1);
      setPage(data.page || 1);
    } catch {
      setError(t("gallery.loadError"));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchPhotos(page + 1, true);
  };

  const categories = ["All", ...new Set(photos.map((p) => p.category))];
  const filtered = filter === "All" ? photos : photos.filter((p) => p.category === filter);

  if (loading) return <GallerySkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-zinc-400 text-lg">{error}</p>
        <button onClick={() => { setRetrying(true); setError(""); fetchPhotos(); }} disabled={retrying} className="text-sm text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-500/10 transition-all cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed">
          {retrying ? t("gallery.retrying") : t("gallery.retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center -mt-[73px] px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-900 pointer-events-none" />
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,158,11,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(59,130,242,0.08) 0%, transparent 50%)`
        }} />
        <div className="relative z-10 text-center max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-medium">{t("hero.badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 leading-[0.9]">
            {t("hero.title1")}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">{t("hero.title2")}</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-3 justify-center mt-8">
            <button onClick={() => document.querySelector(".photo-grid")?.scrollIntoView({ behavior: "smooth" })} className="bg-amber-500 text-zinc-900 font-semibold px-8 py-3 sm:px-6 sm:py-2.5 rounded-full text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              {t("hero.cta")}
            </button>
            <Link to="/book" className="border border-zinc-600 text-zinc-300 font-medium px-8 py-3 sm:px-6 sm:py-2.5 rounded-full text-sm hover:border-zinc-400 hover:text-white transition-all">
              {t("hero.ctaBook")}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-zinc-400 text-sm md:text-base">
              All individuals featured in this gallery have consented to their images being posted. Every person shown is aware and has agreed.
            </p>
          </div>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("gallery.title")}</h2>
              <p className="text-zinc-500 mt-1">{t("gallery.subtitle")}</p>
            </div>
            <div className="hidden md:flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm border cursor-pointer transition-all ${
                    filter === cat
                      ? "bg-amber-500 text-zinc-900 border-amber-500 font-medium shadow-lg shadow-amber-500/20"
                      : "bg-transparent text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex md:hidden gap-2 mb-8 overflow-x-auto pb-3 snap-x scroll-smooth hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm border cursor-pointer transition-all ${
                  filter === cat
                    ? "bg-amber-500 text-zinc-900 border-amber-500 font-medium"
                    : "bg-transparent text-zinc-400 border-zinc-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 md:py-24">
              <p className="text-zinc-500 text-lg">{t("gallery.empty")}</p>
              <p className="text-zinc-600 text-sm mt-1">{t("gallery.emptySub")}</p>
            </div>
          ) : (
            <div className="photo-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((photo, i) => (
                <div key={photo._id} onClick={() => setLightboxPhoto(photo)}>
                  <PhotoCard photo={photo} index={i} />
                </div>
              ))}
            </div>
          )}

          {page < totalPages && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full border border-zinc-600 text-zinc-300 text-sm hover:border-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    {t("gallery.loadingMore")}
                  </span>
                ) : (
                  t("gallery.loadMore")
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center cursor-pointer hover:bg-amber-500/30 transition-all animate-fade-up"
        >
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
          </svg>
        </button>
      )}

      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          photos={filtered}
          onClose={(nextPhoto) => setLightboxPhoto(nextPhoto || null)}
        />
      )}
    </div>
  );
}

export default Gallery;
