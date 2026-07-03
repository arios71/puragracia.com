// js/nowplaying.js
const nowPlayingBox = document.getElementById("nowPlayingBox");
const DEFAULT_COVER = "/default-cover.png";
const SLOGAN = "Música y contenido en sintonía con el evangelio de Cristo"; 
let currentTrack = null;
let programsList = [];

async function loadPrograms() {
    try {
        const response = await fetch('/data/programs.json');
        const data = await response.json();
        programsList = data.programs;
        console.log("Catálogo de programas cargado:", programsList.length);
    } catch (err) {
        console.error("No se pudo cargar el catálogo de programas:", err);
    }
}

function updateNowPlaying(metadata) {
    // 1. Definimos los textos
    const title = (metadata && metadata.title && metadata.title.trim() !== "") ? metadata.title.trim() : "Pura Gracia Radio";
    
    // Lógica del eslogan: si el título es el default, usamos el SLOGAN.
    const artist = (title === "Pura Gracia Radio") 
                   ? SLOGAN 
                   : ((metadata && metadata.artist) ? metadata.artist.trim() : "");
    
    const album = (metadata && metadata.album) ? metadata.album.trim() : "";
    
    const prog = programsList.find(p => 
        title.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(title.toLowerCase()) ||
        (album && album.toLowerCase().includes(p.name.toLowerCase())) ||
        (album && p.name.toLowerCase().includes(album.toLowerCase()))
    );

    const coverArt = (metadata && metadata.coverArt && metadata.coverArt !== "") 
                     ? metadata.coverArt 
                     : (prog ? prog.artwork : DEFAULT_COVER);

    const newTrackId = `${title}_${artist}_${album}`.toLowerCase();
    if (currentTrack === newTrackId) return;
    currentTrack = newTrackId;

    // 2. Construcción de la UI
    let card = nowPlayingBox.querySelector(".now-card") || document.createElement("div");
    card.className = "now-card";
    if (!nowPlayingBox.contains(card)) nowPlayingBox.appendChild(card);

    let coverImg = card.querySelector("img") || document.createElement("img");
    coverImg.onerror = () => { coverImg.src = DEFAULT_COVER; };
    coverImg.src = coverArt;
    if (!card.contains(coverImg)) card.prepend(coverImg);

    let infoDiv = card.querySelector(".now-info") || document.createElement("div");
    infoDiv.className = "now-info";
    
    infoDiv.innerHTML = `
        <div class="np-meta-viewport">
            <div class="marquee-container"><div class="np-line title marquee">${title}</div></div>
            <div class="np-line artist">${artist}</div>
            ${album ? `<div class="np-line album">${album}</div>` : ""}
        </div>
    `;
    if (!card.contains(infoDiv)) card.appendChild(infoDiv);

    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title, artist, album, artwork: [{ src: coverArt, sizes: "512x512", type: "image/png" }] });
    }
}

async function fetchNowPlaying() {
    try {
        const res = await fetch(`https://pg-radio-webhook.vercel.app/api/nowplaying?cb=${Math.random()}`);
        const data = await res.json();
        updateNowPlaying(data);
    } catch (err) {
        // Al enviar solo el título default, la función updateNowPlaying 
        // detectará que debe mostrar el eslogan automáticamente.
        updateNowPlaying({ title: "Pura Gracia Radio" });
    }
}

// Inicialización
loadPrograms().then(fetchNowPlaying);
setInterval(fetchNowPlaying, 15000);
