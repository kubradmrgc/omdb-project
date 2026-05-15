import { resolvePosterUrl, PLACEHOLDER_POSTER } from "./api.js";
import { buildDetailPageHtml, attachDetailPosterFallback } from "./detail-render.js";
import {
  buildNotFoundHtml,
  buildTechnicalErrorHtml,
  isNotFoundError,
} from "./error-render.js";

const ERROR_MESSAGES = {
  EMPTY_SEARCH: "Lütfen bir film adı girin.",
  MISSING_API_KEY:
    "API anahtarı yapılandırılmamış. js/config.js dosyasına OMDB anahtarınızı ekleyin.",
  NETWORK_ERROR: "Bağlantı kurulamadı, lütfen tekrar deneyin.",
  HTTP_ERROR: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
  PARSE_ERROR: "Yanıt işlenemedi. Lütfen tekrar deneyin.",
  INVALID_ID: "Geçersiz film kimliği.",
};

export function translateError(codeOrMessage) {
  if (ERROR_MESSAGES[codeOrMessage]) return ERROR_MESSAGES[codeOrMessage];
  if (codeOrMessage === "Movie not found!") {
    return "Film bulunamadı. Başlığı veya filtreleri kontrol edip tekrar deneyin.";
  }
  if (codeOrMessage === "Too many results.") {
    return "Çok fazla sonuç var. Daha spesifik bir arama yapın.";
  }
  return codeOrMessage || "Bilinmeyen bir hata oluştu.";
}

function typeLabel(type) {
  const map = { movie: "Film", series: "Dizi", episode: "Bölüm", game: "Oyun" };
  return map[type] || type || "—";
}

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

