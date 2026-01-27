import axios from 'axios';

function inferApiBase() {
  // If you open the frontend from another device (phone) via http://LAN_IP:5173,
  // this will automatically target the same LAN_IP backend at port 8081.
  const h = window.location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1';
  const host = isLocal ? 'localhost' : h;
  return `http://${host}:8081/api`;
}

export const API_BASE = import.meta.env.VITE_API_BASE || inferApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
