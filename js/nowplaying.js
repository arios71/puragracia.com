// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

// 🔒 CONTROL DE TRACK
let currentTrack = null;
let animationFrame = null;

// 🖼️ FALLBACK GLOBAL
const DEFAULT_COVER = "/default-cover.png";

// Normalizador
const normalize = (str) => (str || "").trim().toLowerCase();

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  if (!metadata) return;

  const rawTitle = (metadata.title || "").trim();
  const rawArtist = (metadata.artist || "").trim();
  if (!rawTitle) return;

  const track = {
    title: rawTitle,
    artist: rawArtist || "En vivo",
    coverArt: metadata.coverArt || DEFAULT_COVER,
  };

  const newTrackId = normalize(track.title) + "_" + normalize(track.artist);
  
  // Si es la misma canción, no hacemos nada para evitar parpadeos
  if (currentTrack === newTrackId) return;

  currentTrack = newTrackId;

  // 1. Buscamos o creamos el contenedor
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
    card.prepend(coverImg);
  }
  
  // Solo cambiamos si es distinto para evitar parpadeo
  if (coverImg.src !== track.coverArt) {
      coverImg.src = track.coverArt;
  }

  // 3. Actualizamos o creamos la info con las clases .title y .artist
  let infoDiv = card.querySelector(".now-info");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");
    card.appendChild(infoDiv);
  }
  
  // Inyectamos HTML con clases específicas para el CSS unificado
  infoDiv.innerHTML = `
    <div class="np-meta-viewport">
      <div class="np-meta-track">
        <div class="np-line title">${track.title}</div>
        <div class="np-line artist">${track.artist}</div>
      </div>
    </div>
  `;

  // MediaSession
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
    // Usamos Math.random() para romper cualquier caché intermedia del servidor o navegador
    const res = await fetch(
      `https://pg-radio-webhook.vercel.app/api/nowplaying?cb=${Math.random()}`
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
// Carga inicial
fetchNowPlaying();

// Refresco cada 15 segundos
setInterval(fetchNowPlaying, 15000);
