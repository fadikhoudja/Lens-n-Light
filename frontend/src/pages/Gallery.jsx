import { useState, useEffect } from "react";
import { getPhotos } from "../api/photos";
import PhotoCard from "../components/PhotoCard";
import Lightbox from "../components/Lightbox";
import GallerySkeleton from "../components/GallerySkeleton";
import { useLanguage } from "../i18n/LanguageContext";

function Gallery() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const fetchPhotos = async () => {
    try {
      const data = await getPhotos();
      setPhotos(data.photos || data);
    } catch {
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

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
        <button onClick={() => { setLoading(true); setError(""); fetchPhotos(); }} className="text-sm text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-500/10 transition-all cursor-pointer bg-transparent">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center -mt-[73px] px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-900" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(245,158,11,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(59,130,242,0.08) 0%, transparent 50%)`
        }} />
        <div className="relative z-10 text-center max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-zinc-700/50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-medium">{t("hero.badge")}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 leading-[0.9]">
            {t("hero.title1")}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">{t("hero.title2")}</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
          <div className="flex gap-3 justify-center mt-8">
            <button onClick={() => document.querySelector(".photo-grid")?.scrollIntoView({ behavior: "smooth" })} className="bg-amber-500 text-zinc-900 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              {t("hero.cta")}
            </button>
            <a href="/book" className="border border-zinc-600 text-zinc-300 font-medium px-6 py-2.5 rounded-full text-sm hover:border-zinc-400 hover:text-white transition-all">
              {t("hero.ctaBook")}
            </a>
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

          <div className="flex md:hidden gap-2 mb-8 overflow-x-auto pb-2 snap-x">
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
            <div className="text-center py-24">
              <p className="text-zinc-500 text-lg">{t("gallery.empty")}</p>
              <p className="text-zinc-600 text-sm mt-1">{t("gallery.emptySub")}</p>
            </div>
          ) : (
            <div className="photo-grid columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
              {filtered.map((photo, i) => (
                <div key={photo._id} onClick={() => setLightboxPhoto(photo)} className="break-inside-avoid mb-6">
                  <PhotoCard photo={photo} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </div>
  );
}

export default Gallery;
