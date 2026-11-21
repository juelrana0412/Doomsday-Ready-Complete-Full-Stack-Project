
import { useState } from "react";
import { api } from "../services/api";

export default function RewatchPlan({ movies }) {
  const [movieId, setMovieId] = useState("");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    if (!movieId) return;

    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const result = await api.getRewatchOrder(movieId);
      setPlan(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h2>Generate Rewatch Plan</h2>
      <p>Select a movie to see which prerequisite movies you need to watch first.</p>

      <select
        value={movieId}
        onChange={(event) => setMovieId(event.target.value)}
      >
        <option value="">Select a target movie</option>
        {movies.map((movie) => (
          <option key={movie.id} value={movie.id}>
            {movie.title}
          </option>
        ))}
      </select>

      <button
        className="primary-btn"
        onClick={generatePlan}
        disabled={!movieId || loading}
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {error && <p className="error">{error}</p>}

      {plan && (
        <div className="plan-result">
          <h3>Rewatch Plan for {plan.target}</h3>

          <div className="stats">
            <div className="stat-card">
              <strong>{plan.total_movies}</strong>
              <span>Total Movies</span>
            </div>

            <div className="stat-card">
              <strong>{plan.watched_count}</strong>
              <span>Already Watched</span>
            </div>

            <div className="stat-card">
              <strong>{plan.unwatched_count}</strong>
              <span>To Watch</span>
            </div>

            <div className="stat-card">
              <strong>{plan.remaining_runtime} min</strong>
              <span>Remaining Runtime</span>
            </div>
          </div>

          <h3>Watch in This Order</h3>

          {plan.movies.length === 0 ? (
            <p>No prerequisite movies. You can watch the target movie directly.</p>
          ) : (
            <ol>
              {plan.movies.map((movie) => (
                <li key={movie.id}>
                  <strong>{movie.title}</strong>
                  <span> — {movie.runtime} minutes</span>
                  {movie.watched && (
                    <span className="status watched"> Watched</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
