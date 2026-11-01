import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getBookingById } from '../api';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          const data = await getBookingById(id);
          setBooking(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch booking details');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Booking not found'}</div>
        <Link to="/" className="btn btn-outline-light">Back to Home</Link>
      </div>
    );
  }

  const showtime = booking.showtime || {};
  const movie = showtime.movie || {};
  const showDate = new Date(showtime.dateTime);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card bg-secondary bg-opacity-10 border border-success text-light p-4 text-center shadow-lg">
            <div className="display-4 text-success mb-2">🎉</div>
            <h2 className="fw-bold text-white mb-1">Booking Confirmed!</h2>
            <p className="text-secondary small mb-4">
              Booking Reference: <span className="text-light font-monospace">{booking._id}</span>
            </p>

            <div className="bg-dark bg-opacity-50 p-4 rounded-3 text-start border border-secondary mb-4">
              <h4 className="fw-bold text-danger mb-1">{movie.title || 'Movie'}</h4>
              <p className="text-secondary small mb-3">{movie.genre} &bull; {movie.duration}m</p>

              <div className="row g-2 mb-2">
                <div className="col-6 text-secondary small">Screen:</div>
                <div className="col-6 text-white small fw-bold text-end">{showtime.screen}</div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6 text-secondary small">Date & Time:</div>
                <div className="col-6 text-white small fw-bold text-end">
                  {showDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {showDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="row g-2 mb-2">
                <div className="col-6 text-secondary small">Reserved Seats:</div>
                <div className="col-6 text-end">
                  {booking.seats?.map(seat => (
                    <span key={seat} className="badge bg-danger ms-1">{seat}</span>
                  ))}
                </div>
              </div>
              <div className="row g-2 pt-2 border-top border-secondary">
                <div className="col-6 text-light fw-bold">Total Paid:</div>
                <div className="col-6 text-danger fw-bold text-end fs-5">
                  ${booking.totalPrice?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center">
              <Link to="/my-bookings" className="btn btn-outline-light">
                View My Bookings
              </Link>
              <Link to="/" className="btn btn-danger">
                Browse More Movies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
