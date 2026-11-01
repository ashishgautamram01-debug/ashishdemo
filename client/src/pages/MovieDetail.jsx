import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById, getMovieShowtimes } from '../api';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieData, showtimesData] = await Promise.all([
          getMovieById(id),
          getMovieShowtimes(id)
        ]);
        setMovie(movieData);
        setShowtimes(showtimesData);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error || 'Movie not found'}</div>
        <div className="text-center">
          <Link to="/" className="btn btn-outline-light">Back to Movies</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/" className="btn btn-sm btn-outline-secondary mb-4">&larr; Back to Movies</Link>

      <div className="row g-4 align-items-start">
        {/* Poster */}
        <div className="col-md-4 col-lg-3">
          <div className="card bg-secondary bg-opacity-10 border border-secondary shadow overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-100 h-auto"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
              }}
            />
          </div>
        </div>

        {/* Details & Showtimes */}
        <div className="col-md-8 col-lg-9">
          <div className="d-flex align-items-center gap-3 mb-2">
            <span className="badge bg-danger fs-6">{movie.genre}</span>
            <span className="badge bg-dark border border-secondary fs-6">{movie.duration} Minutes</span>
          </div>

          <h1 className="fw-bold display-6 text-white mb-3">{movie.title}</h1>
          <p className="text-light lead fs-6 mb-4" style={{ lineHeight: '1.7' }}>
            {movie.description}
          </p>

          <hr className="border-secondary my-4" />

          {/* Showtimes Section */}
          <h3 className="fw-bold fs-4 text-white mb-3">Available Showtimes</h3>
          {showtimes.length === 0 ? (
            <div className="alert alert-warning">
              No showtimes scheduled for this movie currently.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
              {showtimes.map((st) => {
                const dateObj = new Date(st.dateTime);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const availableSeatsCount = st.seats?.filter(s => !s.isBooked).length || 0;

                return (
                  <div className="col" key={st._id}>
                    <div className="card bg-secondary bg-opacity-10 border border-secondary text-light h-100 p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="text-danger fw-bold small">{st.screen}</div>
                        <h5 className="fw-bold my-1">{formattedTime}</h5>
                        <div className="text-secondary small mb-2">{formattedDate}</div>
                        <div className="small">
                          <span className="badge bg-success bg-opacity-25 text-success border border-success">
                            {availableSeatsCount} seats available
                          </span>
                          <span className="text-light ms-2 fw-semibold">${st.price?.toFixed(2)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/showtimes/${st._id}`}
                        className="btn btn-danger btn-sm mt-3 w-100 fw-semibold"
                      >
                        Select Seats
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
