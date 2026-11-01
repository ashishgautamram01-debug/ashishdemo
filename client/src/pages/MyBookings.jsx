import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setError('');
    setSuccessMsg('');

    try {
      await cancelBooking(bookingId);
      setSuccessMsg('Booking cancelled successfully and seats have been released.');
      // Refresh list
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 text-secondary">Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold fs-2 text-white mb-1">My Bookings</h1>
          <p className="text-secondary mb-0">Manage your cinema tickets and reservation history.</p>
        </div>
        <Link to="/" className="btn btn-outline-danger btn-sm">Explore More Movies</Link>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {bookings.length === 0 ? (
        <div className="text-center py-5 bg-secondary bg-opacity-10 border border-secondary rounded-3">
          <div className="fs-1 mb-2">🎟️</div>
          <h4 className="fw-bold text-white">No Bookings Yet</h4>
          <p className="text-secondary">You haven't booked any cinema tickets yet.</p>
          <Link to="/" className="btn btn-danger">Book a Movie Now</Link>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => {
            const showtime = booking.showtime || {};
            const movie = showtime.movie || {};
            const showDate = new Date(showtime.dateTime);
            const isCancelled = booking.status === 'cancelled';

            return (
              <div className="col-12" key={booking._id}>
                <div className={`card bg-secondary bg-opacity-10 border ${isCancelled ? 'border-secondary opacity-75' : 'border-danger'} text-light shadow-sm p-3`}>
                  <div className="row align-items-center g-3">
                    <div className="col-md-2 d-none d-md-block">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="rounded img-fluid"
                        style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <h5 className="fw-bold text-white mb-1">{movie.title || 'Movie'}</h5>
                      <div className="text-secondary small">{showtime.screen}</div>
                      <div className="text-secondary small">
                        {showDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {showDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="small text-secondary mb-1">Seats:</div>
                      <div className="d-flex flex-wrap gap-1">
                        {booking.seats?.map(s => (
                          <span key={s} className="badge bg-dark border border-secondary">{s}</span>
                        ))}
                      </div>
                      <div className="small text-light fw-bold mt-2">
                        Total: <span className="text-danger">${booking.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="col-md-3 text-md-end d-flex flex-column align-items-md-end gap-2">
                      <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-success'}`}>
                        {isCancelled ? 'Cancelled' : 'Confirmed'}
                      </span>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="btn btn-outline-danger btn-sm"
                        >
                          {cancellingId === booking._id ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            'Cancel Booking'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
