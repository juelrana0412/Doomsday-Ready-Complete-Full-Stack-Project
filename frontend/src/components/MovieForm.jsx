
import { useEffect, useState } from "react";
import { X, Film, CalendarDays, Clock, CheckCircle2 } from "lucide-react";

const emptyMovie = {
  title: "",
  release_year: new Date().getFullYear(),
  runtime: "",
  watched: false,
  prerequisites: [],
};

export default function MovieForm({
  movies,
  editingMovie,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(emptyMovie);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingMovie) {
      setForm({
        title: editingMovie.title || "",
        release_year: editingMovie.release_year || "",
        runtime: editingMovie.runtime || "",
        watched: editingMovie.watched || false,
        prerequisites: (editingMovie.prerequisites || []).map(Number),
      });
    } else {
      setForm(emptyMovie);
    }

    setError("");
  }, [editingMovie]);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function togglePrerequisite(id) {
    setForm((previous) => {
      const selected = previous.prerequisites.includes(id);

      return {
        ...previous,
        prerequisites: selected
          ? previous.prerequisites.filter((item) => item !== id)
          : [...previous.prerequisites, id],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const data = {
      title: form.title.trim(),
      release_year: Number(form.release_year),
      runtime: Number(form.runtime),
      watched: form.watched,
      prerequisites: form.prerequisites,
    };

    if (!data.title) {
      setError("Please enter a movie title.");
      return;
    }

    if (!Number.isInteger(data.runtime) || data.runtime < 1 || data.runtime > 300) {
      setError("Runtime must be between 1 and 300 minutes.");
      return;
    }

    if (!Number.isInteger(data.release_year) || data.release_year < 1) {
      setError("Please enter a valid release year.");
      return;
    }

    try {
      setSaving(true);
      await onSave(data);
      setForm(emptyMovie);
    } catch (err) {
      setError(err.message || "Unable to save movie.");
    } finally {
      setSaving(false);
    }
  }

  const availableMovies = movies.filter(
    (movie) => movie.id !== editingMovie?.id
  );

  return (
    <div className="movie-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <div className="movie-modal">
        <div className="movie-modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <Film size={23} />
            </div>

            <div>
              <h2>{editingMovie ? "Edit Movie" : "Add New Movie"}</h2>
              <p>
                {editingMovie
                  ? "Update movie details and prerequisites."
                  : "Add a movie to your collection and set its prerequisites."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            aria-label="Close form"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="movie-modal-body">
            <div className="form-section-title">
              <span>01</span>
              Movie Information
            </div>

            <div className="form-field">
              <label htmlFor="movie-title">Movie Title *</label>
              <input
                id="movie-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. The Avengers"
                maxLength={255}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="release-year">
                  <CalendarDays size={15} /> Release Year *
                </label>
                <input
                  id="release-year"
                  type="number"
                  name="release_year"
                  min="1"
                  value={form.release_year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="runtime">
                  <Clock size={15} /> Runtime (minutes) *
                </label>
                <input
                  id="runtime"
                  type="number"
                  name="runtime"
                  min="1"
                  max="300"
                  value={form.runtime}
                  onChange={handleChange}
                  placeholder="e.g. 143"
                  required
                />
              </div>
            </div>

            <div className="form-section-title prerequisite-heading">
              <span>02</span>
              Set Prerequisites
            </div>

            <p className="prerequisite-description">
              Select the movies that must be watched before this movie.
              You can select multiple movies.
            </p>

            <div className="prerequisite-list">
              {availableMovies.length === 0 ? (
                <div className="no-prerequisites">
                  <Film size={23} />
                  <strong>No other movies available</strong>
                  <span>
                    Add another movie first to set it as a prerequisite.
                  </span>
                </div>
              ) : (
                availableMovies.map((movie) => {
                  const selected = form.prerequisites.includes(movie.id);

                  return (
                    <label
                      key={movie.id}
                      className={`prerequisite-option ${selected ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => togglePrerequisite(movie.id)}
                      />

                      <div className="prerequisite-movie-icon">
                        <Film size={18} />
                      </div>

                      <div className="prerequisite-movie-info">
                        <strong>{movie.title}</strong>
                        <span>
                          {movie.release_year} · {movie.runtime} minutes
                        </span>
                      </div>

                      {selected && (
                        <CheckCircle2
                          size={19}
                          className="prerequisite-check"
                        />
                      )}
                    </label>
                  );
                })
              )}
            </div>

            <div className="selected-count">
              {form.prerequisites.length} prerequisite
              {form.prerequisites.length !== 1 ? "s" : ""} selected
            </div>

            <label className="watched-option">
              <input
                type="checkbox"
                name="watched"
                checked={form.watched}
                onChange={handleChange}
              />
              <div>
                <strong>Already watched</strong>
                <span>Mark this movie as watched.</span>
              </div>
            </label>

            {error && <div className="error">{error}</div>}
          </div>

          <div className="movie-modal-footer">
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingMovie
                  ? "Save Changes"
                  : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
