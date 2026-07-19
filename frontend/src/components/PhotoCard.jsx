import { useState, useRef, useEffect } from "react";
import { imageUrl } from "../utils/imageUrl";

function PhotoCard({ photo, index = 0 }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <div
      className="polaroid animate-slide-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {imgError ? (
        <div className="w-full aspect-[4/3] bg-warm/5 flex items-center justify-center animate-fade-in">
          <span className="text-ink-muted/40 text-sm font-[family-name:var(--font-display)] italic">{photo.title}</span>
        </div>
      ) : (
        <div className="relative overflow-hidden bg-warm/5">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-warm/5">
              <div className="w-5 h-5 border border-warm/30 border-t-warm rounded-full animate-spin" />
            </div>
          )}
          <img
            ref={imgRef}
            src={imageUrl(photo)}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-auto transition-all duration-700 ease-out ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      )}
      <div className="px-1 pt-2.5 flex items-start justify-between gap-2">
        <h3 className="text-xs text-ink font-[family-name:var(--font-display)] italic leading-tight">{photo.title}</h3>
        {photo.category && (
          <span className="stamp shrink-0 mt-0.5">{photo.category}</span>
        )}
      </div>
    </div>
  );
}

export default PhotoCard;
