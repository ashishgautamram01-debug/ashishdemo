import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import ShowtimeSeats from './pages/ShowtimeSeats';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column bg-dark text-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<MovieList />} />
              <Route path="/movies/:id" element={<MovieDetail />} />
              <Route path="/showtimes/:id" element={<ShowtimeSeats />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="/bookings/:id/confirmation"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="py-4 border-top border-secondary text-center text-secondary small">
            <div className="container">
              &copy; {new Date().getFullYear()} IMovies Cinema Platform. All rights reserved.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
