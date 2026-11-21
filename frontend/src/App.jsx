
import { useEffect, useState } from "react";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMovies() {
    try {
      setError("");
      const data = await api.getMovies();
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  async function saveMovie(data) {
    if (editingMovie) {
      await api.updateMovie(editingMovie.id, data);
      setEditingMovie(null);
    } else {
      await api.createMovie(data);
    }

    await loadMovies();
  }

  async function deleteMovie(id) {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    try {
      await api.deleteMovie(id);
      setEditingMovie(null);
      await loadMovies();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleWatched(movie) {
    try {
      await api.updateMovie(movie.id, {
        watched: !movie.watched,
      });

      await loadMovies();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container">
        <header className="page-header">
          <p className="eyebrow">MOVIE & CINEMA MANAGEMENT</p>
          <h1>Doomsday Ready</h1>
          <p>
            Manage your movie collection, plan your watch order,
            and calculate cinema bookings.
          </p>
        </header>

        {error && <div className="error">{error}</div>}

        {activeTab === "movies" && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <span>Total Movies</span>
                <strong>{movies.length}</strong>
              </div>

              <div className="dashboard-card">
                <span>Watched</span>
                <strong>
                  {movies.filter((movie) => movie.watched).length}
                </strong>
              </div>

              <div className="dashboard-card">
                <span>Not Watched</span>
                <strong>
                  {movies.filter((movie) => !movie.watched).length}
                </strong>
              </div>
            </div>

            {loading ? (
              <p>Loading movies...</p>
            ) : (
              <div className="content-grid">
                <MovieForm
                  movies={movies}
                  editingMovie={editingMovie}
                  onSave={saveMovie}
                  onCancel={() => setEditingMovie(null)}
                />

                <MovieList
                  movies={movies}
                  onEdit={setEditingMovie}
                  onDelete={deleteMovie}
                  onToggleWatched={toggleWatched}
                />
              </div>
            )}
          </>
        )}

        {activeTab === "rewatch" && (
          <RewatchPlan movies={movies} />
        )}

        {activeTab === "booking" && (
          <CinemaBooking />
        )}
      </main>

      <footer className="footer">
        Doomsday Ready — Full-Stack Application
      </footer>
    </div>
  );
}
