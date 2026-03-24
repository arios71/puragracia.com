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
    if (elapsed < trackDuration - 5) return;
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
    nowPlayingBox.innerHTML = "";

    // CONTENEDOR PRINCIPAL CON BLUR
    const card = document.createElement("div");
    card.classList.add("now-card");

    // Fondo blur usando cover
    card.style.position = "relative";
    card.style.overflow = "hidden";
    card.style.borderRadius = "16px";
    card.style.background = `url('${finalCover}') center/cover no-repeat`;
    card.style.filter = "blur(15px) brightness(0.4)";
    
    // Capa encima del blur para contenido
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backdropFilter = "blur(0px)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.padding = "16px";
    overlay.style.boxSizing = "border-box";
    overlay.style.zIndex = "1";
    
    // IMAGEN REAL (delante)
    const coverImg = document.createElement("img");
    coverImg.src = finalCover;
    coverImg.alt = metadata.album || "Álbum";
    coverImg.style.width = "120px";
    coverImg.style.height = "120px";
    coverImg.style.borderRadius = "12px";
    coverImg.style.objectFit = "cover";
    coverImg.style.marginRight = "16px";
    coverImg.onerror = () => { coverImg.src = DEFAULT_COVER; };

    // CONTENEDOR INFO
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");
    infoDiv.style.color = "#ffffff";
    infoDiv.style.flex = "1";

    // LABEL
    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora:";
    label.style.fontSize = "0.9rem";
    label.style.opacity = "0.8";

    // TITLE
    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = metadata.title || "Sin título";
    title.style.fontSize = "1.2rem";
    title.style.fontWeight = "600";
    title.style.marginTop = "4px";

    // ARTIST
    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = metadata.artist || "Desconocido";
    artist.style.fontSize = "1rem";
    artist.style.opacity = "0.9";
    artist.style.marginTop = "2px";

    // 🎚️ EQUALIZER
    const equalizer = document.createElement("div");
    equalizer.classList.add("equalizer");
    equalizer.style.marginTop = "8px";
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("span");
      equalizer.appendChild(bar);
    }

    // ENSAMBLAR INFO
    infoDiv.appendChild(label);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    infoDiv.appendChild(equalizer);

    // ENSAMBLAR overlay
    overlay.appendChild(coverImg);
    overlay.appendChild(infoDiv);

    // ENSAMBLAR CARD
    card.appendChild(overlay);

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
