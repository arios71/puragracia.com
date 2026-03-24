// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

// 🔒 CONTROL DE TRACK (ANTI-METADATA ADELANTADA)
let currentTrack = null;
let trackStartTime = 0;
let trackDuration = 0;

// Normalizador para evitar falsos cambios
const normalize = (str) => (str || "").trim().toLowerCase();

// 🎨 Imagen por defecto (PNG transparente en branding)
const DEFAULT_COVER = "/assets/branding/default-cover.png";

function updateNowPlaying(metadata) {
  if (!metadata) return;

  const newTitle = metadata.title || "";
  const newArtist = metadata.artist || "";

  const newTrackId = normalize(newTitle) + "_" + normalize(newArtist);

  const duration = metadata.duration || metadata.length || 0;
  const now = Date.now();

  // Si es la misma pista → no hacer nada
  if (currentTrack === newTrackId) return;

  // Validación contra metadata adelantada
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

  // Validación de cover
  const rawCover = (metadata.coverArt || "").trim();

  const isValidCover =
    rawCover &&
    rawCover !== "null" &&
    rawCover !== "undefined" &&
    !rawCover.includes("placeholder");

  const finalCover = isValidCover ? rawCover : DEFAULT_COVER;

  // Fade out
  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {

    // Limpiar contenido anterior
    nowPlayingBox.innerHTML = "";

    // CONTENEDOR PRINCIPAL
    const card = document.createElement("div");
    card.classList.add("now-card");

    // IMAGEN
    const coverImg = document.createElement("img");
    coverImg.src = finalCover;
    coverImg.alt = metadata.album || "Álbum";

    // Fallback si la imagen falla
    coverImg.onerror = () => {
      coverImg.src = DEFAULT_COVER;
    };

    // CONTENEDOR INFO
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    // LABEL
    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora:";

    // TITLE
    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = metadata.title || "Sin título";

    // ARTIST
    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = metadata.artist || "Desconocido";

    // 🎚️ EQUALIZER
    const equalizer = document.createElement("div");
    equalizer.classList.add("equalizer");

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("span");
      equalizer.appendChild(bar);
    }

    // ENSAMBLAR INFO
    infoDiv.appendChild(label);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    infoDiv.appendChild(equalizer);

    // ENSAMBLAR CARD
    card.appendChild(coverImg);
    card.appendChild(infoDiv);

    // INSERTAR EN DOM
    nowPlayingBox.appendChild(card);

    // ================= MEDIA SESSION =================
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title || "Pura Gracia Radio",
        artist: metadata.artist || "En vivo",
        album: "Pura Gracia Radio",
        artwork: [
          {
            src: finalCover,
            sizes: "512x512",
            type: "image/png"
          }
        ]
      });
    }

    // Fade in
    nowPlayingBox.style.opacity = 1;

  }, 200);
}

// FETCH
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

// INIT
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
