const POPCORN_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBXsZDJl_TTQNHFZpq_n3EOEmQmP2i4D9C6jwTRzKYjFV6-qtrXFrcuK0b5pCAtz9heZxTY4-9DXPDij4nW3LLx977WjIndAz5BcqCaeOJBUnHbxIKROwjzUB4a4eKnn-NMQhUMO-XCPGA3obUYV08t2JIdYf0RlFt0DDdCukHJUJHQ_01LXpY1vPRNU_9TQPaAPEIDEbf78lLuvGS48q-c_K59Hs6eQN3dTY58S6qluW4yztkjJHEilePDVQvPF-KTRtz0xHrwBLw";

const SUGGESTIONS = [
  {
    query: "comedy",
    genre: "Comedy",
    label: "Komedi",
    sub: "Modunuzu yükseltin",
    icon: "comedy_mask",
    iconBg: "bg-primary-container text-on-primary-container",
    borderHover: "hover:border-primary/20",
  },
  {
    query: "star wars",
    genre: "Sci-Fi",
    label: "Bilim Kurgu",
    sub: "Uzak diyarlar",
    icon: "rocket_launch",
    iconBg: "bg-secondary-container text-on-secondary-container",
    borderHover: "hover:border-secondary/20",
  },
  {
    query: "romance",
    genre: "Romance",
    label: "Romantik",
    sub: "Aşkın her hali",
    icon: "favorite",
    iconBg: "bg-tertiary-container text-on-tertiary-container",
    borderHover: "hover:border-tertiary/20",
  },
];

const POPULAR_QUERIES = ["inception", "matrix", "avatar"];

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = String(text ?? "");
  return el.innerHTML;
}

export function isNotFoundError(message) {
  return (
    message === "Movie not found!" ||
    message === "NOT_FOUND" ||
    message === "NO_RESULTS" ||
    message === "EMPTY_SEARCH"
  );
}

/**
 * @param {string} query
 * @param {{ filtered?: boolean }} options
 */
export function buildNotFoundHtml(query, options = {}) {
  const q = escapeHtml(query || "arama");
  const bodyText = options.filtered
    ? "Filtrelerinize uygun film bulunamadı. Filtreleri gevşetmeyi veya farklı bir anahtar kelime deneyin."
    : "aramanızla eşleşen hiçbir mısır patlağı... pardon, film bulamadık. Belki yazımı kontrol etmek istersiniz?";

  const suggestionsHtml = SUGGESTIONS.map(
    (s) => `
    <button type="button" class="error-suggest bg-surface-container-high p-4 rounded-lg flex items-center gap-4 bouncy-hover cursor-pointer border border-transparent ${s.borderHover} w-full text-left" data-suggest-query="${escapeHtml(s.query)}" data-suggest-genre="${escapeHtml(s.genre)}">
      <div class="w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined" aria-hidden="true">${s.icon}</span>
      </div>
      <div>
        <div class="font-bold text-on-surface">${escapeHtml(s.label)}</div>
        <div class="text-xs text-on-surface-variant">${escapeHtml(s.sub)}</div>
      </div>
    </button>
  `
  ).join("");

  return `
    <div class="max-w-2xl w-full mx-auto text-center space-y-8 py-4" role="alert" aria-live="polite">
      <div class="relative inline-block group">
        <div class="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" aria-hidden="true"></div>
        <div class="relative bg-white p-6 md:p-8 rounded-xl shadow-[0_8px_32px_rgba(224,64,160,0.12)] border border-primary/20 bouncy-hover">
          <img src="${POPCORN_IMG}" alt="" class="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg mb-4 mx-auto" width="256" height="256" loading="lazy">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-error-container text-on-error-container rounded-full font-bold text-sm">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">sentiment_dissatisfied</span>
            Sonuç Bulunamadı
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">
          Olamaz! Bu filmi bulamadık.
        </h2>
        <p class="text-on-surface-variant text-base md:text-lg max-w-md mx-auto">
          <span class="font-bold text-secondary italic">'${q}'</span> ${bodyText}
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button type="button" data-error-back-search class="bg-primary text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-2 pill-shadow-primary bouncy-hover w-full sm:w-auto">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          Aramaya dön
        </button>
        <button type="button" data-error-popular class="bg-secondary-container text-on-secondary-container px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-2 bouncy-hover w-full sm:w-auto">
          <span class="material-symbols-outlined" aria-hidden="true">trending_up</span>
          Popüler filmler
        </button>
      </div>

      <div class="pt-8 md:pt-12">
        <h3 class="text-on-surface-variant font-bold text-sm uppercase tracking-widest mb-6">Şunlara göz atmak ister misiniz?</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${suggestionsHtml}
        </div>
      </div>
    </div>
  `;
}

export function buildTechnicalErrorHtml(message) {
  return `
    <div class="rounded-xl bg-error-container border border-red-200/80 px-5 py-4 text-on-error-container text-left max-w-2xl mx-auto" role="alert">
      <p class="font-bold flex items-center gap-2 mb-1">
        <span class="material-symbols-outlined text-lg" aria-hidden="true">error</span>
        Bir sorun oluştu
      </p>
      <p class="text-sm md:text-base">${escapeHtml(message)}</p>
      <button type="button" data-error-back-search class="mt-4 text-sm font-bold text-primary hover:underline">
        Aramaya don
      </button>
    </div>
  `;
}

export { POPULAR_QUERIES };
