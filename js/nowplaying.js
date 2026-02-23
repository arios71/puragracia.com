// Selecciona el contenedor donde se mostrará la metadata
const nowPlayingBox = document.getElementById("nowPlayingBox");

// Función para actualizar la metadata
function updateNowPlaying(metadata) {
  if (!metadata) return;

  // Limpiar contenido previo
  nowPlayingBox.innerHTML = "";

  // Imagen del álbum: fallback a local placeholder
  const coverImg = document.createElement("img");
  coverImg.src = metadata.coverArt || "assets/placeholder.png"; // <-- placeholder local
  coverImg.alt = metadata.album || "Álbum";

  // Contenedor de info textual
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("nowInfo");

  const artistP = document.createElement("p");
  artistP.textContent = `🎤 ${metadata.artist || "Cargando..."}`;

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

// Fetch desde el webhook en Vercel
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
    // Fallback a placeholders locales si falla fetch
    updateNowPlaying({
      title: "Cargando...",
      artist: "",
      album: "",
      coverArt: "assets/placeholder.png"
    });
  }
}

// Llamada inicial y actualización cada 15 segundos
fetchNowPlaying();
setInterval(fetchNowPlaying, 15000);
