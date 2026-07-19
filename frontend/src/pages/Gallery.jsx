import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getPhotos } from "../api/photos";
import PhotoCard from "../components/PhotoCard";
import Lightbox from "../components/Lightbox";
import GallerySkeleton from "../components/GallerySkeleton";
import { useLanguage } from "../i18n/LanguageContext";
import { useReveal } from "../utils/useReveal";

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
  const gridRef = useRef(null);

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
    if (gridRef.current) {
      gridRef.current.style.opacity = "0";
      gridRef.current.style.transform = "translateY(8px)";
      requestAnimationFrame(() => {
        if (gridRef.current) {
          gridRef.current.style.transition = "opacity 0.3s ease-out, transform 0.3s ease-out";
          gridRef.current.style.opacity = "1";
          gridRef.current.style.transform = "translateY(0)";
        }
      });
    }
  }, [filter]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchPhotos(page + 1, true);
  };

  const categories = ["All", ...new Set(photos.map((p) => p.category))];
  const filtered = filter === "All" ? photos : photos.filter((p) => p.category === filter);

  const heroReveal = useReveal();
  const consentReveal = useReveal();
  const headerReveal = useReveal();

  if (loading) return <GallerySkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-ink-muted">{error}</p>
        <button onClick={() => { setError(""); fetchPhotos(); }} className="text-sm text-warm border border-warm/30 px-4 py-2 rounded-full btn hover:bg-warm/10 bg-transparent">
          {t("gallery.retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <section ref={heroReveal} className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-center">
        <p className="text-ink-muted text-sm mb-4 font-[family-name:var(--font-display)] italic animate-fade-in-up">
          {t("hero.badge")}
        </p>
        <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-display)] leading-[1.1] mb-6 animate-fade-in-up delay-1">
          {t("hero.title1")}
          <span className="block text-warm">{t("hero.title2")}</span>
        </h1>
        <p className="text-ink-muted text-lg max-w-lg mx-auto leading-relaxed animate-fade-in-up delay-2">
          {t("hero.subtitle")}
        </p>
        <div className="flex gap-3 justify-center mt-8 animate-fade-in-up delay-3">
          <button onClick={() => document.querySelector(".photo-grid")?.scrollIntoView({ behavior: "smooth" })} className="bg-warm text-paper font-medium px-8 py-3 rounded-full text-sm btn hover:bg-warm-dark shadow-sm">
            {t("hero.cta")}
          </button>
          <Link to="/book" className="border border-warm/30 text-ink-muted font-medium px-8 py-3 rounded-full text-sm btn hover:border-warm/60 hover:text-ink bg-transparent">
            {t("hero.ctaBook")}
          </Link>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="divider mb-14 reveal" ref={consentReveal}>
            <span>&#9670;</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 reveal" ref={headerReveal}>
            <div>
              <h2 className="text-3xl md:text-4xl font-[family-name:var(--font-display)]">{t("gallery.title")}</h2>
              <p className="text-ink-muted text-sm mt-1">{t("gallery.subtitle")}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm border cursor-pointer btn ${
                    filter === cat
                      ? "bg-warm text-paper border-warm shadow-sm"
                      : "bg-transparent text-ink-muted border-warm/20 hover:text-ink hover:border-warm/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-ink-muted">{t("gallery.empty")}</p>
              <p className="text-ink-muted/60 text-sm mt-1">{t("gallery.emptySub")}</p>
            </div>
          ) : (
            <div ref={gridRef} className="photo-grid columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((photo, i) => (
                <div key={photo._id} onClick={() => setLightboxPhoto(photo)} className="break-inside-avoid">
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
                className="px-8 py-3 rounded-full border border-warm/30 text-ink-muted text-sm btn hover:border-warm/60 hover:text-ink bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-ink-muted/30 border-t-warm rounded-full animate-spin" />
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
