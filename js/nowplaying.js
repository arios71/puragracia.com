// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

// 🔒 CONTROL DE TRACK (ANTI-METADATA ADELANTADA)
let currentTrack = null;
let trackStartTime = 0;
let trackDuration = 0;

let animationFrame = null;

// 🖼️ FALLBACK GLOBAL
const DEFAULT_COVER = "/default-cover.png";

// Normalizador
const normalize = (str) => (str || "").trim().toLowerCase();

/* =========================
   HELPERS
========================= */
function parseDuration(duration) {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;

  if (typeof duration === "string" && duration.includes(":")) {
    const parts = duration.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  return parseInt(duration) || 0;
}

/* =========================
   CLEAN PROGRESS
========================= */
function stopProgress() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

/* =========================
   PROGRESS ENGINE (FLUIDO)
========================= */
let progressBarRef = null;

function updateProgress() {
  if (!trackDuration || !progressBarRef) return;

  const elapsed = (Date.now() - trackStartTime) / 1000;
  const percent = Math.min((elapsed / trackDuration) * 100, 100);

  progressBarRef.style.width = percent + "%";

  if (percent < 100) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
}

/* =========================
   UPDATE NOW PLAYING (MODIFICADO)
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const rawTitle = (metadata.title || "").trim();
  const rawArtist = (metadata.artist || "").trim();
  if (!rawTitle) return;

  let finalArtist = rawArtist || "En vivo";
  const track = {
    title: rawTitle,
    artist: finalArtist,
    coverArt: metadata.coverArt || DEFAULT_COVER,
  };

  const newTrackId = normalize(track.title) + "_" + normalize(track.artist);
  if (currentTrack === newTrackId) return;

  currentTrack = newTrackId;
  trackStartTime = Date.now();
  stopProgress();

  // 1. Buscamos o creamos el contenedor de la card
  let card = nowPlayingBox.querySelector(".now-card");
  if (!card) {
    card = document.createElement("div");
    card.classList.add("now-card");
    nowPlayingBox.appendChild(card);
  }

  // 2. Actualizamos o creamos la imagen
  let coverImg = card.querySelector("img");
  if (!coverImg) {
    coverImg = document.createElement("img");
    card.prepend(coverImg); // Asegura que la imagen sea lo primero
  }
  coverImg.src = track.coverArt;

  // 3. Actualizamos o creamos la info
  let infoDiv = card.querySelector(".now-info");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");
    card.appendChild(infoDiv);
  }
  
  // Limpiamos contenido de texto pero mantenemos la estructura
  infoDiv.innerHTML = `
    <div class="np-meta-viewport">
      <div class="np-meta-track">
        <div class="np-line">${track.title}</div>
        <div class="np-line">${track.artist}</div>
      </div>
    </div>
    <div class="now-progress"><div class="now-progress-bar"></div></div>
  `;

  progressBarRef = infoDiv.querySelector(".now-progress-bar");
  animationFrame = requestAnimationFrame(updateProgress);

  // MediaSession igual que antes
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      artwork: [{ src: track.coverArt, sizes: "512x512", type: "image/png" }],
    });
  }
}
/* =========================
   FETCH METADATA
========================= */
async function fetchNowPlaying() {
  try {
    const res = await fetch(
      "https://pg-radio-webhook.vercel.app/api/nowplaying?_=" + Date.now()
    );

    if (!res.ok) throw new Error("No se pudo obtener metadata");

    const data = await res.json();
    updateNowPlaying(data);
  } catch (err) {
    console.error("Error cargando Now Playing:", err);
  }
}

/* =========================
   INIT
========================= */
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);

/* =========================
   CLEANUP VISIBILITY
========================= */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopProgress();
  } else {
    if (progressBarRef) {
      updateProgress();
    }
  }
});

