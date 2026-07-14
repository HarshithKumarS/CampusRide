import axios from 'axios';

const backendHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const api = axios.create({
  baseURL: `http://${backendHost}:5000/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;