// js/nowplaying.js
const nowPlayingBox = document.getElementById("nowPlayingBox");

let currentTrack = null;
const DEFAULT_COVER = "/default-cover.png";
const normalize = (str) => (str || "").trim().toLowerCase();

// Catálogo de programas para buscar carátulas si el webhook no envía ninguna
const PROGRAM_DATA = [
    { "name": "Lectura Pública Biblia", "artwork": "/data/caratulas/prog_001.jpg" },
    { "name": "Iglesia Evangélica de la Gracia", "artwork": "/data/caratulas/prog_002.jpg" },
    { "name": "Ruta 66", "artwork": "/data/caratulas/prog_003.jpg" },
    { "name": "Grace Community Church", "artwork": "/data/caratulas/prog_004.jpg" },
    { "name": "Coalición Podcast", "artwork": "/data/caratulas/prog_005.jpg" },
    { "name": "Renovando tu Mente", "artwork": "/data/caratulas/prog_006.jpg" },
    { "name": "A Través de la Biblia", "artwork": "/data/caratulas/prog_007.jpg" },
    { "name": "5 Minutos Historia de la Iglesia", "artwork": "/data/caratulas/prog_008.jpg" },
    { "name": "Deleite en la Palabra", "artwork": "/data/caratulas/prog_009.jpg" },
    { "name": "Aviva Nuestros Corazones", "artwork": "/data/caratulas/prog_010.jpg" },
    { "name": "Gracia a Vosotros", "artwork": "/data/caratulas/prog_011.jpg" },
    { "name": "Abre la Biblia", "artwork": "/data/caratulas/prog_012.jpg" },
    { "name": "Crianza Reverente", "artwork": "/data/caratulas/prog_013.jpg" },
    { "name": "Entendiendo los Tiempos", "artwork": "/data/caratulas/prog_014.jpg" },
    { "name": "Jungla Semántica", "artwork": "/data/caratulas/prog_015.jpg" },
    { "name": "Iglesia Bautista Internacional", "artwork": "/data/caratulas/prog_017.jpg" },
    { "name": "Iglesia Bíblica del Señor Jesucristo", "artwork": "/data/caratulas/prog_018.jpg" },
    { "name": "Bite Project", "artwork": "/data/caratulas/prog_019.jpg" },
    { "name": "Iglesia Gracia sobre Gracia", "artwork": "/data/caratulas/prog_020.jpg" },
    { "name": "Iglesia Gracia y Verdad", "artwork": "/data/caratulas/prog_021.jpg" },
    { "name": "Oye la Biblia", "artwork": "/data/caratulas/prog_022.jpg" },
    { "name": "Iglesia Bíblica Sola Gracia", "artwork": "/data/caratulas/prog_023.jpg" },
    { "name": "Iglesia Reforma", "artwork": "/data/caratulas/prog_024.jpg" },
    { "name": "Iglesia Bíblica Berea", "artwork": "/data/caratulas/prog_025.jpg" },
    { "name": "Iglesia del Centro", "artwork": "/data/caratulas/prog_026.jpg" },
    { "name": "Cursos Third Mill", "artwork": "/data/caratulas/prog_027.jpg" },
    { "name": "La Verdad en el Tubo de Ensayo", "artwork": "/data/caratulas/prog_028.jpg" },
    { "name": "Confesión y Verdad", "artwork": "/data/caratulas/prog_030.jpg" },
    { "name": "Iglesia Bíblica Gracia Verdadera", "artwork": "/data/caratulas/prog_031.jpg" },
    { "name": "Solid Joys en Español", "artwork": "/data/caratulas/prog_032.jpg" }
];

/* =========================
   UPDATE NOW PLAYING
========================= */
function updateNowPlaying(metadata) {
  const title = (metadata && metadata.title) ? metadata.title.trim() : "Pura Gracia Radio";
  const artist = (metadata && metadata.artist) ? metadata.artist.trim() : "Transmisión en vivo";
  
  // 2. Lógica de imagen: Webhook > Catálogo interno > Default
  const programaEncontrado = PROGRAM_DATA.find(p => p.name.toLowerCase() === title.toLowerCase());
  const coverArt = (metadata && metadata.coverArt && metadata.coverArt !== "") 
                   ? metadata.coverArt 
                   : (programaEncontrado ? programaEncontrado.artwork : DEFAULT_COVER);

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
    updateNowPlaying({ 
      title: "Pura Gracia Radio", 
      artist: "Transmisión en vivo", 
      coverArt: DEFAULT_COVER 
    });
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
