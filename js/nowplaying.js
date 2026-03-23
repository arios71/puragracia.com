// js/nowplaying.js

const nowPlayingBox = document.getElementById("nowPlayingBox");

function updateNowPlaying(metadata) {
  if (!metadata) return;

  // Fade out (transición suave)
  nowPlayingBox.style.opacity = 0;

  setTimeout(() => {

    nowPlayingBox.style.opacity = 0;

setTimeout(() => {
  nowPlayingBox.innerHTML = html;
  nowPlayingBox.style.opacity = 1;
}, 200);

    // IMAGEN
    const coverImg = document.createElement("img");
    coverImg.src = metadata.coverArt || "https://via.placeholder.com/150";
    coverImg.alt = metadata.album || "Álbum";

    // CONTENEDOR INFO
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("now-info");

    // LABEL
    const label = document.createElement("div");
    label.classList.add("now-label");
    label.textContent = "Ahora Suena:";

    // TITLE
    const title = document.createElement("div");
    title.classList.add("now-title");
    title.textContent = metadata.title || "Sin título";

    // ARTIST
    const artist = document.createElement("div");
    artist.classList.add("now-artist");
    artist.textContent = metadata.artist || "Desconocido";

    // 🎚️ EQUALIZER (BARRAS)
    const equalizer = document.createElement("div");
    equalizer.classList.add("equalizer");

    for (let i = 0; i < 5; i++) {
      const bar = document.createElement("span");
      equalizer.appendChild(bar);
    }

    // ARMAR TODO
    infoDiv.appendChild(label);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    infoDiv.appendChild(equalizer);

    nowPlayingBox.appendChild(coverImg);
    nowPlayingBox.appendChild(infoDiv);

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
