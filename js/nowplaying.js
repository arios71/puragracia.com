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
   UPDATE NOW PLAYING (MOD)
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const rawTitle = (metadata.title || "").trim();
  const rawArtist = (metadata.artist || "").trim();

  // 🚨 BLOQUEO: evitar primer payload incompleto
  if (!rawTitle) return;

  let finalArtist = rawArtist;
  if (!finalArtist) finalArtist = "En vivo";

  const track = {
    title: rawTitle,
    artist: finalArtist,
    coverArt: metadata.coverArt || DEFAULT_COVER,
  };

  const newTrackId =
    normalize(track.title) + "_" + normalize(track.artist);

  const now = Date.now();

  // Evitar duplicación EXACTA
  if (currentTrack === newTrackId) return;

  currentTrack = newTrackId;
  trackStartTime = now;

  stopProgress();

  // reset visual inmediato
  if (progressBarRef) {
    progressBarRef.style.width = "0%";
  }

  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {
    nowPlayingBox.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("now-card");

    /* =========================
       COVER
    ========================= */
    const coverImg = document.createElement("img");
    coverImg.src = track.coverArt;

    if (!metadata.coverArt) {
      coverImg.classList.add("default-cover");
    }

    coverImg.alt = track.album || "";

    /* =========================
       INFO (NUEVO: METADATA ANIMADA)
    ========================= */
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    const metaViewport = document.createElement("div");
    metaViewport.classList.add("np-meta-viewport");

    const metaTrack = document.createElement("div");
    metaTrack.classList.add("np-meta-track");

    const line1 = document.createElement("div");
    line1.classList.add("np-line");
    line1.textContent = track.title;

    const line2 = document.createElement("div");
    line2.classList.add("np-line");
    line2.textContent = track.artist;

    const line3 = document.createElement("div");
    line3.classList.add("np-line");
    line3.textContent = "En vivo";

    metaTrack.appendChild(line1);
    metaTrack.appendChild(line2);
    metaTrack.appendChild(line3);

    metaViewport.appendChild(metaTrack);
    infoDiv.appendChild(metaViewport);

    /* =========================
       PROGRESS BAR (INTACTO)
    ========================= */
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("now-progress");

    const progressBar = document.createElement("div");
    progressBar.classList.add("now-progress-bar");

    progressContainer.appendChild(progressBar);

    progressBarRef = progressBar;

    infoDiv.appendChild(progressContainer);

    /* =========================
       CARD BUILD
    ========================= */
    card.appendChild(coverImg);
    card.appendChild(infoDiv);

    nowPlayingBox.appendChild(card);

    nowPlayingBox.style.opacity = 1;

    animationFrame = requestAnimationFrame(updateProgress);

    /* =========================
       MEDIA SESSION (INTACTO)
    ========================= */
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: [
          {
            src: track.coverArt,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }
  }, 200);
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
