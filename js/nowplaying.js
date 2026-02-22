// nowplaying.js

// Elementos del recuadro donde se mostrará la metadata
const nowArtist = document.getElementById('nowArtist');
const nowTitle = document.getElementById('nowTitle');
const nowAlbum = document.getElementById('nowAlbum');
const nowCover = document.getElementById('nowCover');

// Función para actualizar los elementos con la metadata recibida
function updateNowPlaying(data) {
  if (!data) return;
  nowArtist.textContent = `Artista: ${data.artist || '--'}`;
  nowTitle.textContent = `Canción: ${data.title || '--'}`;
  nowAlbum.textContent = `Álbum: ${data.album || '--'}`;
  nowCover.src = data.cover || 'https://via.placeholder.com/80';
}

// Función que obtiene la metadata desde tu webhook en Vercel
async function fetchNowPlaying() {
  try {
    const response = await fetch('https://tu-proyecto-vercel.vercel.app/nowplaying'); // <-- Pon aquí la URL de tu endpoint real
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    updateNowPlaying(data);
  } catch (error) {
    console.error('Error al obtener Now Playing:', error);
  }
}

// Opcional: refresco cada 10 segundos por si hay nueva canción
// Si tu webhook solo envía cuando cambia la canción, puedes quitar el setInterval
setInterval(fetchNowPlaying, 10000);

// Llamada inicial para mostrar metadata al cargar la página
fetchNowPlaying();