import { fetchMovie } from "./api.js";
import {
  loadPersistedSearch,
  persistSearch,
  applyParamsToForm,
  readParamsFromForm,
} from "./state.js";
import { createUi } from "./ui.js";

const elements = {
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  typeFilter: document.getElementById("typeFilter"),
  yearFilter: document.getElementById("yearFilter"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  errorMessage: document.getElementById("errorMessage"),
  results: document.getElementById("results"),
  poster: document.getElementById("poster"),
  title: document.getElementById("title"),
  year: document.getElementById("year"),
  genre: document.getElementById("genre"),
  director: document.getElementById("director"),
};

const ui = createUi(elements);

/**
 * @param {{ title: string, year?: string, type?: string }} params
 */
async function runSearch(params) {
  ui.resetBeforeSearch();
  ui.setLoading(true);

  try {
    const movie = await fetchMovie(params);
    persistSearch(params);
    ui.showMovie(movie);
  } catch (err) {
    if (err.name === "AbortError") {
      return;
    }
    const code = err.message || "UNKNOWN";
    ui.showError(code);
  } finally {
    ui.setLoading(false);
  }
}

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const params = readParamsFromForm(elements);
  runSearch(params);
});

function initFromPersistedState() {
  const persisted = loadPersistedSearch();
  if (!persisted) return;

  applyParamsToForm(persisted, elements);
  runSearch(persisted);
}

initFromPersistedState();
