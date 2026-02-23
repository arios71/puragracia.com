// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

function updateNowPlaying(metadata) {
  if (!metadata) return;

  nowPlayingBox.innerHTML = "";

  const coverImg = document.createElement("img");
  coverImg.src = metadata.coverArt || "https://via.placeholder.com/80"; // <-- adaptado
  coverImg.alt = metadata.album || "Álbum";

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("nowInfo");

  const artistP = document.createElement("p");
  artistP.textContent = `🎤 ${metadata.artist || "Desconocido"}`;

  const titleP = document.createElement("p");
  titleP.textContent = `🎵 ${metadata.title || "Sin título"}`;

  const albumP = document.createElement("p");
  albumP.textContent = `💿 ${metadata.album || "Sin álbum"}`;

  infoDiv.appendChild(artistP);
  infoDiv.appendChild(titleP);
  infoDiv.appendChild(albumP);

  nowPlayingBox.appendChild(coverImg);
  nowPlayingBox.appendChild(infoDiv);
}

async function fetchNowPlaying() {
  try {
    const res = await fetch("https://pg-radio-webhook.vercel.app/api/nowplaying?_=" + new Date().getTime());
    if (!res.ok) throw new Error("No se pudo obtener metadata");
    const data = await res.json();
    updateNowPlaying(data);
  } catch (err) {
    console.error("Error cargando Now Playing:", err);
  }
}

fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
