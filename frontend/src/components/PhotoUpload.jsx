import { useState, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { useToast } from "./Toast";
import { authHeader } from "../api/auth";
import API_BASE from "../api/config";
import { CATEGORIES_WITH_AUTO } from "../constants/categories";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function PhotoUpload({ onUpload }) {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("Auto");
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const arr = Array.from(e.target.files);
    const images = arr.filter((f) => f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE);
    const rejected = arr.filter((f) => !f.type.startsWith("image/") || f.size > MAX_FILE_SIZE);
    for (const r of rejected) {
      addToast(`${r.name}: ${r.size > MAX_FILE_SIZE ? "exceeds 50MB" : "not an image"}`, "error");
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

      addToast(t(files.length === 1 ? "admin.photoUploaded" : "admin.photosUploaded").replace("{count}", files.length), "success");
      setFiles([]);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
      onUpload();
    } catch {
      addToast(t("admin.uploadFailed"), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-warm/10 p-6 mb-6">
      <h2 className="text-base font-[family-name:var(--font-display)] mb-4">{t("admin.uploadTitle")}</h2>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-warm/20 hover:border-warm/50 p-8 text-center cursor-pointer transition-all duration-300"
      >
        <p className="text-ink-muted text-sm">{t("admin.dropText")}</p>
        <p className="text-ink-muted/50 text-xs mt-1">{t("admin.dropHint")}</p>
        <input ref={inputRef} type="file" multiple accept="image/*" onChange={handleSelect} className="hidden" />
      </div>

      {files.length > 0 && (
        <div className="mt-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink-muted">{t(files.length === 1 ? "admin.fileSelected" : "admin.filesSelected").replace("{count}", files.length)}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs border border-warm/20 bg-transparent px-2 py-1 text-ink sel"
            >
              {CATEGORIES_WITH_AUTO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {files.map((f, i) => (
              <div key={i} className="relative w-16 h-16 overflow-hidden border border-warm/10">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
                <span>{t("admin.uploading")}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-warm/10 overflow-hidden">
                <div
                  className="h-full bg-warm transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-warm text-paper font-medium py-2.5 btn hover:bg-warm-dark disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-paper/50 border-t-transparent rounded-full animate-spin" />
                  {t("admin.uploading")}
                </span>
              ) : (
                t(files.length === 1 ? "admin.uploadFile" : "admin.uploadFiles").replace("{count}", files.length)
              )}
            </button>
            <button
              onClick={() => { setFiles([]); setProgress(0); if (inputRef.current) inputRef.current.value = ""; }}
              disabled={uploading}
              className="px-4 py-2.5 border border-warm/20 text-ink-muted text-sm btn hover:text-ink hover:border-warm/40 bg-transparent disabled:opacity-40"
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
