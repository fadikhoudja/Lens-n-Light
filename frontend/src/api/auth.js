import API_BASE from "./config";

const API = `${API_BASE}/api/auth`;

export const login = async (username, password) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  localStorage.setItem("photography_admin_token", data.token);
  return data.token;
};

export const logout = async () => {
  try {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
  } catch {
  }
  localStorage.removeItem("photography_admin_token");
};

export const getToken = () => {
  return localStorage.getItem("photography_admin_token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
