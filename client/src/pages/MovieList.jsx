import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../api';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load movies.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 text-secondary">Loading cinema showtimes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold fs-2 text-white mb-1">Now Showing</h1>
          <p className="text-secondary mb-0">Select a movie to pick your seats and showtimes.</p>
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <h4>No movies currently showing</h4>
          <p>Please check back soon or run the backend database seed script.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie) => (
            <div className="col" key={movie._id}>
              <div className="card h-100 bg-secondary bg-opacity-10 border border-secondary text-light shadow-sm overflow-hidden d-flex flex-column">
                <div style={{ height: '340px', overflow: 'hidden' }}>
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                    }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-danger">{movie.genre}</span>
                    <span className="badge bg-dark border border-secondary">{movie.duration}m</span>
                  </div>
                  <h5 className="card-title fw-bold text-truncate">{movie.title}</h5>
                  <p className="card-text text-secondary small flex-grow-1" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {movie.description}
                  </p>
                  <Link
                    to={`/movies/${movie._id}`}
                    className="btn btn-outline-danger w-100 mt-3 fw-semibold"
                  >
                    View Showtimes & Seats
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
