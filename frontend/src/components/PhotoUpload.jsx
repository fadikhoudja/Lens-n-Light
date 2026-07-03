import { useState, useRef } from "react";
import { uploadPhotos } from "../api/photos";
import { useLanguage } from "../i18n/LanguageContext";
import { CATEGORIES_WITH_AUTO } from "../constants/categories";

function PhotoUpload({ onUpload }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Auto");
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    setFiles(Array.from(e.target.files));
    setDone(false);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
    setDone(false);
    setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      await uploadPhotos(files, category);
      setDone(true);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      onUpload();
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-6 rounded-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">{t("admin.uploadTitle")}</h2>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-600 hover:border-amber-500/50 rounded-xl p-10 text-center cursor-pointer transition-colors"
      >
        <svg className="w-10 h-10 text-zinc-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="text-zinc-400 text-sm mb-1">{t("admin.dropText")}</p>
        <p className="text-zinc-600 text-xs">{t("admin.dropHint")}</p>
        <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleSelect} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">{files.length} file{files.length > 1 ? "s" : ""} selected</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {CATEGORIES_WITH_AUTO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((f, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold py-2.5 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
              )}
            </button>
            <button
              onClick={() => { setFiles([]); if (inputRef.current) inputRef.current.value = ""; }}
              disabled={uploading}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:text-white hover:border-zinc-500 transition-colors bg-transparent disabled:opacity-40"
            >
              {t("admin.clear")}
            </button>
          </div>
        </div>
      )}

      {done && (
        <p className="text-emerald-400 text-sm mt-3 text-center">{t("admin.uploadSuccess")}</p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
}

export default PhotoUpload;
