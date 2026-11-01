import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

// Interceptor to inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication APIs
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// Movie APIs
export const getMovies = async () => {
  const res = await api.get('/movies');
  return res.data;
};

export const getMovieById = async (id) => {
  const res = await api.get(`/movies/${id}`);
  return res.data;
};

export const getMovieShowtimes = async (movieId) => {
  const res = await api.get(`/movies/${movieId}/showtimes`);
  return res.data;
};

// Showtime APIs
export const getShowtimeById = async (showtimeId) => {
  const res = await api.get(`/showtimes/${showtimeId}`);
  return res.data;
};

// Booking APIs
export const createBooking = async (data) => {
  const res = await api.post('/bookings', data);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await api.get('/bookings/me');
  return res.data;
};

export const getBookingById = async (id) => {
  const res = await api.get(`/bookings/${id}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};

export default api;
