import { resolvePosterUrl, PLACEHOLDER_POSTER } from "./api.js";

const ERROR_MESSAGES = {
  EMPTY_SEARCH: "Lütfen bir film adı girin.",
  MISSING_API_KEY:
    "API anahtarı yapılandırılmamış. js/config.js dosyasına OMDB anahtarınızı ekleyin.",
  NETWORK_ERROR: "Bağlantı kurulamadı, lütfen tekrar deneyin.",
  HTTP_ERROR: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
  PARSE_ERROR: "Yanıt işlenemedi. Lütfen tekrar deneyin.",
};

/**
 * @param {string} codeOrMessage
 * @returns {string}
 */
export function translateError(codeOrMessage) {
  if (ERROR_MESSAGES[codeOrMessage]) {
    return ERROR_MESSAGES[codeOrMessage];
  }
  if (codeOrMessage === "Movie not found!") {
    return "Film bulunamadı. Başlığı veya filtreleri kontrol edip tekrar deneyin.";
  }
  if (codeOrMessage === "Too many results.") {
    return "Çok fazla sonuç var. Daha spesifik bir başlık veya yıl girin.";
  }
  return codeOrMessage || "Bilinmeyen bir hata oluştu.";
}

/**
 * @param {object} elements - DOM references
 */
export function createUi(elements) {
  const { loading, error, errorMessage, results, poster, title, year, genre, director, searchBtn } =
    elements;

  function setLoading(isLoading) {
    loading.hidden = !isLoading;
    searchBtn.disabled = isLoading;
  }

  function showError(message) {
    errorMessage.textContent = translateError(message);
    error.hidden = false;
    results.hidden = true;
  }

  function hideError() {
    error.hidden = true;
    errorMessage.textContent = "";
  }

  function clearResults() {
    results.hidden = true;
  }

  /**
   * @param {object} movie - OMDB response
   */
  function showMovie(movie) {
    hideError();

    const posterUrl = resolvePosterUrl(movie.Poster);
    poster.src = posterUrl;
    poster.alt = `${movie.Title} posteri`;
    poster.onerror = () => {
      poster.onerror = null;
      poster.src = PLACEHOLDER_POSTER;
    };

    title.textContent = movie.Title || "—";
    year.textContent = movie.Year || "—";
    genre.textContent = movie.Genre || "—";
    director.textContent = movie.Director || "—";

    results.hidden = false;
  }

  function resetBeforeSearch() {
    hideError();
    clearResults();
  }

  return {
    setLoading,
    showError,
    hideError,
    showMovie,
    resetBeforeSearch,
  };
}
