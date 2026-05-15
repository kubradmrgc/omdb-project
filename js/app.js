import { searchMovies, fetchMovieById } from "./api.js";
import {
  loadPersistedSearch,
  persistSearch,
  applyParamsToForm,
  readParamsFromForm,
  filterSearchResults,
  setActiveGenreChip,
} from "./state.js";
import { createUi } from "./ui.js";
import { POPULAR_QUERIES } from "./error-render.js";

const elements = {
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  searchInputSidebar: document.getElementById("searchInputSidebar"),
  searchBtn: document.getElementById("searchBtn"),
  typeFilter: document.getElementById("typeFilter"),
  yearMin: document.getElementById("yearMin"),
  yearMax: document.getElementById("yearMax"),
  genreChips: document.getElementById("genreChips"),
  applyFiltersBtn: document.getElementById("applyFiltersBtn"),
  loading: document.getElementById("loading"),
  errorState: document.getElementById("errorState"),
  welcome: document.getElementById("welcome"),
  resultsSection: document.getElementById("resultsSection"),
  resultsSummary: document.getElementById("resultsSummary"),
  resultsGrid: document.getElementById("resultsGrid"),
  pagination: document.getElementById("pagination"),
  browseView: document.getElementById("browseView"),
  detailView: document.getElementById("detailView"),
  detailContent: document.getElementById("detailContent"),
  detailBackBtn: document.getElementById("detailBackBtn"),
  siteFooter: document.getElementById("siteFooter"),
};

const ui = createUi(elements);

let currentParams = null;
let currentPage = 1;

function syncSearchInputs(from) {
  const value = from === "sidebar" ? elements.searchInputSidebar.value : elements.searchInput.value;
  elements.searchInput.value = value;
  if (elements.searchInputSidebar) {
    elements.searchInputSidebar.value = value;
  }
}

/**
 * Enrich search hits with genre/rating for filters and cards.
 * @param {object[]} items
 */
async function enrichWithDetails(items) {
  const slice = items.slice(0, 10);
  await Promise.all(
    slice.map(async (item) => {
      try {
        const detail = await fetchMovieById(item.imdbID);
        item._genre = detail.Genre || "";
        item.imdbRating = detail.imdbRating;
      } catch (err) {
        if (err.name === "AbortError") return;
        item._genre = "";
      }
    })
  );
  return items;
}

/**
 * @param {import("./state.js").SearchParams} params
 * @param {number} page
 */
const errorHandlers = {
  onBackSearch: () => {
    ui.hideError();
    elements.searchInput.focus();
  },
  onSuggest: (query, genre) => {
    elements.searchInput.value = query;
    if (elements.searchInputSidebar) elements.searchInputSidebar.value = query;
    if (genre) setActiveGenreChip(genre, elements.genreChips);
    runSearch(readParamsFromForm(elements), 1);
  },
  onPopular: () => {
    const pick = POPULAR_QUERIES[Math.floor(Math.random() * POPULAR_QUERIES.length)];
    elements.searchInput.value = pick;
    if (elements.searchInputSidebar) elements.searchInputSidebar.value = pick;
    runSearch(readParamsFromForm(elements), 1);
  },
};

async function runSearch(params, page = 1) {
  if (!params.title) {
    ui.showError("EMPTY_SEARCH", "", {}, errorHandlers);
    return;
  }

  currentParams = { ...params, page };
  currentPage = page;

  if (!elements.detailView.hidden) {
    ui.closeDetailView();
  }
  ui.resetBeforeSearch();
  ui.setLoading(true);

  try {
    const apiParams = {
      title: params.title,
      type: params.type,
      page,
    };

    const data = await searchMovies(apiParams);
    let items = Array.isArray(data.Search) ? [...data.Search] : [];

    if (!items.length) {
      persistSearch({ ...params, page });
      ui.showNotFound(params.title, {}, errorHandlers);
      return;
    }

    const needsEnrich =
      Boolean(params.genre) || Boolean(params.yearMin) || Boolean(params.yearMax);
    if (needsEnrich) {
      await enrichWithDetails(items);
    }

    const beforeFilter = items.length;
    items = filterSearchResults(items, {
      yearMin: params.yearMin,
      yearMax: params.yearMax,
      genre: params.genre,
    });

    const total = Number(data.totalResults) || 0;
    const totalPages = Math.max(1, Math.ceil(total / 10));

    persistSearch({ ...params, page });

    ui.renderResultsGrid(
      items,
      { query: params.title, total, page, filtered: items.length < beforeFilter },
      handleSelectMovie,
      errorHandlers
    );
    ui.renderPagination(page, totalPages, (p) => runSearch(params, p));
  } catch (err) {
    if (err.name === "AbortError") return;
    const msg = err.message || "UNKNOWN";
    if (msg === "Movie not found!") {
      ui.showNotFound(params.title, {}, errorHandlers);
    } else {
      ui.showError(msg, params.title, {}, errorHandlers);
    }
  } finally {
    ui.setLoading(false);
  }
}

async function handleSelectMovie(imdbId) {
  ui.setLoading(true);
  try {
    const movie = await fetchMovieById(imdbId);
    ui.showMovieDetail(movie, closeDetail);
  } catch (err) {
    if (err.name !== "AbortError") {
      ui.showError(err.message || "UNKNOWN", currentParams?.title || "", {}, errorHandlers);
    }
  } finally {
    ui.setLoading(false);
  }
}

function submitSearch() {
  syncSearchInputs("header");
  const params = readParamsFromForm(elements);
  runSearch(params, 1);
}

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitSearch();
});

elements.searchInputSidebar?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    syncSearchInputs("sidebar");
    submitSearch();
  }
});

elements.searchInputSidebar?.addEventListener("input", () => {
  elements.searchInput.value = elements.searchInputSidebar.value;
});

elements.searchInput.addEventListener("input", () => {
  if (elements.searchInputSidebar) {
    elements.searchInputSidebar.value = elements.searchInput.value;
  }
});

elements.applyFiltersBtn.addEventListener("click", () => {
  if (!currentParams) {
    submitSearch();
    return;
  }
  const params = readParamsFromForm(elements);
  params.title = params.title || currentParams.title;
  runSearch(params, 1);
});

elements.genreChips?.querySelectorAll(".genre-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    setActiveGenreChip(chip.dataset.genre || "", elements.genreChips);
    if (currentParams) {
      const params = readParamsFromForm(elements);
      params.title = params.title || currentParams.title;
      runSearch(params, currentPage);
    }
  });
});

function closeDetail() {
  ui.closeDetailView();
}

elements.detailBackBtn.addEventListener("click", closeDetail);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !elements.detailView.hidden) {
    closeDetail();
  }
});

function initFromPersistedState() {
  const persisted = loadPersistedSearch();
  if (!persisted) {
    ui.showWelcome();
    return;
  }

  applyParamsToForm(persisted, elements);
  runSearch(persisted, persisted.page || 1);
}

initFromPersistedState();
