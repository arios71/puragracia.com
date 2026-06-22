// js/nowplaying.js
const nowPlayingBox = document.getElementById("nowPlayingBox");

let currentTrack = null;
const DEFAULT_COVER = "/default-cover.png";
const normalize = (str) => (str || "").trim().toLowerCase();

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  // Capturamos los 4 valores (Álbum y Duración ahora se incluyen)
  const title = (metadata && metadata.title) ? metadata.title.trim() : "Pura Gracia Radio";
  const artist = (metadata && metadata.artist) ? metadata.artist.trim() : "Transmisión en vivo";
  const album = (metadata && metadata.album) ? metadata.album.trim() : "";
  const duration = (metadata && metadata.duration) ? metadata.duration.trim() : "";
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

  // 2. Imagen
  let coverImg = card.querySelector("img");
  if (!coverImg) {
    coverImg = document.createElement("img");
    coverImg.onerror = () => { coverImg.src = DEFAULT_COVER; };
    card.prepend(coverImg);
  }
  if (coverImg.src !== coverArt) coverImg.src = coverArt;

  // 3. Info (Ahora con 4 líneas fijas y marquesina en el título)
  let infoDiv = card.querySelector(".now-info");
  if (!infoDiv) {
    infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");
    card.appendChild(infoDiv);
  }
  
  infoDiv.innerHTML = `
    <div class="np-meta-viewport">
      <div class="np-line title">${title}</div>
    </div>
    <div class="np-line artist">${artist}</div>
    <div class="np-line album">${album}</div>
    <div class="np-line duration">${duration}</div>
  `;

  // MediaSession actualizado
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: artist,
      album: album,
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
    updateNowPlaying({ 
      title: "Pura Gracia Radio", 
      artist: "Transmisión en vivo", 
      coverArt: DEFAULT_COVER 
    });
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
