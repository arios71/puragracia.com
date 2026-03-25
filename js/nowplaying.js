// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

// 🔒 CONTROL DE TRACK (ANTI-METADATA ADELANTADA)
let currentTrack = null;
let trackStartTime = 0;
let trackDuration = 0;

// 📅 SCHEDULE
let scheduleData = null;

// Normalizador
const normalize = (str) => (str || "").trim().toLowerCase();

/* =========================
   CARGAR SCHEDULE
========================= */
async function loadSchedule() {
  try {
    const res = await fetch('/data/schedule.json');
    scheduleData = await res.json();
  } catch (err) {
    console.error("Error cargando schedule:", err);
  }
}

/* =========================
   DETECTAR PROGRAMA ACTUAL
========================= */
function getCurrentProgram() {
  if (!scheduleData) return null;

  const now = new Date();

  const dayIndex = now.getDay();
  const dayKeys = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const dayKey = dayKeys[dayIndex];

  const programs = scheduleData[dayKey] || [];

  const currentTime = now.toTimeString().slice(0,5); // HH:MM

  return programs.find(program => {
    return currentTime >= program.start && currentTime < program.end;
  }) || null;
}

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const newTitle = metadata.title || "";
  const newArtist = metadata.artist || "";

  const newTrackId = normalize(newTitle) + "_" + normalize(newArtist);

  const duration = metadata.duration || metadata.length || 0;
  const now = Date.now();

  // Si es la misma pista → no hacer nada
  if (currentTrack === newTrackId) return;

  // Anti metadata adelantada
  if (currentTrack && trackDuration > 0) {
    const elapsed = (now - trackStartTime) / 1000;

    if (elapsed < trackDuration - 5) {
      return;
    }
  }

  // Aceptar cambio
  currentTrack = newTrackId;
  trackStartTime = now;
  trackDuration = duration;

  // Obtener programa actual
  const currentProgram = getCurrentProgram();

  // Fade out
  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {

    nowPlayingBox.innerHTML = "";

    // CONTENEDOR PRINCIPAL
    const card = document.createElement("div");
    card.classList.add("now-card");

    // IMAGEN
    const coverImg = document.createElement("img");
    coverImg.src = metadata.coverArt || "https://via.placeholder.com/150";
    coverImg.alt = metadata.album || "Álbum";

    // INFO
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    // LABEL PRINCIPAL
    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora:";

    // PROGRAMA (nuevo)
    if (currentProgram) {
      const programLabel = document.createElement("div");
      programLabel.classList.add("now-program");
      programLabel.textContent = "Programa: " + currentProgram.name;
      infoDiv.appendChild(programLabel);
    }

    // TITLE
    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = metadata.title || "Sin título";

    // ARTIST
    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = metadata.artist || "Desconocido";

    // EQUALIZER
    const equalizer = document.createElement("div");
    equalizer.classList.add("equalizer");

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("span");
      equalizer.appendChild(bar);
    }

    // ENSAMBLAR
    infoDiv.appendChild(label);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    infoDiv.appendChild(equalizer);

    card.appendChild(coverImg);
    card.appendChild(infoDiv);

    nowPlayingBox.appendChild(card);

    // MEDIA SESSION
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title || "Pura Gracia Radio",
        artist: metadata.artist || "En vivo",
        album: currentProgram ? currentProgram.name : "Pura Gracia Radio",
        artwork: [
          {
            src: metadata.coverArt || "/assets/icons/logo-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      });
    }

    nowPlayingBox.style.opacity = 1;

  }, 200);
}

/* =========================
   FETCH METADATA
========================= */
async function fetchNowPlaying() {
  try {
    const res = await fetch(
      "https://pg-radio-webhook.vercel.app/api/nowplaying?_=" + new Date().getTime()
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
loadSchedule();
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
