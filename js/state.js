const STORAGE_KEY = "omdbLastSearch";

/**
 * @typedef {{ title: string, year?: string, type?: string }} SearchParams
 */

/**
 * @returns {SearchParams | null}
 */
export function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title")?.trim();
  if (!title) return null;

  return {
    title,
    year: params.get("year")?.trim() || "",
    type: params.get("type")?.trim() || "",
  };
}

/**
 * @returns {SearchParams | null}
 */
export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.title?.trim()) return null;
    return {
      title: String(parsed.title).trim(),
      year: parsed.year ? String(parsed.year).trim() : "",
      type: parsed.type ? String(parsed.type).trim() : "",
    };
  } catch {
    return null;
  }
}

/**
 * URL takes priority over localStorage.
 * @returns {SearchParams | null}
 */
export function loadPersistedSearch() {
  return loadFromUrl() ?? loadFromStorage();
}

/**
 * @param {SearchParams} params
 */
export function persistSearch(params) {
  const query = new URLSearchParams();
  query.set("title", params.title);
  if (params.year) query.set("year", params.year);
  if (params.type) query.set("type", params.type);

  const newUrl = `${window.location.pathname}?${query.toString()}`;
  history.replaceState(null, "", newUrl);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* quota or private mode — URL still works */
  }
}

/**
 * @param {SearchParams} params
 */
export function applyParamsToForm(params, elements) {
  elements.searchInput.value = params.title;
  elements.yearFilter.value = params.year || "";
  elements.typeFilter.value = params.type || "";
}

/**
 * @param {HTMLElement} elements
 * @returns {SearchParams}
 */
export function readParamsFromForm(elements) {
  return {
    title: elements.searchInput.value.trim(),
    year: elements.yearFilter.value.trim(),
    type: elements.typeFilter.value.trim(),
  };
}
