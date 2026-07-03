import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPhotos, deletePhoto, bulkCategorize, bulkDeletePhotos } from "../api/photos";
import { getBookings, deleteBooking } from "../api/bookings";
import { isAuthenticated, logout } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import { useToast } from "../components/Toast";
import { CATEGORIES } from "../constants/categories";
import PhotoUpload from "../components/PhotoUpload";

function Admin() {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bulkCategory, setBulkCategory] = useState("Portrait");
  const [photoPage, setPhotoPage] = useState(1);
  const [photoTotal, setPhotoTotal] = useState(0);
  const [photoPages, setPhotoPages] = useState(0);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [bookingPages, setBookingPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate("/admin/login");
  }, [navigate]);

  const checkAuth = (err) => {
    if (err?.status === 401 || err?.status === 403) {
      logout();
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  const fetchPhotos = async (page) => {
    try {
      const p = page || photoPage;
      const data = await getPhotos(p);
      if (data.photos) {
        setPhotos(data.photos);
        setPhotoTotal(data.total);
        setPhotoPages(data.pages);
        setPhotoPage(data.page);
      } else {
        setPhotos(data);
      }
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to load photos", "error");
    }
  };
  const fetchBookings = async (page) => {
    try {
      const p = page || bookingPage;
      const data = await getBookings(p);
      if (data.bookings) {
        setBookings(data.bookings);
        setBookingTotal(data.total);
        setBookingPages(data.pages);
        setBookingPage(data.page);
      } else {
        setBookings(data);
      }
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to load bookings", "error");
    }
  };

  useEffect(() => { fetchPhotos(); fetchBookings(); }, []);

  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await deletePhoto(id);
      addToast("Photo deleted", "success");
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to delete photo", "error");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === photos.length) {
      setSelected([]);
    } else {
      setSelected(photos.map((p) => p._id));
    }
  };

  const handleBulkCategory = async () => {
    if (selected.length === 0) return;
    try {
      await bulkCategorize(selected, bulkCategory);
      addToast(`${selected.length} photos categorized`, "success");
      setSelected([]);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to update categories", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0 || !window.confirm(`Delete ${selected.length} photos?`)) return;
    try {
      await bulkDeletePhotos(selected);
      addToast(`${selected.length} photos deleted`, "success");
      setSelected([]);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to delete photos", "error");
    }
  };
  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await deleteBooking(id);
      addToast("Booking deleted", "success");
      fetchBookings();
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to delete booking", "error");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t("admin.subtitle")}</p>
        </div>
        <button onClick={() => { logout(); navigate("/admin/login"); }} className="text-sm text-zinc-400 border border-zinc-700 px-4 py-2 rounded-xl cursor-pointer hover:text-white hover:border-zinc-500 transition-all bg-transparent">
          {t("admin.logout")}
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-6 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all ${
            activeTab === "photos" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-white bg-transparent"
          }`}
        >
          {t("admin.tabPhotos")}
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-6 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all ${
            activeTab === "bookings" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-white bg-transparent"
          }`}
        >
          {t("admin.tabBookings")}
        </button>
      </div>

      {activeTab === "photos" && (
        <div>
          <PhotoUpload onUpload={fetchPhotos} />

          {selected.length > 0 && (
            <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 rounded-xl shadow-sm shadow-amber-500/5">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{selected.length}</span>
                <span className="text-zinc-500">{t("admin.selected")}</span>
              </div>
              <div className="h-5 w-px bg-zinc-700/50" />
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="text-xs bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={handleBulkCategory} className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-amber-500/25 hover:border-amber-500/40 transition-all font-medium">
                {t("admin.categorize")}
              </button>
              <div className="flex-1" />
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-500/20 transition-all font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t("admin.deleteAll")}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {photos.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/20 border border-zinc-700/30 rounded-xl">
                <input
                  type="checkbox"
                  checked={selected.length === photos.length && photos.length > 0}
                  onChange={toggleSelectAll}
                  className="admin-check"
                />
                <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{t("admin.selectAll")}</span>
                {selected.length > 0 && (
                  <span className="text-xs text-amber-400/80 ml-auto">{selected.length} / {photos.length}</span>
                )}
              </div>
            )}
            {photos.map((p, i) => (
              <div key={p._id} className={`group rounded-xl px-4 py-3.5 flex items-center gap-4 animate-fade-up transition-all duration-200 ${
                selected.includes(p._id)
                  ? "bg-amber-500/5 border border-amber-500/20 shadow-sm shadow-amber-500/5"
                  : "bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50"
              }`} style={{ animationDelay: `${i * 0.05}s` }}>
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => toggleSelect(p._id)}
                  className="admin-check"
                />
                <img src={`/uploads/${p.image}`} alt={p.title} loading="lazy" className="w-12 h-12 object-cover rounded-lg shrink-0 ring-1 ring-white/5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-zinc-200">{p.title}</p>
                  <span className={`inline-block text-[10px] uppercase tracking-wider font-medium mt-0.5 ${
                    p.category === "Uncategorized" ? "text-zinc-600" : "text-amber-400/70"
                  }`}>{p.category}</span>
                </div>
                <button onClick={() => handleDeletePhoto(p._id)} className="md:opacity-0 md:group-hover:opacity-100 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-500/20 transition-all shrink-0">
                  {t("admin.delete")}
                </button>
              </div>
            ))}
            {photos.length === 0 && <p className="text-center py-12 text-zinc-500">{t("admin.noPhotos")}</p>}
          </div>
          {photoPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-zinc-500">{photoTotal} total</span>
              <div className="flex gap-1">
                <button
                  disabled={photoPage <= 1}
                  onClick={() => fetchPhotos(photoPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: photoPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchPhotos(p)}
                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      p === photoPage
                        ? "bg-amber-500 text-zinc-900 border-amber-500 font-medium"
                        : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={photoPage >= photoPages}
                  onClick={() => fetchPhotos(photoPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="flex flex-col gap-2">
          {bookings.length === 0 && <p className="text-center py-12 text-zinc-500">{t("admin.noBookings")}</p>}
          {bookings.map((b, i) => (
            <div key={b._id} className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl px-5 py-4 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1 text-sm leading-relaxed">
                <strong>{b.name}</strong> <span className="text-zinc-500">— {b.phone}</span>
                <br /><span className="text-zinc-400 text-xs">{b.date}{b.message ? ` · ${b.message}` : ""}</span>
              </div>
              <button onClick={() => handleDeleteBooking(b._id)} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-red-500/20 transition-all">
                {t("admin.delete")}
              </button>
            </div>
          ))}
          {bookingPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-zinc-500">{bookingTotal} total</span>
              <div className="flex gap-1">
                <button
                  disabled={bookingPage <= 1}
                  onClick={() => fetchBookings(bookingPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                {Array.from({ length: bookingPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchBookings(p)}
                    className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      p === bookingPage
                        ? "bg-amber-500 text-zinc-900 border-amber-500 font-medium"
                        : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={bookingPage >= bookingPages}
                  onClick={() => fetchBookings(bookingPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;
