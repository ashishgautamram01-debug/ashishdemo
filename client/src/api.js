import axios from 'axios';

// Determine if we should run in live demo mode (e.g. GitHub Pages static hosting)
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('vercel.app') ||
  import.meta.env.VITE_DEMO_MODE === 'true'
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isGitHubPages ? '' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ---------------------------------------------------------------------------
// High-Fidelity In-Browser State Engine (for GitHub Pages / Live Demo Hosting)
// ---------------------------------------------------------------------------
const generateInitialSeats = () => {
  const seats = [];
  ['A', 'B', 'C', 'D'].forEach(row => {
    for (let c = 1; c <= 6; c++) {
      seats.push({
        seatNumber: `${row}${c}`,
        isBooked: false
      });
    }
  });
  // Pre-book a couple of seats for realism
  seats[2].isBooked = true; // A3
  seats[7].isBooked = true; // B2
  return seats;
};

const getDemoStore = () => {
  let store = localStorage.getItem('imovies_demo_store');
  if (store) {
    return JSON.parse(store);
  }

  const now = new Date();
  const movies = [
    {
      _id: 'mov_1',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      genre: 'Sci-Fi / Action',
      duration: 148,
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80'
    },
    {
      _id: 'mov_2',
      title: 'Interstellar',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers.',
      genre: 'Sci-Fi / Adventure',
      duration: 169,
      poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
    },
    {
      _id: 'mov_3',
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
      genre: 'Action / Crime / Drama',
      duration: 152,
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
    },
    {
      _id: 'mov_4',
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
      genre: 'Sci-Fi / Adventure',
      duration: 166,
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const screens = ['IMAX Theater', 'Screen 1 (Dolby Atmos)', 'Screen 2'];
  const showtimes = [];

  movies.forEach((m, idx) => {
    [
      { hours: 2, screen: screens[0], price: 15.00 },
      { hours: 24, screen: screens[1], price: 12.50 },
      { hours: 30, screen: screens[2], price: 12.00 }
    ].forEach((cfg, sIdx) => {
      showtimes.push({
        _id: `st_${idx + 1}_${sIdx + 1}`,
        movie: m._id,
        dateTime: new Date(now.getTime() + cfg.hours * 60 * 60 * 1000).toISOString(),
        screen: cfg.screen,
        price: cfg.price,
        seats: generateInitialSeats()
      });
    });
  });

  const demoUser = {
    id: 'usr_demo',
    name: 'Demo Cinephile',
    email: 'user@example.com',
    password: 'password123'
  };

  const initialStore = {
    movies,
    showtimes,
    users: [demoUser],
    bookings: []
  };

  localStorage.setItem('imovies_demo_store', JSON.stringify(initialStore));
  return initialStore;
};

const saveDemoStore = (store) => {
  localStorage.setItem('imovies_demo_store', JSON.stringify(store));
};

// ---------------------------------------------------------------------------
// Authentication APIs
// ---------------------------------------------------------------------------
export const registerUser = async (data) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const existing = store.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw { response: { data: { message: 'Email already registered' } } };
    }
    const newUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password
    };
    store.users.push(newUser);
    saveDemoStore(store);
    const token = `mock_jwt_token_${newUser.id}`;
    return { token, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  }
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const user = store.users.find(
      u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password
    );
    if (!user) {
      throw { response: { data: { message: 'Invalid email or password' } } };
    }
    const token = `mock_jwt_token_${user.id}`;
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getMe = async () => {
  if (isGitHubPages || !API_BASE_URL) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw { response: { data: { message: 'Unauthorized' } } };
    return JSON.parse(storedUser);
  }
  const res = await api.get('/auth/me');
  return res.data;
};

// ---------------------------------------------------------------------------
// Movie APIs
// ---------------------------------------------------------------------------
export const getMovies = async () => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    return store.movies;
  }
  try {
    const res = await api.get('/movies');
    return res.data;
  } catch (err) {
    if (!err.response) return getDemoStore().movies;
    throw err;
  }
};

