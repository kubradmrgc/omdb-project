import { API_KEY } from "./config.js";

const BASE_URL = "https://www.omdbapi.com/";
export const PLACEHOLDER_POSTER = "assets/poster-placeholder.svg";

/** @type {Map<string, unknown>} */
const cache = new Map();

/** Only cancels the previous list search, not parallel detail requests */
let searchAbortController = null;

function assertApiKey() {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    throw new Error("MISSING_API_KEY");
  }
}

/**
 * @param {URL} url
 * @param {AbortSignal} [signal]
 */
async function fetchJson(url, signal) {
  let response;
  try {
    response = await fetch(url.toString(), { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) throw new Error("HTTP_ERROR");

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("PARSE_ERROR");
  }

  if (data.Response === "False") {
    throw new Error(data.Error || "Movie not found!");
  }

  return data;
}

/**
 * @param {{ title: string, year?: string, type?: string, page?: number }} params
 */
export async function searchMovies(params) {
  const title = params.title?.trim();
  if (!title) throw new Error("EMPTY_SEARCH");
  assertApiKey();

  const key = `search:${JSON.stringify(params)}`;
  if (cache.has(key)) return cache.get(key);

  if (searchAbortController) {
    searchAbortController.abort();
  }
  searchAbortController = new AbortController();
  const { signal } = searchAbortController;

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("s", title);
  url.searchParams.set("page", String(params.page || 1));
  if (params.type?.trim()) url.searchParams.set("type", params.type.trim());
  if (params.year?.trim()) url.searchParams.set("y", params.year.trim());

  try {
    const data = await fetchJson(url, signal);
    cache.set(key, data);
    return data;
  } finally {
    if (searchAbortController?.signal === signal) {
      searchAbortController = null;
    }
  }
}

/**
 * @param {string} imdbId
 */
export async function fetchMovieById(imdbId) {
  if (!imdbId) throw new Error("INVALID_ID");
  assertApiKey();

  const key = `id:${imdbId}`;
  if (cache.has(key)) return cache.get(key);

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("i", imdbId);

  const data = await fetchJson(url);
  cache.set(key, data);
  return data;
}

/**
 * @param {{ title: string, year?: string, type?: string }} params
 */
export async function fetchMovie(params) {
  const title = params.title?.trim();
  if (!title) throw new Error("EMPTY_SEARCH");
  assertApiKey();

  const key = `title:${JSON.stringify(params)}`;
  if (cache.has(key)) return cache.get(key);

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  url.searchParams.set("t", title);
  if (params.year?.trim()) url.searchParams.set("y", params.year.trim());
  if (params.type?.trim()) url.searchParams.set("type", params.type.trim());

  const data = await fetchJson(url);
  cache.set(key, data);
  return data;
}

export function resolvePosterUrl(posterUrl) {
  if (!posterUrl || posterUrl === "N/A") return PLACEHOLDER_POSTER;
  return posterUrl;
}