export function createUi(elements) {
  const {
    loading,
    errorState,
    welcome,
    resultsSection,
    resultsSummary,
    resultsGrid,
    pagination,
    searchBtn,
    browseView,
    detailView,
    detailContent,
    siteFooter,
  } = elements;

  function setLoading(isLoading) {
    if (isLoading) {
      loading.removeAttribute("hidden");
    } else {
      loading.setAttribute("hidden", "");
    }
    searchBtn.disabled = isLoading;
  }

  /**
   * @param {string} message
   * @param {string} [query]
   * @param {{ filtered?: boolean }} [options]
   * @param {object} [handlers]
   */
  function showError(message, query = "", options = {}, handlers = {}) {
    hideWelcome();
    resultsSection.hidden = true;
    pagination.hidden = true;
    resultsGrid.innerHTML = "";

    const text = translateError(message);
    if (isNotFoundError(message)) {
      errorState.innerHTML = buildNotFoundHtml(query || "arama", {
        filtered: options.filtered,
      });
    } else {
      errorState.innerHTML = buildTechnicalErrorHtml(text);
    }

    attachErrorHandlers(handlers);
    errorState.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showNotFound(query, options = {}, handlers = {}) {
    showError("NOT_FOUND", query, options, handlers);
  }

  function attachErrorHandlers(handlers) {
    const { onBackSearch, onSuggest, onPopular } = handlers;

    errorState.querySelectorAll("[data-error-back-search]").forEach((btn) => {
      btn.addEventListener("click", () => onBackSearch?.());
    });
    errorState.querySelectorAll("[data-error-popular]").forEach((btn) => {
      btn.addEventListener("click", () => onPopular?.());
    });
    errorState.querySelectorAll(".error-suggest").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSuggest?.(btn.dataset.suggestQuery, btn.dataset.suggestGenre);
      });
    });
  }

  function hideError() {
    errorState.hidden = true;
    errorState.innerHTML = "";
  }

  function showWelcome() {
    hideError();
    welcome.hidden = false;
    resultsSection.hidden = true;
  }

  function hideWelcome() {
    welcome.hidden = true;
  }

  /**
   * @param {object[]} items
   * @param {{ query: string, total: number, page: number }} meta
   * @param {(imdbId: string) => void} onSelect
   */
  function renderResultsGrid(items, meta, onSelect, handlers = {}) {
    hideError();
    hideWelcome();
    resultsSection.hidden = false;

    const count = items.length;
    if (count === 0) {
      showNotFound(meta.query, { filtered: Boolean(meta.filtered) }, handlers);
      return;
    }

    resultsSummary.textContent = `"${meta.query}" için ${count} sonuç gösteriliyor (sayfa ${meta.page})`;

    resultsGrid.innerHTML = items
      .map((item) => {
        const poster = resolvePosterUrl(item.Poster);
        const rating =
          item.imdbRating && item.imdbRating !== "N/A"
            ? item.imdbRating
            : null;
        const badgeClass = rating ? "bg-primary candy-shadow-primary" : "bg-tertiary shadow-md";
        const genreTag = item._genre
          ? item._genre.split(",")[0].trim()
          : typeLabel(item.Type);

        return `
          <button type="button" class="movie-card-btn group relative bg-white rounded-lg overflow-hidden candy-shadow-secondary bouncy-hover text-left" data-imdb-id="${escapeHtml(item.imdbID)}">
            <div class="aspect-[2/3] overflow-hidden relative">
              <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${escapeHtml(poster)}" alt="${escapeHtml(item.Title)} posteri" loading="lazy">
              ${
                rating
                  ? `<div class="absolute top-3 right-3 ${badgeClass} text-white px-2.5 py-0.5 rounded-full text-xs font-black">${escapeHtml(rating)}</div>`
                  : ""
              }
              <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div class="flex gap-1.5 flex-wrap">
                  <span class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${escapeHtml(genreTag)}</span>
                  <span class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${escapeHtml(item.Year || "—")}</span>
                </div>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-base text-on-surface mb-0.5 group-hover:text-primary transition-colors truncate">${escapeHtml(item.Title)}</h3>
              <p class="text-on-surface-variant text-sm font-medium">${escapeHtml(typeLabel(item.Type))}</p>
            </div>
          </button>
        `;
      })
      .join("");

    resultsGrid.querySelectorAll("[data-imdb-id]").forEach((btn) => {
      btn.addEventListener("click", () => onSelect(btn.dataset.imdbId));
    });
  }

  /**
   * @param {number} currentPage
   * @param {number} totalPages
   * @param {(page: number) => void} onPageChange
   */
  function renderPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    for (let p = start; p <= end; p++) pages.push(p);

    pagination.innerHTML = `
      <button type="button" data-page="prev" class="w-11 h-11 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center bouncy-hover font-black" ${currentPage <= 1 ? "disabled" : ""} aria-label="Önceki sayfa">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="flex gap-2" role="group" aria-label="Sayfa numaraları">
        ${pages
          .map(
            (p) => `
          <button type="button" data-page="${p}" class="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm bouncy-hover ${
              p === currentPage
                ? "bg-primary text-white candy-shadow-primary scale-110"
                : "bg-white text-on-surface-variant hover:bg-surface-container"
            }" aria-current="${p === currentPage ? "page" : "false"}">${p}</button>
        `
          )
          .join("")}
      </div>
      <button type="button" data-page="next" class="w-11 h-11 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center bouncy-hover font-black" ${currentPage >= totalPages ? "disabled" : ""} aria-label="Sonraki sayfa">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    `;

    pagination.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.dataset.page;
        if (val === "prev" && currentPage > 1) onPageChange(currentPage - 1);
        else if (val === "next" && currentPage < totalPages) onPageChange(currentPage + 1);
        else if (val !== "prev" && val !== "next") onPageChange(Number(val));
      });
    });
  }

  /**
   * @param {object} movie
   * @param {() => void} onBack
   */
  function showMovieDetail(movie, onBack) {
    hideError();
    detailContent.innerHTML = buildDetailPageHtml(movie);
    attachDetailPosterFallback(detailContent);

    detailContent.querySelectorAll("[data-detail-back]").forEach((btn) => {
      btn.addEventListener("click", onBack);
    });

    browseView.hidden = true;
    siteFooter.hidden = true;
    detailView.hidden = false;
    document.title = `${movie.Title || "Film"} — Film Ara`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeDetailView() {
    detailView.hidden = true;
    browseView.hidden = false;
    siteFooter.hidden = false;
    detailContent.innerHTML = "";
    document.title = "Film Ara — Arama Sonuçları";
  }

  function resetBeforeSearch() {
    hideError();
    resultsGrid.innerHTML = "";
    pagination.hidden = true;
  }

  return {
    setLoading,
    showError,
    showNotFound,
    hideError,
    showWelcome,
    renderResultsGrid,
    renderPagination,
    showMovieDetail,
    closeDetailView,
    resetBeforeSearch,
  };
}