export const getMovieById = async (id) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const movie = store.movies.find(m => m._id === id);
    if (!movie) throw { response: { data: { message: 'Movie not found' } } };
    return movie;
  }
  try {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  } catch (err) {
    if (!err.response) {
      const movie = getDemoStore().movies.find(m => m._id === id);
      if (movie) return movie;
    }
    throw err;
  }
};

export const getMovieShowtimes = async (movieId) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    return store.showtimes.filter(s => s.movie === movieId);
  }
  try {
    const res = await api.get(`/movies/${movieId}/showtimes`);
    return res.data;
  } catch (err) {
    if (!err.response) return getDemoStore().showtimes.filter(s => s.movie === movieId);
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Showtime APIs
// ---------------------------------------------------------------------------
export const getShowtimeById = async (showtimeId) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const st = store.showtimes.find(s => s._id === showtimeId);
    if (!st) throw { response: { data: { message: 'Showtime not found' } } };
    const movie = store.movies.find(m => m._id === st.movie);
    return { ...st, movie };
  }
  try {
    const res = await api.get(`/showtimes/${showtimeId}`);
    return res.data;
  } catch (err) {
    if (!err.response) {
      const store = getDemoStore();
      const st = store.showtimes.find(s => s._id === showtimeId);
      if (st) {
        const movie = store.movies.find(m => m._id === st.movie);
        return { ...st, movie };
      }
    }
    throw err;
  }
};

// ---------------------------------------------------------------------------
// Booking APIs
// ---------------------------------------------------------------------------
export const createBooking = async (data) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const stIndex = store.showtimes.findIndex(s => s._id === data.showtimeId);
    if (stIndex === -1) throw { response: { data: { message: 'Showtime not found' } } };

    const showtime = store.showtimes[stIndex];
    // Check if seats already booked
    const conflict = showtime.seats.some(s => data.seats.includes(s.seatNumber) && s.isBooked);
    if (conflict) {
      throw { response: { data: { message: 'One or more selected seats have already been booked' } } };
    }

    // Mark seats booked atomically
    showtime.seats.forEach(s => {
      if (data.seats.includes(s.seatNumber)) {
        s.isBooked = true;
      }
    });

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const movie = store.movies.find(m => m._id === showtime.movie);

    const newBooking = {
      _id: `bk_${Date.now()}`,
      user: storedUser.id || 'usr_demo',
      showtime: {
        ...showtime,
        movie
      },
      seats: data.seats,
      totalPrice: (showtime.price || 12) * data.seats.length,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    store.bookings.unshift(newBooking);
    saveDemoStore(store);
    return newBooking;
  }

  const res = await api.post('/bookings', data);
  return res.data;
};

export const getMyBookings = async () => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return store.bookings.filter(b => b.user === (storedUser.id || 'usr_demo'));
  }
  const res = await api.get('/bookings/me');
  return res.data;
};

export const getBookingById = async (id) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const b = store.bookings.find(bk => bk._id === id);
    if (!b) throw { response: { data: { message: 'Booking not found' } } };
    return b;
  }
  const res = await api.get(`/bookings/${id}`);
  return res.data;
};

export const cancelBooking = async (id) => {
  if (isGitHubPages || !API_BASE_URL) {
    const store = getDemoStore();
    const booking = store.bookings.find(b => b._id === id);
    if (!booking) throw { response: { data: { message: 'Booking not found' } } };

    booking.status = 'cancelled';
    const showtime = store.showtimes.find(s => s._id === (booking.showtime._id || booking.showtime));
    if (showtime) {
      showtime.seats.forEach(s => {
        if (booking.seats.includes(s.seatNumber)) {
          s.isBooked = false;
        }
      });
    }

    saveDemoStore(store);
    return { message: 'Booking cancelled successfully', booking };
  }
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};

export default api;
