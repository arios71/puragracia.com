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
let elapsedTimeRef = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return (
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

function updateProgress() {
  if (!trackDuration || !progressBarRef) return;

  const elapsed = (Date.now() - trackStartTime) / 1000;
  const percent = Math.min((elapsed / trackDuration) * 100, 100);

  progressBarRef.style.width = percent + "%";

  if (elapsedTimeRef) {
    elapsedTimeRef.textContent = formatTime(elapsed);
  }

  if (percent < 100) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
}

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const track = {
  title: metadata.title || "En vivo",
  artist: metadata.artist || "Pura Gracia Radio",
  album: metadata.album || "Programa en vivo",
  coverArt: metadata.coverArt || DEFAULT_COVER,
  duration: parseDuration(metadata.duration || metadata.length)
};

const newTrackId =
  normalize(track.title) + "_" + normalize(track.artist);
  const now = Date.now();

  // Evitar duplicación EXACTA
  if (currentTrack === newTrackId) return;

  // Aceptar cambio
  currentTrack = newTrackId;
  trackStartTime = now;
  trackDuration = track.duration;

  stopProgress();

  // reset visual inmediato (fix clave)
  if (progressBarRef) {
    progressBarRef.style.width = "0%";
  }

  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {
    nowPlayingBox.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("now-card");

    const coverImg = document.createElement("img");
    coverImg.src = track.coverArt;

    if (!metadata.coverArt) {
      coverImg.classList.add("default-cover");
    }

    coverImg.alt = track.album;

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora";

    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = track.title;

    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = track.artist;

    const program = document.createElement("div");
    program.classList.add("now-program");
    program.textContent = track.album;

    const progressContainer = document.createElement("div");
progressContainer.classList.add("now-progress");

const progressBar = document.createElement("div");
progressBar.classList.add("now-progress-bar");

const progressTimes = document.createElement("div");
progressTimes.classList.add("now-progress-times");

const elapsedTime = document.createElement("span");
elapsedTime.textContent = "00:00";

const totalTime = document.createElement("span");
totalTime.textContent = metadata.duration
  ? formatTime(track.duration)
  : "00:00";

progressTimes.appendChild(elapsedTime);
progressTimes.appendChild(totalTime);

progressContainer.appendChild(progressBar);

progressBarRef = progressBar;
elapsedTimeRef = elapsedTime;

infoDiv.appendChild(label);
infoDiv.appendChild(title);
infoDiv.appendChild(artist);
infoDiv.appendChild(program);
infoDiv.appendChild(progressContainer);
infoDiv.appendChild(progressTimes);
     
    card.appendChild(coverImg);
    card.appendChild(infoDiv);

    nowPlayingBox.appendChild(card);

    nowPlayingBox.style.opacity = 1;

    animationFrame = requestAnimationFrame(updateProgress);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
artist: track.artist,
album: track.album,
artwork: [
  {
    src: track.coverArt,
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
  } else if (trackDuration && progressBarRef) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
});
