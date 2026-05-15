import { API_KEY } from "./config.js";

const BASE_URL = "https://www.omdbapi.com/";
const PLACEHOLDER_POSTER = "assets/poster-placeholder.svg";

/** @type {Map<string, object>} */
const cache = new Map();

let activeController = null;

/**
 * Builds a stable cache key from search params.
 * @param {{ title: string, year?: string, type?: string }} params
 */
function cacheKey(params) {
  return JSON.stringify({
    title: params.title.trim().toLowerCase(),
    year: params.year?.trim() || "",
    type: params.type?.trim() || "",
  });
}

/**
 * @param {{ title: string, year?: string, type?: string }} params
 * @returns {Promise<object>}
 */
export async function fetchMovie(params) {
  const title = params.title?.trim();
  if (!title) {
    throw new Error("EMPTY_SEARCH");
  }

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error("MISSING_API_KEY");
  }

  const key = cacheKey(params);
  if (cache.has(key)) {
    return cache.get(key);
  }

  if (activeController) {
    activeController.abort();
  }
  activeController = new AbortController();

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("t", title);
  if (params.year?.trim()) {
    url.searchParams.set("y", params.year.trim());
  }
  if (params.type?.trim()) {
    url.searchParams.set("type", params.type.trim());
  }

  let response;
  try {
    response = await fetch(url.toString(), { signal: activeController.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw err;
    }
    throw new Error("NETWORK_ERROR");
  } finally {
    activeController = null;
  }

  if (!response.ok) {
    throw new Error("HTTP_ERROR");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("PARSE_ERROR");
  }

  if (data.Response === "False") {
    const message = data.Error || "Movie not found!";
    throw new Error(message);
  }

  cache.set(key, data);
  return data;
}

/**
 * @param {string} posterUrl
 * @returns {string}
 */
export function resolvePosterUrl(posterUrl) {
  if (!posterUrl || posterUrl === "N/A") {
    return PLACEHOLDER_POSTER;
  }
  return posterUrl;
}

export { PLACEHOLDER_POSTER };
