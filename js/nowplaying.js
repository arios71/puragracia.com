// nowplaying.js
// Selecciona el contenedor donde mostrar la metadata
const nowPlayingBox = document.getElementById('nowPlayingBox');

// Función para actualizar la información de la canción
function updateNowPlaying(metadata) {
  // Limpiamos contenido previo
  nowPlayingBox.innerHTML = '';

  // Crear imagen del álbum
  const cover = document.createElement('img');
  cover.src = metadata.cover || 'https://via.placeholder.com/80';
  cover.alt = metadata.album || 'Cover';
  
  // Crear contenedor de texto
  const info = document.createElement('div');
  info.className = 'nowInfo';
  
  const title = document.createElement('p');
  title.textContent = metadata.title || 'Título desconocido';
  
  const artist = document.createElement('p');
  artist.textContent = metadata.artist || 'Artista desconocido';
  
  const album = document.createElement('p');
  album.textContent = metadata.album || 'Álbum desconocido';
  
  // Añadir texto al contenedor
  info.appendChild(title);
  info.appendChild(artist);
  info.appendChild(album);
  
  // Añadir imagen y texto al recuadro
  nowPlayingBox.appendChild(cover);
  nowPlayingBox.appendChild(info);
}

// Si quieres hacer pruebas en local, puedes simular un JSON así:
const testMetadata = {
  title: "Canción de prueba",
  artist: "Antolin Maldonado",
  album: "Álbum Demo",
  cover: "https://via.placeholder.com/80"
};

// Para probar sin webhook:
updateNowPlaying(testMetadata);

// Aquí se puede agregar lógica de WebSocket o fetch a tu endpoint
// Si el webhook de Vercel almacena un JSON, puedes hacer fetch cada pocos segundos
// o usar SSE/WebSocket para actualizar en tiempo real