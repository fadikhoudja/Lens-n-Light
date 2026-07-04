import { useState, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useToast } from "./Toast";
import { authHeader } from "../api/auth";
import API_BASE from "../api/config";
import { CATEGORIES_WITH_AUTO } from "../constants/categories";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function PhotoUpload({ onUpload }) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("Auto");
  const inputRef = useRef(null);

  const validateFiles = (fileList) => {
    const arr = Array.from(fileList);
    for (const f of arr) {
      if (!f.type.startsWith("image/")) {
        addToast(`${f.name} is not an image`, "error");
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        addToast(`${f.name} exceeds 20MB limit`, "error");
        return false;
      }
    }
    return true;
  };

  const handleSelect = (e) => {
    if (!validateFiles(e.target.files)) return;
    setFiles(Array.from(e.target.files));
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fileList = Array.from(e.dataTransfer.files);
    const images = fileList.filter((f) => f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE);
    const rejected = fileList.filter((f) => !f.type.startsWith("image/") || f.size > MAX_FILE_SIZE);
    for (const r of rejected) {
      addToast(`${r.name}: ${r.size > MAX_FILE_SIZE ? "exceeds 20MB" : "not an image"}`, "error");
    }
    setFiles(images);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    for (const file of files) {
      fd.append("images", file);
    }
    if (category) fd.append("category", category);

    try {
      const xhr = new XMLHttpRequest();
      await new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed"));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", `${API_BASE}/api/photos`);
        const headers = authHeader();
        for (const [k, v] of Object.entries(headers)) {
          xhr.setRequestHeader(k, v);
        }
        xhr.withCredentials = true;
        xhr.send(fd);
      });

      addToast(`${files.length} photo${files.length > 1 ? "s" : ""} uploaded`, "success");
      setFiles([]);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
      onUpload();
    } catch {
      addToast("Upload failed", "error");
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
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-zinc-300 px-1 text-center leading-tight">
                  {f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name}
                </div>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>{t("admin.uploading")}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold py-2.5 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/10"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  {t("admin.uploading")}
                </span>
              ) : (
                `${t("admin.upload")} ${files.length} file${files.length > 1 ? "s" : ""}`
              )}
            </button>
            <button
              onClick={() => { setFiles([]); setProgress(0); if (inputRef.current) inputRef.current.value = ""; }}
              disabled={uploading}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:text-white hover:border-zinc-500 transition-colors bg-transparent disabled:opacity-40"
            >
              {t("admin.clear")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
