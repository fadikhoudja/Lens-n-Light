import API_BASE from "./config";
import { authHeader } from "./auth";

const API = `${API_BASE}/api/photos`;

export const getPhotos = async (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
};

export const uploadPhotos = async (files, category) => {
  const fd = new FormData();
  for (const file of files) {
    fd.append("images", file);
  }
  if (category) fd.append("category", category);
  const res = await fetch(API, {
    method: "POST",
    headers: authHeader(),
    body: fd,

  });
  if (!res.ok) {
    const err = new Error("Failed to upload photos");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const updatePhoto = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),

  });
  if (!res.ok) {
    const err = new Error("Failed to update photo");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const deletePhoto = async (id) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeader(),

  });
  if (!res.ok) {
    const err = new Error("Failed to delete photo");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const bulkCategorize = async (ids, category) => {
  const res = await fetch(`${API}/bulk/category`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ ids, category }),

  });
  if (!res.ok) {
    const err = new Error("Failed to update categories");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const bulkDeletePhotos = async (ids) => {
  const res = await fetch(`${API}/bulk/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ ids }),

  });
  if (!res.ok) {
    const err = new Error("Failed to delete photos");
    err.status = res.status;
    throw err;
  }
  return res.json();
};
