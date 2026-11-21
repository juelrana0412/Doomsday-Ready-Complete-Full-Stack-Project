
import { Pencil, Trash2 } from "lucide-react";

export default function MovieList({
  movies,
  onEdit,
  onDelete,
  onToggleWatched,
}) {
  return (
    <div className="movie-list">
      <h2>Movie Collection</h2>

      {movies.length === 0 ? (
        <p className="empty">No movies added yet.</p>
      ) : (
        movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>
                {movie.release_year} · {movie.runtime} minutes
              </p>

              <span className={movie.watched ? "status watched" : "status"}>
                {movie.watched ? "Watched" : "Not watched"}
              </span>
            </div>

            <div className="movie-actions">
              <label className="watch-label">
                <input
                  type="checkbox"
                  checked={movie.watched}
                  onChange={() => onToggleWatched(movie)}
                />
                Watched
              </label>

              <button
                className="icon-btn"
                onClick={() => onEdit(movie)}
                title="Edit"
              >
                <Pencil size={17} />
              </button>

              <button
                className="icon-btn delete"
                onClick={() => onDelete(movie.id)}
                title="Delete"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
