import { authHeader } from "./auth";

const API = "/api/bookings";

export const getBookings = async (page = 1, limit = 50) => {
  const res = await fetch(`${API}?page=${page}&limit=${limit}`, {
    headers: authHeader(),
    credentials: "include",
  });
  if (!res.ok) {
    const err = new Error("Failed to fetch bookings");
    err.status = res.status;
    throw err;
  }
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
    credentials: "include",
  });
  if (!res.ok) {
    const err = new Error("Failed to delete booking");
    err.status = res.status;
    throw err;
  }
  return res.json();
};
