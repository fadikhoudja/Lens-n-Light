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
      if (!checkAuth(err)) addToast(t("admin.loadPhotosFailed"), "error");
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
      if (!checkAuth(err)) addToast(t("admin.loadBookingsFailed"), "error");
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
      addToast(t("admin.bookingDeleted"), "success");
      setConfirmDelete(null);
      fetchBookings();
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.deleteBookingFailed"), "error");
      setConfirmDelete(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBooking(id, { status });
      addToast(t("admin.bookingStatusUpdated").replace("{status}", status), "success");
      fetchBookings();
      if (selectedBooking?._id === id) {
        setSelectedBooking({ ...selectedBooking, status });
      }
    } catch (err) {
      if (!checkAuth(err)) addToast(t("admin.statusUpdateFailed"), "error");
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
          <h1 className="text-2xl font-[family-name:var(--font-display)]">{t("admin.title")}</h1>
          <p className="text-ink-muted text-sm mt-0.5">{t("admin.subtitle")}</p>
        </div>
        <button onClick={() => { logout(); navigate("/admin/login"); }} className="text-sm text-ink-muted border border-warm/20 px-4 py-2 btn hover:text-ink hover:border-warm/40 bg-transparent">
          {t("admin.logout")}
        </button>
      </div>

      <div className="divider mb-8"><span>&#9670;</span></div>

      <div className="flex gap-1 mb-8 border-b border-warm/10">
        <button
          onClick={() => setActiveTab("photos")}
          className={`px-5 py-2 cursor-pointer text-sm transition-all duration-200 ${
            activeTab === "photos" ? "text-ink border-b-2 border-warm" : "text-ink-muted hover:text-ink border-b-2 border-transparent"
          }`}
        >
          {t("admin.tabPhotos")}
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-2 cursor-pointer text-sm transition-all duration-200 ${
            activeTab === "bookings" ? "text-ink border-b-2 border-warm" : "text-ink-muted hover:text-ink border-b-2 border-transparent"
          }`}
        >
          {t("admin.tabBookings")}
        </button>
      </div>

      {activeTab === "photos" && (
        <div>
          <PhotoUpload onUpload={fetchPhotos} />

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              placeholder={t("admin.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-warm/20 bg-transparent px-4 py-2.5 text-sm inp placeholder:text-ink-muted/40"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-warm/20 bg-transparent px-3 py-2.5 text-ink sel"
            >
              <option value="">{t("admin.allCategories")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 px-4 py-3 bg-warm/5 border border-warm/10">
              <span className="text-sm text-ink-muted">{selected.length} {t("admin.selected")}</span>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="text-xs border border-warm/20 bg-transparent px-2 py-1.5 text-ink sel"
              >
                {CATEGORIES_WITH_AUTO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={handleBulkCategory} className="text-xs bg-warm/10 text-warm-dark border border-warm/20 px-3 py-2 btn">
                {t("admin.categorize")}
              </button>
              <button onClick={handleBulkDelete} className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-2 btn">
                {t("admin.deleteAll")}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {photos.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 border border-warm/10">
                <input
                  type="checkbox"
                  checked={selected.length === photos.length && photos.length > 0}
                  onChange={toggleSelectAll}
                  className="ck"
                />
                <span className="text-xs text-ink-muted uppercase tracking-wider">{t("admin.selectAll")}</span>
              </div>
            )}
            {photos.map((p, i) => (
              <div key={p._id} className={`px-4 py-3 flex items-center gap-4 border transition-colors ${
                selected.includes(p._id)
                  ? "bg-warm/5 border-warm/20"
                  : editingId === p._id
                  ? "border-warm/30 bg-warm/5"
                  : "border-warm/10 hover:border-warm/20"
              }`}>
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => toggleSelect(p._id)}
                  className="ck"
                />
                <img src={imageUrl(p)} alt={p.title} loading="lazy" className="w-12 h-12 object-cover shrink-0 rounded-sm" />
                {editingId === p._id ? (
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 border border-warm/20 bg-transparent px-2.5 py-1.5 text-sm text-ink inp"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="text-xs border border-warm/20 bg-transparent px-2 py-1.5 text-ink sel"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={handleEditSave} className="text-xs bg-warm/10 text-warm-dark border border-warm/20 px-3 py-2 btn">
                      {t("admin.save")}
                    </button>
                    <button onClick={handleEditCancel} className="text-xs border border-warm/20 text-ink-muted px-3 py-2 btn hover:text-ink bg-transparent">
                      {t("admin.cancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{p.title}</p>
                    <span className="text-xs text-ink-muted/60">{p.category}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEditStart(p)} className="border border-warm/20 text-ink-muted text-xs px-3 py-2 btn hover:text-ink hover:border-warm/40 bg-transparent">
                    {t("admin.edit")}
                  </button>
                  <button onClick={() => handleDeletePhoto(p._id)} className="border border-red-200 text-red-500 text-xs px-3 py-2 btn hover:bg-red-50 bg-transparent">
                    {t("admin.delete")}
                  </button>
                </div>
              </div>
            ))}
            {photos.length === 0 && <p className="text-center py-12 text-ink-muted">{t("admin.noPhotos")}</p>}
          </div>
          {photoPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-ink-muted">{photoTotal} total</span>
              <div className="flex gap-1">
                <button
                  disabled={photoPage <= 1}
                  onClick={() => fetchPhotos(photoPage - 1)}
                  className="px-3 py-1.5 border border-warm/20 text-ink-muted disabled:opacity-30 btn hover:text-ink hover:border-warm/40 bg-transparent disabled:cursor-not-allowed"
                >
                  {t("admin.prev")}
                </button>
                {Array.from({ length: photoPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchPhotos(p)}
                    className={`px-3 py-1.5 border text-xs btn ${
                      p === photoPage
                        ? "bg-warm text-paper border-warm"
                        : "border-warm/20 text-ink-muted hover:text-ink hover:border-warm/40 bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={photoPage >= photoPages}
                  onClick={() => fetchPhotos(photoPage + 1)}
                  className="px-3 py-1.5 border border-warm/20 text-ink-muted disabled:opacity-30 btn hover:text-ink hover:border-warm/40 bg-transparent disabled:cursor-not-allowed"
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
              className="text-sm border border-warm/20 bg-transparent px-3 py-2.5 text-ink sel"
            >
              <option value="">{t("admin.allStatuses")}</option>
              <option value="pending">{t("admin.pending")}</option>
              <option value="confirmed">{t("admin.confirmed")}</option>
              <option value="completed">{t("admin.completed")}</option>
              <option value="cancelled">{t("admin.cancelled")}</option>
            </select>
            {bookings.length > 0 && (
              <button onClick={exportCSV} className="text-xs text-ink-muted border border-warm/20 px-3 py-2 btn hover:text-ink hover:border-warm/40 bg-transparent">
                {t("admin.exportCSV")}
              </button>
            )}
          </div>
          {bookings.length === 0 && <p className="text-center py-12 text-ink-muted">{t("admin.noBookings")}</p>}
          {bookings.map((b, i) => (
            <div
              key={b._id}
              onClick={() => setSelectedBooking(b)}
              className={`border px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-warm/20 transition-colors ${
                b.status === "pending" ? "border-l-2 border-l-warm border-warm/10" : "border-warm/10"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-warm/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-warm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="flex-1 text-sm min-w-0 overflow-hidden">
                <strong className="truncate block">{b.name}</strong>
                <span className="text-ink-muted text-xs"> — {b.phone}</span>
                <br /><span className="text-ink-muted/60 text-xs">{b.date}{b.message ? ` · ${b.message.length > 40 ? b.message.slice(0, 40) + "…" : b.message}` : ""}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-1 shrink-0 ${
                b.status === "pending" ? "bg-warm/10 text-warm-dark" :
                b.status === "confirmed" ? "bg-emerald-50 text-emerald-600" :
                b.status === "completed" ? "bg-blue-50 text-blue-600" :
                "bg-zinc-50 text-zinc-500"
              }`}>{b.status}</span>
            </div>
          ))}
          {bookingPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-ink-muted">{bookingTotal} total</span>
              <div className="flex gap-1">
                <button
                  disabled={bookingPage <= 1}
                  onClick={() => fetchBookings(bookingPage - 1)}
                  className="px-3 py-1.5 border border-warm/20 text-ink-muted disabled:opacity-30 btn hover:text-ink hover:border-warm/40 bg-transparent disabled:cursor-not-allowed"
                >
                  {t("admin.prev")}
                </button>
                {Array.from({ length: bookingPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchBookings(p)}
                    className={`px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
                      p === bookingPage
                        ? "bg-warm text-paper border-warm"
                        : "border-warm/20 text-ink-muted hover:text-ink hover:border-warm/40 bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={bookingPage >= bookingPages}
                  onClick={() => fetchBookings(bookingPage + 1)}
                  className="px-3 py-1.5 border border-warm/20 text-ink-muted disabled:opacity-30 btn hover:text-ink hover:border-warm/40 bg-transparent disabled:cursor-not-allowed"
                >
                  {t("admin.next")}
                </button>
              </div>
            </div>
          )}

          {selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 animate-fade-in" onClick={() => setSelectedBooking(null)}>
              <div className="bg-paper border border-warm/10 p-6 max-w-lg w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-[family-name:var(--font-display)]">{t("admin.bookingDetail")}</h3>
                  <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-full hover:bg-warm/10 flex items-center justify-center cursor-pointer">
                    <svg className="w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div><span className="text-ink-muted">{t("booking.name")}:</span> <span className="text-ink">{selectedBooking.name}</span></div>
                  <div><span className="text-ink-muted">{t("booking.phone")}:</span> <span className="text-ink">{selectedBooking.phone}</span></div>
                  <div><span className="text-ink-muted">{t("booking.date")}:</span> <span className="text-ink">{selectedBooking.date}</span></div>
                  <div><span className="text-ink-muted">{t("booking.message")}:</span> <span className="text-ink">{selectedBooking.message || "—"}</span></div>
                  <div>
                    <span className="text-ink-muted">{t("admin.status")}:</span>
                    <select
                      value={selectedBooking.status}
                      onChange={(e) => handleStatusChange(selectedBooking._id, e.target.value)}
                      className="ml-2 text-xs border border-warm/20 bg-transparent px-2.5 py-1.5 text-ink sel"
                    >
                      <option value="pending">{t("admin.pending")}</option>
                      <option value="confirmed">{t("admin.confirmed")}</option>
                      <option value="completed">{t("admin.completed")}</option>
                      <option value="cancelled">{t("admin.cancelled")}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button onClick={() => setSelectedBooking(null)} className="flex-1 px-4 py-2.5 border border-warm/20 text-ink-muted text-sm btn hover:text-ink hover:border-warm/40 bg-transparent">
                    {t("admin.cancel")}
                  </button>
                  <button onClick={() => {
                    handleDeleteBooking(selectedBooking._id);
                    setSelectedBooking(null);
                  }} className="flex-1 px-4 py-2.5 border border-red-200 text-red-500 text-sm btn hover:bg-red-50 bg-transparent">
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
