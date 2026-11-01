import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getShowtimeById, createBooking } from '../api';
import { useAuth } from '../context/AuthContext';

const ShowtimeSeats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alertWarning, setAlertWarning] = useState('');

  const selectedSeatsRef = useRef(selectedSeats);
  selectedSeatsRef.current = selectedSeats;

  const fetchShowtimeData = async (isInitial = false) => {
    try {
      const data = await getShowtimeById(id);
      setShowtime(data);

      // Check if any previously selected seat got booked by another user during polling
      if (!isInitial) {
        const bookedSeatNumbers = new Set(
          data.seats.filter(s => s.isBooked).map(s => s.seatNumber)
        );
        const conflictSeats = selectedSeatsRef.current.filter(s => bookedSeatNumbers.has(s));
        if (conflictSeats.length > 0) {
          setSelectedSeats(prev => prev.filter(s => !bookedSeatNumbers.has(s)));
          setAlertWarning(`Notice: Seat(s) ${conflictSeats.join(', ')} were just reserved by another guest.`);
        }
      }
    } catch (err) {
      if (isInitial) {
        setError(err.response?.data?.message || 'Error loading showtime details.');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimeData(true);

    // E4 Task 12: Real-time seat availability polling every 3 seconds
    const pollInterval = setInterval(() => {
      fetchShowtimeData(false);
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [id]);

  const toggleSeat = (seatNumber, isBooked) => {
    if (isBooked || submitting) return;
    setAlertWarning('');
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/showtimes/${id}` } } });
      return;
    }

    setSubmitting(true);
    setError('');
    setAlertWarning('');

    try {
      const booking = await createBooking({
        showtimeId: id,
        seats: selectedSeats
      });
      navigate(`/bookings/${booking._id}/confirmation`, { state: { booking } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking. One of the seats may have been taken.');
      // Refresh seats immediately
      fetchShowtimeData(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 text-secondary">Loading seat map...</p>
      </div>
    );
  }

  if (error && !showtime) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error}</div>
        <div className="text-center">
          <Link to="/" className="btn btn-outline-light">Back to Home</Link>
        </div>
      </div>
    );
  }

  const movie = showtime?.movie || {};
  const showDate = new Date(showtime?.dateTime);
  const totalPrice = ((showtime?.price || 12) * selectedSeats.length).toFixed(2);

  // Group seats by row (row is first char of seatNumber, e.g., 'A' in 'A1')
  const rows = {};
  showtime?.seats?.forEach(seat => {
    const rowKey = seat.seatNumber.charAt(0);
    if (!rows[rowKey]) rows[rowKey] = [];
    rows[rowKey].push(seat);
  });

  return (
    <div className="container py-4">
      <Link to={movie._id ? `/movies/${movie._id}` : '/'} className="btn btn-sm btn-outline-secondary mb-3">
        &larr; Back to Showtimes
      </Link>

      <div className="row g-4">
        {/* Left Column: Seating Layout */}
        <div className="col-lg-8">
          <div className="card bg-secondary bg-opacity-10 border border-secondary text-light p-4 shadow-sm text-center">
            {/* Screen indicator */}
            <div className="mb-4">
              <div
                className="w-75 mx-auto bg-light bg-opacity-25 rounded-pill mb-2 shadow"
                style={{ height: '8px', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
              ></div>
              <span className="small text-secondary text-uppercase tracking-wider">Cinema Screen</span>
            </div>

            {alertWarning && (
              <div className="alert alert-warning py-2 small">{alertWarning}</div>
            )}
            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            {/* Seat Grid */}
            <div className="d-flex flex-column gap-3 my-4 align-items-center">
              {Object.keys(rows).sort().map(rowKey => (
                <div key={rowKey} className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-secondary me-2" style={{ width: '20px' }}>{rowKey}</span>
                  <div className="d-flex gap-2">
                    {rows[rowKey].map(seat => {
                      const isSelected = selectedSeats.includes(seat.seatNumber);
                      let btnClass = 'btn-outline-light';
                      let cursorStyle = 'pointer';

                      if (seat.isBooked) {
                        btnClass = 'btn-secondary text-dark disabled opacity-25';
                        cursorStyle = 'not-allowed';
                      } else if (isSelected) {
                        btnClass = 'btn-danger shadow';
                      }

                      return (
                        <button
                          key={seat.seatNumber}
                          type="button"
                          className={`btn ${btnClass} btn-sm fw-semibold`}
                          style={{
                            width: '42px',
                            height: '42px',
                            cursor: cursorStyle,
                            transition: 'all 0.15s ease'
                          }}
                          disabled={seat.isBooked}
                          onClick={() => toggleSeat(seat.seatNumber, seat.isBooked)}
                          title={`${seat.seatNumber} ${seat.isBooked ? '(Booked)' : isSelected ? '(Selected)' : '(Available)'}`}
                        >
                          {seat.seatNumber.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="d-flex justify-content-center gap-4 pt-3 border-top border-secondary small text-secondary">
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block rounded border border-light" style={{ width: '16px', height: '16px' }}></span>
                <span>Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block rounded bg-danger" style={{ width: '16px', height: '16px' }}></span>
                <span className="text-white">Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block rounded bg-secondary opacity-25" style={{ width: '16px', height: '16px' }}></span>
                <span>Booked</span>
              </div>
            </div>

            <div className="mt-3 text-secondary small fst-italic">
              * Live polling is active: seat availability updates automatically every 3 seconds.
            </div>
          </div>
        </div>

        {/* Right Column: Reservation Details & Checkout */}
        <div className="col-lg-4">
          <div className="card bg-secondary bg-opacity-10 border border-secondary text-light p-4 shadow-sm">
            <h4 className="fw-bold mb-3">Booking Summary</h4>

            <div className="mb-3">
              <h5 className="text-danger fw-bold mb-1">{movie.title || 'Movie'}</h5>
              <div className="text-secondary small">{showtime?.screen}</div>
              <div className="text-secondary small">
                {showDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {showDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <hr className="border-secondary" />

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Selected Seats:</span>
                <span className="fw-bold text-white">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Ticket Price:</span>
                <span className="text-white">${showtime?.price?.toFixed(2)} each</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Quantity:</span>
                <span className="text-white">{selectedSeats.length}</span>
              </div>
            </div>

            <hr className="border-secondary" />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 fw-bold">Total:</span>
              <span className="fs-4 fw-bold text-danger">${totalPrice}</span>
            </div>

            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0 || submitting}
              className="btn btn-danger w-100 py-2 fw-bold"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Processing Reservation...
                </>
              ) : isAuthenticated ? (
                `Confirm Booking (${selectedSeats.length} Seats)`
              ) : (
                'Sign In to Reserve'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeSeats;
