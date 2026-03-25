// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

// 🔒 CONTROL DE TRACK (ANTI-METADATA ADELANTADA)
let currentTrack = null;
let trackStartTime = 0;
let trackDuration = 0;

// 🖼️ FALLBACK GLOBAL
const DEFAULT_COVER = "/default-cover.png";

// Normalizador
const normalize = (str) => (str || "").trim().toLowerCase();

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

  // Anti metadata adelantada
  if (currentTrack && trackDuration > 0) {
    const elapsed = (now - trackStartTime) / 1000;
    if (elapsed < trackDuration - 5) {
      return;
    }
  }

  // Evitar duplicación
  if (currentTrack === newTrackId) return;

  // Aceptar cambio
  currentTrack = newTrackId;
  trackStartTime = now;
  trackDuration = duration;

  // Fade out
  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {
    nowPlayingBox.innerHTML = "";

    // CONTENEDOR PRINCIPAL
    const card = document.createElement("div");
    card.classList.add("now-card");

    // IMAGEN
    const coverImg = document.createElement("img");
    coverImg.src = metadata.coverArt || DEFAULT_COVER;
    if (!metadata.coverArt) {
      coverImg.classList.add("default-cover");
    }
    coverImg.alt = metadata.album || "Álbum";

    // INFO
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    // LABEL GENERAL
    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora";

    // TEXTO CANCIÓN
    const titleText = metadata.title || "";
    const artistText = metadata.artist || "";
    const trackText = (artistText || titleText) ? `${artistText}${artistText && titleText ? " - " : ""}${titleText}` : "";

    // 🎯 TÍTULO PRINCIPAL
    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = trackText || "En vivo";

    // 🎧 SUBTÍTULO
    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = ""; // oculto, ya no depende de schedule
    artist.style.display = "none";

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

    // 🎧 MEDIA SESSION
    if ('mediaSession' in navigator) {
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
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
