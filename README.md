# IMovies – Online Cinema Platform

A fast, lightweight, and modern cinema reservation platform to browse movies, pick showtimes, and reserve seats with real-time availability.

## Tech Stack
- **Frontend**: React.js, React Router v6, Bootstrap 5, Axios, Vite
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.js
- **API Testing**: Postman Collection (`imovies_postman_collection.json`)

---

## Project Structure
```
imovies/
├── server/
│   ├── models/           # User, Movie, Showtime, Booking
│   ├── routes/           # auth, movies, showtimes, bookings
│   ├── middleware/       # JWT auth middleware
│   ├── seed.js           # Database seeder
│   ├── server.js         # Express app entry point
│   └── .env              # Server environment variables
├── client/
│   ├── src/
│   │   ├── components/   # Navbar, ProtectedRoute
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # MovieList, MovieDetail, ShowtimeSeats, etc.
│   │   ├── api.js        # Axios API client
│   │   ├── App.jsx       # Routing & layout
│   │   └── main.jsx      # React entry
│   └── index.html
├── imovies_postman_collection.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 16
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Server Setup
```bash
cd server
npm install
# Seed movies, showtimes, and demo user:
npm run seed
# Start backend server:
npm run dev
```
The server runs on **`http://localhost:5000`**.

> **Demo Credentials:**  
> Email: `user@example.com`  
> Password: `password123`

### 2. Client Setup
In a new terminal:
```bash
cd client
npm install
npm start
```
The client runs on **`http://localhost:3000`**.

---

## API Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account | No |
| `POST` | `/api/auth/login` | Login and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/api/movies` | Fetch all movies | No |
| `GET` | `/api/movies/:id` | Fetch movie details | No |
| `GET` | `/api/movies/:id/showtimes` | Fetch showtimes for a movie | No |
| `GET` | `/api/showtimes/:id` | Fetch showtime & real-time seats | No |
| `POST` | `/api/bookings` | Atomically reserve seats | Yes |
| `GET` | `/api/bookings/me` | Fetch user's booking history | Yes |
| `GET` | `/api/bookings/:id` | Fetch single booking confirmation | Yes |
| `DELETE` | `/api/bookings/:id` | Cancel booking & release seats | Yes |

---

## Postman Collection
Import `imovies_postman_collection.json` into Postman to test all endpoints.
