// js/nowplaying.js

// Contenedor donde se mostrará la metadata
const nowPlayingBox = document.getElementById("nowPlayingBox");

// Función para actualizar la metadata en pantalla
function updateNowPlaying(metadata) {
  if (!metadata) return;

  // Limpiar contenido anterior
  nowPlayingBox.innerHTML = "";

  // Crear imagen del álbum
  const coverImg = document.createElement("img");
  coverImg.src = metadata.coverArt || "https://via.placeholder.com/80"; // <-- adaptado
  coverImg.alt = metadata.album || "Álbum";

  // Crear contenedor de info textual
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

  // Añadir imagen y texto al recuadro
  nowPlayingBox.appendChild(coverImg);
  nowPlayingBox.appendChild(infoDiv);
}

// Función para obtener metadata desde tu webhook en Vercel
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

// Llamada inicial y luego cada 15 segundos
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
