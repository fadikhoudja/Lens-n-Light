function PhotoCard({ photo, index = 0 }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-lg shadow-black/30 animate-fade-up"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
      <img
        src={`/uploads/${photo.image}`}
        alt={photo.title}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-4 group-hover:translate-y-0 z-20 flex flex-col justify-end p-6">
        <h3 className="text-white font-semibold text-lg tracking-tight">{photo.title}</h3>
        {photo.category && (
          <span className="text-amber-400 text-xs uppercase tracking-[0.15em] mt-1 font-medium">{photo.category}</span>
        )}
      </div>
      <div className="absolute top-3 end-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-10 h-10 rounded-full bg-amber-400/20 backdrop-blur-md flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default PhotoCard;
