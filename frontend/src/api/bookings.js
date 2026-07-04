import API_BASE from "./config";
import { authHeader } from "./auth";

const API = `${API_BASE}/api/bookings`;

export const getBookings = async (page = 1, limit = 50, status) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  const res = await fetch(`${API}?${params}`, {
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = new Error("Failed to fetch bookings");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const getBooking = async (id) => {
  const res = await fetch(`${API}/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch booking");
  return res.json();
};

export const createBooking = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
};

export const deleteBooking = async (id) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = new Error("Failed to delete booking");
    err.status = res.status;
    throw err;
  }
  return res.json();
};

export const updateBooking = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = new Error("Failed to update booking");
    err.status = res.status;
    throw err;
  }
  return res.json();
};
