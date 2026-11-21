
import { Pencil, Trash2, Lock, CheckCircle2, Film } from "lucide-react";

export default function MovieList({
  movies,
  onEdit,
  onDelete,
  onToggleWatched,
}) {
  function getPrerequisites(movie) {
    const ids = (movie.prerequisites || []).map(Number);
    return movies.filter((item) => ids.includes(Number(item.id)));
  }

  function canMarkWatched(movie) {
    const prerequisites = getPrerequisites(movie);
    return prerequisites.every((item) => item.watched);
  }

  return (
    <div className="movie-list">
      <div className="movie-list-heading">
        <div>
          <h2>Movie Collection</h2>
          <p>Complete prerequisite movies to unlock the next movie.</p>
        </div>
        <Film size={23} />
      </div>

      {movies.length === 0 ? (
        <p className="empty">No movies added yet.</p>
      ) : (
        movies.map((movie) => {
          const prerequisites = getPrerequisites(movie);
          const unlocked = canMarkWatched(movie);
          const locked = !movie.watched && !unlocked;

          return (
            <div className="movie-card" key={movie.id}>
              <div className="movie-info">
                <h3>{movie.title}</h3>

                <p>
                  {movie.release_year} · {movie.runtime} minutes
                </p>

                <span className={movie.watched ? "status watched" : "status"}>
                  {movie.watched ? "Watched" : "Not watched"}
                </span>

                {prerequisites.length > 0 && (
                  <div className="movie-prerequisites">
                    <strong>Prerequisites:</strong>

                    {prerequisites.map((prerequisite) => (
                      <div
                        className="prerequisite-status"
                        key={prerequisite.id}
                      >
                        {prerequisite.watched ? (
                          <CheckCircle2 size={14} color="#159568" />
                        ) : (
                          <Lock size={14} color="#d97706" />
                        )}

                        <span>{prerequisite.title}</span>

                        <small>
                          {prerequisite.watched ? "Completed" : "Pending"}
                        </small>
                      </div>
                    ))}
                  </div>
                )}

                {locked && (
                  <p className="locked-message">
                    <Lock size={13} />
                    Watch all prerequisite movies first.
                  </p>
                )}
              </div>

              <div className="movie-actions">
                <label
                  className={`watch-label ${locked ? "watch-disabled" : ""}`}
                  title={
                    locked
                      ? "Complete all prerequisites first"
                      : "Change watched status"
                  }
                >
                  <input
                    type="checkbox"
                    checked={movie.watched}
                    disabled={locked}
                    onChange={() => onToggleWatched(movie)}
                  />
                  Watched
                </label>

                <button
                  className="icon-btn"
                  onClick={() => onEdit(movie)}
                  title="Edit movie"
                >
                  <Pencil size={17} />
                </button>

                <button
                  className="icon-btn delete"
                  onClick={() => onDelete(movie.id)}
                  title="Delete movie"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
