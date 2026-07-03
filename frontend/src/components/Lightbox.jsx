import { useEffect, useCallback } from "react";

function Lightbox({ photo, photos = [], onClose }) {
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
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <button
        onClick={() => onClose()}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer z-10"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {prev && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {next && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer z-10"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      <img
        src={`/uploads/${photo.image}`}
        alt={photo.title}
        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-center">
        <p className="text-white font-medium text-sm">{photo.title}</p>
        {photo.category && (
          <span className="text-amber-400 text-xs uppercase tracking-wider ml-2">{photo.category}</span>
        )}
      </div>
    </div>
  );
}

export default Lightbox;
