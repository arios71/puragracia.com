// js/nowplaying.js

// Selecciona el contenedor donde se mostrará la metadata
const nowPlayingBox = document.getElementById("nowPlayingBox");

// Función para actualizar la metadata
function updateNowPlaying(metadata) {
  if (!metadata) return;

  // Limpiamos el contenido anterior
  nowPlayingBox.innerHTML = "";

  // Crear imagen del álbum
  const coverImg = document.createElement("img");
  coverImg.src = metadata.cover || "https://via.placeholder.com/80";
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

// ==== OPCIÓN 1: Escuchar cambios desde un endpoint JSON ====
// Aquí asumimos que tu webhook POSTea la metadata a un archivo JSON público en tu proyecto
// Por ejemplo: https://tu-dominio.vercel.app/nowplaying.json
// Se puede refrescar cada 10-15 segundos o cuando lo decidas

async function fetchNowPlaying() {
  try {
    const res = await fetch("/nowplaying.json?_=" + new Date().getTime());
    if (!res.ok) throw new Error("No se pudo obtener metadata");
    const data = await res.json();
    updateNowPlaying(data);
  } catch (err) {
    console.error("Error cargando Now Playing:", err);
  }
}

// Llamamos inmediatamente y luego cada 15s
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);

// ==== OPCIÓN 2: WebSocket o Server-Sent Events ====
// Si quieres que la metadata se actualice instantáneamente al cambiar la canción,
// lo ideal es implementar SSE o WebSocket desde tu endpoint del webhook.