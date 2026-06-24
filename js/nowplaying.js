// js/nowplaying.js
const nowPlayingBox = document.getElementById("nowPlayingBox");

let currentTrack = null;
const DEFAULT_COVER = "/default-cover.png"; // Asegúrate de que esta ruta sea correcta
const normalize = (str) => (str || "").trim().toLowerCase();

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  // 🛡️ Si no hay título, mostramos valores por defecto en lugar de cancelar
  const title = (metadata && metadata.title) ? metadata.title.trim() : "Pura Gracia Radio";
  const artist = (metadata && metadata.artist) ? metadata.artist.trim() : "Transmisión en vivo";
  const coverArt = (metadata && metadata.coverArt) ? metadata.coverArt : DEFAULT_COVER;

  const newTrackId = normalize(title) + "_" + normalize(artist);
  if (currentTrack === newTrackId) return;
  currentTrack = newTrackId;

  // 1. Aseguramos contenedor
  let card = nowPlayingBox.querySelector(".now-card");
  if (!card) {
    card = document.createElement("div");
    card.classList.add("now-card");
    nowPlayingBox.appendChild(card);
  }

  // 2. Imagen (Usa DEFAULT_COVER si falla la carga o si no hay metadata)
  let coverImg = card.querySelector("img");
  if (!coverImg) {
    coverImg = document.createElement("img");
    coverImg.onerror = () => { coverImg.src = DEFAULT_COVER; }; // Si la imagen da error, ponemos la default
    card.prepend(coverImg);
  }
  
  if (coverImg.src !== coverArt) {
    coverImg.src = coverArt;
  }

  // 3. Info
  let infoDiv = card.querySelector(".now-info");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");
    card.appendChild(infoDiv);
  }
  
  infoDiv.innerHTML = `
    infoDiv.innerHTML = `
    <div class="np-meta-viewport">
      <div class="marquee-container">
        <div class="np-line title marquee">${title}</div>
      </div>
      <div class="np-line artist">${artist}</div>
    </div>
  `;

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: artist,
      artwork: [{ src: coverArt, sizes: "512x512", type: "image/png" }],
    });
  }
}

/* =========================
   FETCH METADATA
========================= */
async function fetchNowPlaying() {
  try {
    const res = await fetch(`https://pg-radio-webhook.vercel.app/api/nowplaying?cb=${Math.random()}`);
    if (!res.ok) throw new Error("Servidor no responde");
    const data = await res.json();
    updateNowPlaying(data);
  } catch (err) {
    console.warn("Error cargando metadata, usando estado por defecto:", err);
    // 🛡️ Si falla el fetch, mostramos los valores por defecto
    updateNowPlaying({ 
      title: "Pura Gracia Radio", 
      artist: "Transmisión en vivo", 
      coverArt: DEFAULT_COVER 
    });
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
