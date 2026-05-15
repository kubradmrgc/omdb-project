import { resolvePosterUrl, PLACEHOLDER_POSTER } from "./api.js";

const GENRE_PILL_CLASSES = [
  "bg-primary-fixed text-on-primary-fixed-variant",
  "bg-secondary-fixed text-on-secondary-fixed-variant",
  "bg-tertiary-fixed text-on-tertiary-fixed-variant",
];

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = String(text ?? "");
  return el.innerHTML;
}

function na(value, fallback = "—") {
  return value && value !== "N/A" ? value : fallback;
}

export function formatRuntime(runtime) {
  if (!runtime || runtime === "N/A") return "—";
  const match = String(runtime).match(/(\d+)/);
  if (!match) return runtime;
  const mins = parseInt(match[1], 10);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}s ${m}dk`;
  return `${m} dk`;
}

function genrePills(genre) {
  if (!genre || genre === "N/A") return "";
  const parts = genre.split(",").map((g) => g.trim()).filter(Boolean).slice(0, 3);
  return parts
    .map(
      (g, i) =>
        `<span class="px-4 py-1 ${GENRE_PILL_CLASSES[i % GENRE_PILL_CLASSES.length]} rounded-full text-xs font-bold uppercase tracking-widest">${escapeHtml(g)}</span>`
    )
    .join("");
}

function parseActors(actors) {
  if (!actors || actors === "N/A") return [];
  return actors.split(",").map((a) => a.trim()).filter(Boolean);
}

function awardSummary(awards) {
  if (!awards || awards === "N/A") return { title: "Ödül bilgisi yok", sub: "OMDB" };
  const oscar = awards.match(/(\d+)\s+Oscar/i);
  if (oscar) {
    return { title: `${oscar[1]} Oscar`, sub: awards.slice(0, 40) + (awards.length > 40 ? "…" : "") };
  }
  return { title: "Ödüller", sub: awards.length > 48 ? awards.slice(0, 48) + "…" : awards };
}

function metascoreValue(movie) {
  if (movie.Metascore && movie.Metascore !== "N/A") return movie.Metascore;
  const meta = movie.Ratings?.find((r) => r.Source === "Metacritic");
  return meta?.Value?.replace("/100", "") || null;
}

/**
 * @param {object} movie - OMDB full detail
 */
export function buildDetailPageHtml(movie) {
  const poster = resolvePosterUrl(movie.Poster);
  const title = escapeHtml(movie.Title);
  const director = na(movie.Director);
  const plot = na(movie.Plot, "Özet mevcut değil.");
  const year = na(movie.Year);
  const rating = na(movie.imdbRating);
  const runtime = formatRuntime(movie.Runtime);
  const language = na(movie.Language?.split(",")[0]);
  const actors = parseActors(movie.Actors);
  const lead = actors[0] || "—";
  const awards = awardSummary(movie.Awards);
  const meta = metascoreValue(movie);
  const imdbUrl = movie.imdbID ? `https://www.imdb.com/title/${movie.imdbID}/` : "#";

  const castDots = actors.slice(0, 3);
  const castDotsHtml = castDots
    .map(
      (_, i) =>
        `<div class="w-8 h-8 rounded-full border-2 border-white ${i === 0 ? "bg-primary-fixed" : i === 1 ? "bg-secondary-fixed" : "bg-tertiary-fixed"}"></div>`
    )
    .join("");

  return `
    <div class="relative w-full rounded-xl overflow-hidden shadow-xl bg-surface-container-lowest border border-outline-variant/30 mb-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:min-h-[520px]">
        <div class="lg:col-span-5 relative group overflow-hidden min-h-[320px] lg:min-h-full">
          <img class="w-full h-full min-h-[320px] object-cover transition-transform duration-700 group-hover:scale-105" src="${escapeHtml(poster)}" alt="${title} posteri" id="detailHeroPoster">
          <div class="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-30"></div>
        </div>
        <div class="lg:col-span-7 p-6 md:p-10 lg:p-14 flex flex-col justify-center bg-white">
          <div class="flex flex-wrap gap-2 mb-5">
            ${genrePills(movie.Genre)}
            <span class="px-4 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-bold uppercase tracking-widest">${escapeHtml(year)}</span>
          </div>
          <h1 id="detailPageTitle" class="text-4xl md:text-5xl lg:text-6xl font-black text-on-surface mb-3 leading-tight">${title}</h1>
          <p class="text-lg md:text-xl font-bold text-secondary mb-6 italic">Yönetmen: ${escapeHtml(director)}</p>
          <p class="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 max-w-2xl">${escapeHtml(plot)}</p>
          <div class="flex flex-col sm:flex-row gap-3 mb-10">
            <a href="${escapeHtml(imdbUrl)}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all pill-shadow-primary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">play_circle</span>
              IMDb'de gör
            </a>
            <button type="button" class="flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container px-6 py-3.5 rounded-full font-bold text-base hover:scale-105 active:scale-95 transition-all" data-detail-back>
              <span class="material-symbols-outlined">arrow_back</span>
              Listeye dön
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-6 md:gap-10 border-t border-outline-variant/30 pt-8">
            <div>
              <p class="text-xs font-bold text-outline uppercase tracking-tighter mb-1">IMDb Puanı</p>
              <p class="text-2xl font-black text-on-surface">${escapeHtml(rating)}<span class="text-sm font-normal text-on-surface-variant">/10</span></p>
            </div>
            <div>
              <p class="text-xs font-bold text-outline uppercase tracking-tighter mb-1">Süre</p>
              <p class="text-2xl font-black text-on-surface">${escapeHtml(runtime)}</p>
            </div>
            <div>
              <p class="text-xs font-bold text-outline uppercase tracking-tighter mb-1">Dil</p>
              <p class="text-2xl font-black text-on-surface">${escapeHtml(language)}</p>
            </div>
            <div class="hidden sm:block">
              <p class="text-xs font-bold text-outline uppercase tracking-tighter mb-1">Tür</p>
              <p class="text-lg font-bold text-on-surface max-w-[12rem]">${escapeHtml(na(movie.Genre))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
      <div class="md:col-span-2 md:row-span-2 bg-tertiary-container rounded-lg p-1 relative overflow-hidden group shadow-lg min-h-[240px]">
        <img class="w-full h-full min-h-[240px] object-cover rounded-lg transition-transform duration-700 group-hover:scale-105" src="${escapeHtml(poster)}" alt="${title} görseli">
        <div class="absolute bottom-4 left-4 right-4 p-5 bg-white/20 backdrop-blur-xl rounded-lg border border-white/30">
          <h3 class="text-white font-black text-xl md:text-2xl">${escapeHtml(na(movie.Type, "Film"))}</h3>
          <p class="text-white/90 text-sm">${escapeHtml(na(movie.Released))}</p>
        </div>
      </div>

      <div class="bg-surface-container p-6 rounded-lg flex flex-col justify-between hover:scale-[1.02] transition-transform pill-shadow-secondary min-h-[160px]">
        <p class="text-xs font-black text-secondary uppercase tracking-widest mb-4">Oyuncular</p>
        <div>
          <h4 class="font-bold text-xl text-on-surface">${escapeHtml(lead)}</h4>
          <p class="text-on-surface-variant text-sm mt-1">${actors.length > 1 ? `+${actors.length - 1} kişi daha` : "Başrol"}</p>
        </div>
        <div class="mt-4 flex -space-x-2">${castDotsHtml}</div>
      </div>

      <div class="bg-primary-container p-6 rounded-lg flex flex-col items-center justify-center text-center text-on-primary-container hover:rotate-1 transition-transform min-h-[160px]">
        <span class="material-symbols-outlined text-4xl mb-2" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
        <p class="font-black text-xl md:text-2xl">${escapeHtml(awards.title)}</p>
        <p class="text-xs font-bold uppercase mt-1 px-2">${escapeHtml(awards.sub)}</p>
      </div>

      <div class="md:col-span-2 bg-white p-6 md:p-8 rounded-lg border border-outline-variant shadow-sm flex items-center gap-5 min-h-[140px]">
        <div class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary text-white flex items-center justify-center text-2xl md:text-3xl font-black">
          ${meta ? escapeHtml(meta) : "—"}
        </div>
        <div>
          <h4 class="font-bold text-lg text-on-surface">Metacritic</h4>
          <p class="text-on-surface-variant italic text-sm md:text-base mt-1">${meta ? "Metacritic eleşti puanı" : "Bu yapım için Metacritic puanı bulunamadı."}</p>
        </div>
      </div>
    </div>
  `;
}

export function attachDetailPosterFallback(container) {
  const img = container.querySelector("#detailHeroPoster");
  if (!img) return;
  img.onerror = () => {
    img.onerror = null;
    img.src = PLACEHOLDER_POSTER;
  };
}
