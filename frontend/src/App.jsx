
import { useEffect, useState } from "react";
import {
  Film,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  Clapperboard,
  RefreshCw,
} from "lucide-react";

import Navbar from "./components/Navbar";
import MovieForm from "./components/MovieForm";
import MovieList from "./components/MovieList";
import RewatchPlan from "./components/RewatchPlan";
import CinemaBooking from "./components/CinemaBooking";

import { api } from "./services/api";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMovies() {
    try {
      setError("");
      const data = await api.getMovies();
      setMovies(data);
    } catch (err) {
      setError(err.message || "Unable to load movies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  async function saveMovie(data) {
    setError("");

    try {
      if (editingMovie) {
        await api.updateMovie(editingMovie.id, data);
      } else {
        await api.createMovie(data);
      }

      setShowMovieForm(false);
      setEditingMovie(null);
      await loadMovies();
    } catch (err) {
      setError(err.message || "Unable to save movie.");
      throw err;
    }
  }

  function openAddMovie() {
    setEditingMovie(null);
    setError("");
    setShowMovieForm(true);
  }

  function openEditMovie(movie) {
    setEditingMovie(movie);
    setError("");
    setShowMovieForm(true);
  }

  function closeMovieForm() {
    setShowMovieForm(false);
    setEditingMovie(null);
  }

  async function deleteMovie(id) {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      setError("");
      await api.deleteMovie(id);
      await loadMovies();
    } catch (err) {
      setError(err.message || "Unable to delete movie.");
    }
  }

  async function toggleWatched(movie) {
    try {
      setError("");

      await api.updateMovie(movie.id, {
        watched: !movie.watched,
      });

      await loadMovies();
    } catch (err) {
      setError(err.message || "Unable to update watched status.");
    }
  }

  const totalMovies = movies.length;
  const watchedMovies = movies.filter((movie) => movie.watched).length;
  const unwatchedMovies = totalMovies - watchedMovies;

  const watchedPercentage =
    totalMovies > 0
      ? Math.round((watchedMovies / totalMovies) * 100)
      : 0;

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setError("");
        }}
      />

      <main className="container">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              <Sparkles size={13} />
              YOUR PERSONAL MOVIE COMMAND CENTER
            </p>

            <h1>Welcome to Doomsday Ready</h1>

            <p>
              Organize your movie universe, discover the perfect
              viewing sequence, and manage cinema bookings effortlessly.
            </p>
          </div>
        </header>

        {error && (
          <div className="error">
            {error}
            <button
              className="secondary-btn"
              onClick={() => setError("")}
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "movies" && (
          <>
            <section className="dashboard-grid">
              <div className="dashboard-card">
                <div className="stat-heading">
                  <span>Total Movies</span>
                  <div className="stat-icon purple">
                    <Film size={20} />
                  </div>
                </div>
                <strong>{totalMovies}</strong>
                <small>Your movie collection</small>
              </div>

              <div className="dashboard-card">
                <div className="stat-heading">
                  <span>Watched Movies</span>
                  <div className="stat-icon green">
                    <Eye size={20} />
                  </div>
                </div>
                <strong>{watchedMovies}</strong>
                <small>{watchedPercentage}% of your collection</small>
              </div>

              <div className="dashboard-card">
                <div className="stat-heading">
                  <span>Not Watched</span>
                  <div className="stat-icon orange">
                    <EyeOff size={20} />
                  </div>
                </div>
                <strong>{unwatchedMovies}</strong>
                <small>Movies waiting to be watched</small>
              </div>
            </section>

            <section className="progress-panel">
              <div className="progress-info">
                <div>
                  <h3>Watching Progress</h3>
                  <p>Track your movie collection progress.</p>
                </div>
                <strong>{watchedPercentage}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${watchedPercentage}%` }}
                />
              </div>

              <div className="progress-labels">
                <span>{watchedMovies} watched</span>
                <span>{unwatchedMovies} remaining</span>
              </div>
            </section>

            <section className="collection-toolbar">
              <div>
                <h2>My Movie Collection</h2>
                <p>Manage your movies and their prerequisites.</p>
              </div>

              <button
                className="primary-btn add-movie-btn"
                onClick={openAddMovie}
              >
                <Plus size={18} />
                Add Movie
              </button>
            </section>

            {loading ? (
              <div className="loading-state">
                <RefreshCw className="spin" size={22} />
                <p>Loading your movie collection...</p>
              </div>
            ) : (
              <MovieList
                movies={movies}
                onEdit={openEditMovie}
                onDelete={deleteMovie}
                onToggleWatched={toggleWatched}
              />
            )}
          </>
        )}

        {activeTab === "rewatch" && (
          <section className="tab-content">
            <div className="section-heading">
              <div className="section-icon purple">
                <Clapperboard size={23} />
              </div>
              <div>
                <h2>Rewatch Planner</h2>
                <p>
                  Discover the correct viewing order for your selected movie.
                </p>
              </div>
            </div>

            {loading ? (
              <p>Loading movies...</p>
            ) : (
              <RewatchPlan movies={movies} />
            )}
          </section>
        )}

        {activeTab === "booking" && (
          <section className="tab-content">
            <div className="section-heading">
              <div className="section-icon green">
                <Film size={23} />
              </div>
              <div>
                <h2>Cinema Booking</h2>
                <p>
                  Manage cinemas and calculate the minimum booking bundles.
                </p>
              </div>
            </div>

            <CinemaBooking />
          </section>
        )}
      </main>

      <footer className="footer">
        <div>
          <Film size={17} />
          <span>Doomsday Ready</span>
        </div>
        <p>Full-Stack Application · Built with React & Django</p>
        <span className="footer-copy">
          © {new Date().getFullYear()} Doomsday Ready
        </span>
      </footer>

      {showMovieForm && (
        <MovieForm
          movies={movies}
          editingMovie={editingMovie}
          onSave={saveMovie}
          onCancel={closeMovieForm}
        />
      )}
    </div>
  );
}
