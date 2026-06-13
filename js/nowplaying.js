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
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const newTitle = metadata.title || "";
  const newArtist = metadata.artist || "";
  const newTrackId = normalize(newTitle) + "_" + normalize(newArtist);

  const duration = parseDuration(metadata.duration || metadata.length);
  const now = Date.now();

  // Evitar duplicación EXACTA
  if (currentTrack === newTrackId) return;

  currentTrack = newTrackId;
  trackStartTime = now;
  trackDuration = duration;

  stopProgress();

  if (progressBarRef) {
    progressBarRef.style.width = "0%";
  }

  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {
    nowPlayingBox.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("now-card");

    const coverImg = document.createElement("img");
    coverImg.src = metadata.coverArt || DEFAULT_COVER;

    if (!metadata.coverArt) {
      coverImg.classList.add("default-cover");
    }

    coverImg.alt = metadata.album || "Álbum";

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora";

    // =========================
    // TITULO (SAFE TICKER VIA CSS)
    // =========================
    const title = document.createElement("div");
    title.classList.add("now-title");

    const titleSpan = document.createElement("span");
    titleSpan.textContent = metadata.title || "En vivo";
    title.appendChild(titleSpan);

    // =========================
    // ARTISTA (SAFE TICKER VIA CSS)
    // =========================
    const artist = document.createElement("div");
    artist.classList.add("now-artist");

    const artistSpan = document.createElement("span");
    artistSpan.textContent = metadata.artist || "Pura Gracia Radio";
    artist.appendChild(artistSpan);

    const program = document.createElement("div");
    program.classList.add("now-program");
    program.textContent = metadata.album || "Programa en vivo";

    const durationEl = document.createElement("div");
    durationEl.classList.add("now-duration");
    durationEl.textContent = metadata.duration ? `⏱ ${metadata.duration}` : "";

    const progressContainer = document.createElement("div");
    progressContainer.classList.add("now-progress");

    const progressBar = document.createElement("div");
    progressBar.classList.add("now-progress-bar");

    progressContainer.appendChild(progressBar);
    progressBarRef = progressBar;

    const equalizer = document.createElement("div");
    equalizer.classList.add("equalizer");

    for (let i = 0; i < 5; i++) {
      equalizer.appendChild(document.createElement("span"));
    }

    infoDiv.appendChild(label);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    infoDiv.appendChild(program);
    infoDiv.appendChild(durationEl);
    infoDiv.appendChild(progressContainer);
    infoDiv.appendChild(equalizer);

    card.appendChild(coverImg);
    card.appendChild(infoDiv);

    nowPlayingBox.appendChild(card);

    nowPlayingBox.style.opacity = 1;

    animationFrame = requestAnimationFrame(updateProgress);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title || "Pura Gracia Radio",
        artist: metadata.artist || "En vivo",
        album: metadata.album || "Pura Gracia Radio",
        artwork: [
          {
            src: metadata.coverArt || DEFAULT_COVER,
            sizes: "512x512",
            type: "image/png"
          }
        ]
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

    const fakeData = {
  title: "ESTE ES UN TÍTULO EXTREMADAMENTE LARGO PARA PROBAR SI EL CARD SE ROMPE O NO",
  artist: "ARTISTA CON NOMBRE IGUALMENTE LARGO PARA VER EL COMPORTAMIENTO",
  album: "Programa en vivo",
  duration: "4:32",
  coverArt: ""
};

updateNowPlaying(fakeData);

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
  } else if (trackDuration && progressBarRef) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
});
