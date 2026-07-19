import { useEffect, useCallback, useRef } from "react";
import { imageUrl } from "../utils/imageUrl";

function Lightbox({ photo, photos = [], onClose }) {
  const ref = useRef(null);
  const currentIndex = photos.findIndex((p) => p._id === photo._id);
  const prev = currentIndex > 0 ? photos[currentIndex - 1] : null;
  const next = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null;

  const goPrev = useCallback(() => {
    if (prev) onClose(prev);
  }, [prev, onClose]);

  const goNext = useCallback(() => {
    if (next) onClose(next);
  }, [next, onClose]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={photo.title} className="fixed inset-0 z-50 bg-[#121212] flex items-center justify-center p-4 animate-shutter">
      <button
        onClick={() => onClose()}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer z-10 btn"
      >
        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {prev && (
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer z-10 btn"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {next && (
        <button
          onClick={goNext}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer z-10 btn"
        >
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      <img
        src={imageUrl(photo)}
        alt={photo.title}
        className="max-w-[90vw] max-h-[85vh] object-contain animate-scale-in rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 backdrop-blur-sm px-5 py-2 rounded-full animate-fade-in-up">
        <span className="text-sm text-white/80 font-[family-name:var(--font-display)] italic">{photo.title}</span>
        {photo.category && (
          <span className="stamp !text-white/50 !border-white/30">{photo.category}</span>
        )}
      </div>
    </div>
  );
}

export default Lightbox;
