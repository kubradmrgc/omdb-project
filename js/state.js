const STORAGE_KEY = "omdbLastSearch";

/**
 * @typedef {{ title: string, year?: string, yearMin?: string, yearMax?: string, type?: string, genre?: string, page?: number }} SearchParams
 */

export function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title")?.trim();
  if (!title) return null;

  return {
    title,
    year: params.get("year")?.trim() || "",
    yearMin: params.get("yearMin")?.trim() || "",
    yearMax: params.get("yearMax")?.trim() || "",
    type: params.get("type")?.trim() || "",
    genre: params.get("genre")?.trim() || "",
    page: Number(params.get("page")) || 1,
  };
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.title?.trim()) return null;
    return {
      title: String(parsed.title).trim(),
      year: parsed.year ? String(parsed.year).trim() : "",
      yearMin: parsed.yearMin ? String(parsed.yearMin).trim() : "",
      yearMax: parsed.yearMax ? String(parsed.yearMax).trim() : "",
      type: parsed.type ? String(parsed.type).trim() : "",
      genre: parsed.genre ? String(parsed.genre).trim() : "",
      page: Number(parsed.page) || 1,
    };
  } catch {
    return null;
  }
}

export function loadPersistedSearch() {
  return loadFromUrl() ?? loadFromStorage();
}

/** @param {SearchParams} params */
export function persistSearch(params) {
  const query = new URLSearchParams();
  query.set("title", params.title);
  if (params.year) query.set("year", params.year);
  if (params.yearMin) query.set("yearMin", params.yearMin);
  if (params.yearMax) query.set("yearMax", params.yearMax);
  if (params.type) query.set("type", params.type);
  if (params.genre) query.set("genre", params.genre);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  history.replaceState(null, "", `${window.location.pathname}?${query.toString()}`);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* ignore */
  }
}

/** @param {SearchParams} params */
export function applyParamsToForm(params, elements) {
  elements.searchInput.value = params.title;
  if (elements.searchInputSidebar) {
    elements.searchInputSidebar.value = params.title;
  }
  elements.typeFilter.value = params.type || "";
  elements.yearMin.value = params.yearMin || "";
  elements.yearMax.value = params.yearMax || "";
  setActiveGenreChip(params.genre || "", elements.genreChips);
}

export function readParamsFromForm(elements) {
  return {
    title: elements.searchInput.value.trim(),
    yearMin: elements.yearMin.value.trim(),
    yearMax: elements.yearMax.value.trim(),
    type: elements.typeFilter.value.trim(),
    genre: getActiveGenre(elements.genreChips),
    page: 1,
  };
}

export function getActiveGenre(container) {
  const active = container?.querySelector(".genre-chip.is-active");
  return active?.dataset.genre || "";
}

export function setActiveGenreChip(genre, container) {
  if (!container) return;
  container.querySelectorAll(".genre-chip").forEach((btn) => {
    const isActive = (btn.dataset.genre || "") === genre;
    btn.classList.toggle("is-active", isActive);
    btn.classList.toggle("bg-primary", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("candy-shadow-primary", isActive);
    btn.classList.toggle("bg-surface-container-high", !isActive);
    btn.classList.toggle("text-on-surface-variant", !isActive);
  });
}

/**
 * Client-side filters on search result items.
 * @param {object[]} items
 * @param {{ yearMin?: string, yearMax?: string, genre?: string }} filters
 */
export function filterSearchResults(items, filters) {
  const min = filters.yearMin ? Number(filters.yearMin) : null;
  const max = filters.yearMax ? Number(filters.yearMax) : null;
  const genre = filters.genre?.toLowerCase();

  return items.filter((item) => {
    const startYear = parseInt(String(item.Year).slice(0, 4), 10);
    if (min && (!startYear || startYear < min)) return false;
    if (max && (!startYear || startYear > max)) return false;
    if (genre && item._genre) {
      if (!String(item._genre).toLowerCase().includes(genre)) return false;
    }
    return true;
  });
}
