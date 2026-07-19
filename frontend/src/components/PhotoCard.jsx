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
      className="group relative overflow-hidden rounded-sm bg-warm/5 animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {imgError ? (
        <div className="w-full aspect-[4/3] bg-warm/5 flex items-center justify-center animate-fade-in">
          <span className="text-ink-muted/40 text-sm">{photo.title}</span>
        </div>
      ) : (
        <div className={`overflow-hidden ${!loaded ? "bg-warm/5" : ""}`}>
          <img
            ref={imgRef}
            src={imageUrl(photo)}
            alt={photo.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-auto transition-all duration-700 ease-out group-hover:scale-[1.03] ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      )}
      <div className="p-3 pb-4">
        <h3 className="text-sm font-medium text-ink leading-tight">{photo.title}</h3>
        {photo.category && (
          <span className="text-xs text-ink-muted/60">{photo.category}</span>
        )}
      </div>
    </div>
  );
}

export default PhotoCard;
