
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function CinemaBooking() {
  const [cinemas, setCinemas] = useState([]);
  const [name, setName] = useState("");
  const [bundleSizes, setBundleSizes] = useState("2, 4, 6, 8");
  const [cinemaId, setCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState(10);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState("");

  async function loadCinemas() {
    try {
      const data = await api.getCinemas();
      setCinemas(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCinemas();
  }, []);

  async function createCinema(event) {
    event.preventDefault();
    setError("");

    const sizes = bundleSizes
      .split(",")
      .map((item) => Number(item.trim()));

    if (
      sizes.some((size) => !Number.isInteger(size) || size < 1 || size > 500) ||
      sizes.length < 1 ||
      sizes.length > 10 ||
      new Set(sizes).size !== sizes.length
    ) {
      setError("Enter 1–10 unique bundle sizes between 1 and 500.");
      return;
    }

    try {
      const cinema = await api.createCinema({
        name,
        bundle_sizes: sizes,
      });

      await loadCinemas();
      setCinemaId(String(cinema.id));
      setName("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function calculateQuote(event) {
    event.preventDefault();
    setError("");
    setQuote(null);

    try {
      const result = await api.getBookingQuote(cinemaId, groupSize);
      setQuote(result);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="section">
      <h2>Cinema Management</h2>

      <form className="movie-form" onSubmit={createCinema}>
        <h3>Add a Cinema</h3>

        <label>Cinema Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Star Cineplex"
          required
        />

        <label>Bundle Sizes</label>
        <input
          value={bundleSizes}
          onChange={(event) => setBundleSizes(event.target.value)}
          placeholder="Example: 2, 4, 6, 8"
          required
        />

        <p className="hint">
          Enter unique bundle sizes separated by commas.
        </p>

        <button className="primary-btn" type="submit">
          Add Cinema
        </button>
      </form>

      <form className="movie-form" onSubmit={calculateQuote}>
        <h3>Calculate Booking Quote</h3>

        <label>Select Cinema</label>
        <select
          value={cinemaId}
          onChange={(event) => {
            setCinemaId(event.target.value);
            setQuote(null);
          }}
          required
        >
          <option value="">Select a cinema</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>

        <label>Group Size</label>
        <input
          type="number"
          min="1"
          max="10000"
          value={groupSize}
          onChange={(event) => setGroupSize(event.target.value)}
          required
        />

        <button
          className="primary-btn"
          type="submit"
          disabled={!cinemaId}
        >
          Calculate Minimum Bundles
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {quote && (
        <div className="plan-result">
          <h3>Booking Result</h3>

          {quote.possible ? (
            <>
              <p>
                Minimum bundles: <strong>{quote.total_bundles}</strong>
              </p>

              <h4>Bundle Breakdown</h4>

              {Array.isArray(quote.bundles) ? (
                <ul>
                  {quote.bundles.map((bundle, index) => (
                    <li key={index}>
                      {typeof bundle === "object"
                        ? `${bundle.size} seats × ${bundle.quantity}`
                        : bundle}
                    </li>
                  ))}
                </ul>
              ) : (
                <pre>{JSON.stringify(quote.bundles, null, 2)}</pre>
              )}
            </>
          ) : (
            <p className="error">
              This group size cannot be formed using the available bundles.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
