
const API_BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.code ||
      JSON.stringify(data) ||
      "Something went wrong"
    );
  }

  return data;
}

export const api = {
  // Movies
  getMovies: () => request("/movies/"),

  createMovie: (data) =>
    request("/movies/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMovie: (id, data) =>
    request(`/movies/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteMovie: (id) =>
    request(`/movies/${id}/`, {
      method: "DELETE",
    }),

  getRewatchOrder: (id) =>
    request(`/movies/${id}/rewatch-order/`),

  // Cinemas
  getCinemas: () => request("/cinemas/"),

  createCinema: (data) =>
    request("/cinemas/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getBookingQuote: (id, groupSize) =>
    request(`/cinemas/${id}/booking/?groupSize=${groupSize}`),
};
