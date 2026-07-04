import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPhotos, deletePhoto, updatePhoto, bulkCategorize, bulkDeletePhotos } from "../api/photos";
import { getBookings, deleteBooking, updateBooking } from "../api/bookings";
import { isAuthenticated, logout } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import { useToast } from "../components/Toast";
import { CATEGORIES, CATEGORIES_WITH_AUTO } from "../constants/categories";
import PhotoUpload from "../components/PhotoUpload";
import ConfirmModal from "../components/ConfirmModal";
import { imageUrl } from "../utils/imageUrl";

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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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

  const fetchPhotos = useCallback(async (page) => {
    try {
      const p = page || photoPage;
      const filters = {};
      if (search) filters.search = search;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await getPhotos(p, 50, filters);
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
  }, [photoPage, search, categoryFilter, addToast]);

  const fetchBookings = useCallback(async (page) => {
    try {
      const p = page || bookingPage;
      const data = await getBookings(p, 50, statusFilter || undefined);
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
  }, [bookingPage, statusFilter, addToast]);

  useEffect(() => { fetchPhotos(); }, [search, categoryFilter]);
  useEffect(() => { fetchBookings(); }, [statusFilter]);

  const handleEditStart = (photo) => {
    setEditingId(photo._id);
    setEditTitle(photo.title);
    setEditCategory(photo.category);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    try {
      await updatePhoto(editingId, { title: editTitle, category: editCategory });
      addToast(t("admin.photoUpdated"), "success");
      setEditingId(null);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.updatePhotoFailed"), "error");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
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
      addToast(t("admin.photosCategorized").replace("{count}", selected.length), "success");
      setSelected([]);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.categorizeFailed"), "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    setConfirmDelete({ type: "bulk", message: t("admin.confirmBulkDelete").replace("{count}", selected.length) });
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeletePhotos(selected);
      addToast(t("admin.bulkDeleted").replace("{count}", selected.length), "success");
      setSelected([]);
      setConfirmDelete(null);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.bulkDeleteFailed"), "error");
      setConfirmDelete(null);
    }
  };

  const handleDeletePhoto = (id) => {
    setConfirmDelete({ type: "photo", id, message: t("admin.confirmDeletePhoto") });
  };

  const confirmDeletePhoto = async () => {
    try {
      await deletePhoto(confirmDelete.id);
      addToast(t("admin.photoDeleted"), "success");
      setConfirmDelete(null);
      fetchPhotos();
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.deletePhotoFailed"), "error");
      setConfirmDelete(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    setConfirmDelete({ type: "booking", id, message: t("admin.confirmBulkDelete").replace("{count}", "1") });
  };

  const confirmDeleteBooking = async () => {
    try {
      await deleteBooking(confirmDelete.id);
      addToast("Booking deleted", "success");
      setConfirmDelete(null);
      fetchBookings();
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to delete booking", "error");
      setConfirmDelete(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBooking(id, { status });
      addToast(`Booking ${status}`, "success");
      fetchBookings();
      if (selectedBooking?._id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    } catch (err) {
      if (!checkAuth(err)) addToast("Failed to update status", "error");
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Phone", "Date", "Message", "Status", "Created"];
    const rows = bookings.map((b) =>
      [b.name, b.phone, b.date, `"${(b.message || "").replace(/"/g, '""')}"`, b.status, b.createdAt].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder={t("admin.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder-zinc-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="">{t("admin.allCategories")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 px-4 py-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 rounded-xl shadow-sm shadow-amber-500/5">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{selected.length}</span>
                <span className="text-zinc-500">{t("admin.selected")}</span>
              </div>
              <div className="h-5 w-px bg-zinc-700/50 hidden sm:block" />
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="text-xs bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                {CATEGORIES_WITH_AUTO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={handleBulkCategory} className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-500/25 hover:border-amber-500/40 transition-all font-medium min-h-[44px]">
                {t("admin.categorize")}
              </button>
              <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500/20 transition-all font-medium min-h-[44px]">
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
                  : editingId === p._id
                  ? "bg-zinc-700/50 border border-amber-500/30"
                  : "bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 hover:border-zinc-600/50"
              }`} style={{ animationDelay: `${i * 0.05}s` }}>
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => toggleSelect(p._id)}
                  className="admin-check"
                />
                <img src={imageUrl(p)} alt={p.title} loading="lazy" className="w-12 h-12 object-cover rounded-lg shrink-0 ring-1 ring-white/5" />
                {editingId === p._id ? (
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="text-xs bg-zinc-900/80 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={handleEditSave} className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 px-3 py-2 rounded-lg cursor-pointer hover:bg-amber-500/25 transition-all font-medium min-h-[44px]">
                      {t("admin.save")}
                    </button>
                    <button onClick={handleEditCancel} className="text-xs bg-zinc-700/50 text-zinc-400 border border-zinc-600/50 px-3 py-2 rounded-lg cursor-pointer hover:text-white transition-all min-h-[44px]">
                      {t("admin.cancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-zinc-200">{p.title}</p>
                    <span className={`inline-block text-[10px] uppercase tracking-wider font-medium mt-0.5 ${
                      p.category === "Uncategorized" ? "text-zinc-600" : "text-amber-400/70"
                    }`}>{p.category}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEditStart(p)} className="md:opacity-0 md:group-hover:opacity-100 bg-zinc-700/50 border border-zinc-600/50 text-zinc-400 text-xs px-3 py-2 rounded-lg cursor-pointer hover:text-white hover:border-zinc-500 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                    {t("admin.edit")}
                  </button>
                  <button onClick={() => handleDeletePhoto(p._id)} className="md:opacity-0 md:group-hover:opacity-100 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg cursor-pointer hover:bg-red-500/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
            ))}
            {photos.length === 0 && <p className="text-center py-12 text-zinc-500">{t("admin.noPhotos")}</p>}
          </div>
          {photoPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-zinc-500 shrink-0 me-2">{photoTotal} total</span>
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                <button
                  disabled={photoPage <= 1}
                  onClick={() => fetchPhotos(photoPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  {t("admin.prev")}
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
                  {t("admin.next")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center justify-between">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="">{t("admin.allStatuses")}</option>
              <option value="pending">{t("admin.pending")}</option>
              <option value="confirmed">{t("admin.confirmed")}</option>
              <option value="completed">{t("admin.completed")}</option>
              <option value="cancelled">{t("admin.cancelled")}</option>
            </select>
            {bookings.length > 0 && (
              <button onClick={exportCSV} className="text-xs text-zinc-400 border border-zinc-700 px-3 py-2 rounded-xl cursor-pointer hover:text-white hover:border-zinc-500 transition-all bg-transparent flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t("admin.exportCSV")}
              </button>
            )}
          </div>
          {bookings.length === 0 && <p className="text-center py-12 text-zinc-500">{t("admin.noBookings")}</p>}
          {bookings.map((b, i) => (
            <div
              key={b._id}
              onClick={() => setSelectedBooking(b)}
              className={`bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl px-5 py-4 flex items-center gap-4 animate-fade-up cursor-pointer hover:border-zinc-600 transition-all ${
                b.status === "pending" ? "border-l-2 border-l-amber-500" : ""
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1 text-sm leading-relaxed min-w-0 overflow-hidden">
                <strong className="truncate block">{b.name}</strong> <span className="text-zinc-500 text-xs">— {b.phone}</span>
                <br /><span className="text-zinc-400 text-xs inline-block truncate w-full">{b.date}{b.message ? ` · ${b.message.length > 40 ? b.message.slice(0, 40) + "…" : b.message}` : ""}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-md shrink-0 ${
                b.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                b.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                b.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                "bg-zinc-500/10 text-zinc-400"
              }`}>{b.status}</span>
            </div>
          ))}
          {bookingPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-zinc-500 shrink-0 me-2">{bookingTotal} total</span>
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                <button
                  disabled={bookingPage <= 1}
                  onClick={() => fetchBookings(bookingPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 disabled:opacity-30 hover:text-white hover:border-zinc-500 transition-all cursor-pointer bg-transparent disabled:cursor-not-allowed"
                >
                  {t("admin.prev")}
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
                  {t("admin.next")}
                </button>
              </div>
            </div>
          )}

          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={() => setSelectedBooking(null)}>
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{t("admin.bookingDetail")}</h3>
                  <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div><span className="text-zinc-500">{t("booking.name")}:</span> <span className="text-white">{selectedBooking.name}</span></div>
                  <div><span className="text-zinc-500">{t("booking.phone")}:</span> <span className="text-white">{selectedBooking.phone}</span></div>
                  <div><span className="text-zinc-500">{t("booking.date")}:</span> <span className="text-white">{selectedBooking.date}</span></div>
                  <div><span className="text-zinc-500">{t("booking.message")}:</span> <span className="text-white">{selectedBooking.message || "—"}</span></div>
                  <div>
                    <span className="text-zinc-500">{t("admin.status")}:</span>
                    <select
                      value={selectedBooking.status}
                      onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                      className="ml-2 text-xs bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                      <option value="pending">{t("admin.pending")}</option>
                      <option value="confirmed">{t("admin.confirmed")}</option>
                      <option value="completed">{t("admin.completed")}</option>
                      <option value="cancelled">{t("admin.cancelled")}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setSelectedBooking(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:text-white hover:border-zinc-500 transition-all bg-transparent">
                    {t("admin.cancel")}
                  </button>
                  <button onClick={() => {
                    handleDeleteBooking(selectedBooking._id);
                    setSelectedBooking(null);
                  }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm cursor-pointer hover:bg-red-500/20 transition-all">
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.message}
          onConfirm={confirmDelete.type === "bulk" ? confirmBulkDelete : confirmDelete.type === "photo" ? confirmDeletePhoto : confirmDeleteBooking}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

export default Admin;
