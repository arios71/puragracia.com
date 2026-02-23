// js/nowplaying.js

// Selecciona el contenedor donde se mostrará la metadata
const nowPlayingBox = document.getElementById("nowPlayingBox");

// Función que actualiza la metadata en el recuadro
function updateNowPlaying(metadata) {
  if (!metadata) return;

  // Limpiar contenido previo
  nowPlayingBox.innerHTML = "";

  // Imagen del álbum
  const coverImg = document.createElement("img");
  coverImg.src = metadata.coverArt;  // usa la URL que envía el webhook
  coverImg.alt = metadata.album || "Álbum";

  // Contenedor de info textual
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("nowInfo");

  const artistP = document.createElement("p");
  artistP.textContent = `🎤 ${metadata.artist}`;

  const titleP = document.createElement("p");
  titleP.textContent = `🎵 ${metadata.title}`;

  const albumP = document.createElement("p");
  albumP.textContent = `💿 ${metadata.album}`;

  infoDiv.appendChild(artistP);
  infoDiv.appendChild(titleP);
  infoDiv.appendChild(albumP);

  // Agregar imagen y texto al recuadro
  nowPlayingBox.appendChild(coverImg);
  nowPlayingBox.appendChild(infoDiv);
}

// Función que hace fetch a tu webhook y actualiza la metadata
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

// Llamada inicial y actualización periódica cada 15 segundos
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
