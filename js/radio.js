// -------------------------
// SPA Navigation
// -------------------------
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('header nav a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;
    sections.forEach(sec => {
      if (sec.id === target) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });
  });
});

// -------------------------
// Radio Player
// -------------------------
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');

function playLive() {
  // Siempre reproducir desde el vivo
  audio.src = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";
  audio.currentTime = 0;
  audio.play().catch(err => {
    console.error('Error al reproducir el audio:', err);
    alert('No se pudo reproducir el audio. Intenta otro navegador o revisa tu conexión.');
  });
  playBtn.textContent = '⏸ Pausar Radio';
  waves.forEach(w => w.style.animationPlayState = 'running');
}

function stopLive() {
  audio.pause();
  audio.src = "";
  playBtn.textContent = '▶ Reproducir Radio';
  waves.forEach(w => w.style.animationPlayState = 'paused');
}

playBtn.addEventListener('click', () => {
  if (audio.paused || audio.src === "") {
    playLive();
  } else {
    stopLive();
  }
});

// Iniciar ondas pausadas al cargar
waves.forEach(w => w.style.animationPlayState = 'paused');

// ID de los elementos en el recuadro
const nowArtist = document.getElementById('nowArtist');
const nowTitle = document.getElementById('nowTitle');
const nowAlbum = document.getElementById('nowAlbum');
const nowCover = document.getElementById('nowCover');

// Función para actualizar la metadata
function updateNowPlaying(data) {
  if (!data) return;
  nowArtist.textContent = `Artista: ${data.artist || '--'}`;
  nowTitle.textContent = `Canción: ${data.title || '--'}`;
  nowAlbum.textContent = `Álbum: ${data.album || '--'}`;
  nowCover.src = data.cover || 'https://via.placeholder.com/80';
}

// Conexión con tu webhook (Vercel o endpoint)
// Esto asume que el endpoint devuelve la metadata más reciente en JSON
// y que tu webhook la almacena en algún archivo o base de datos accesible
async function fetchNowPlaying() {
  try {
    const response = await fetch('https://tu-proyecto-vercel.vercel.app/nowplaying');
    if (!response.ok) throw new Error('No se pudo obtener metadata');
    const data = await response.json();
    updateNowPlaying(data);
  } catch (error) {
    console.error('Error al obtener Now Playing:', error);
  }
}

// Se puede usar setInterval si quieres refrescar cada cierto tiempo
// Pero como tu webhook envía solo cuando cambia la canción, se puede dejar manual o cada 15-30s
setInterval(fetchNowPlaying, 15000);

// Llamada inicial
fetchNowPlaying();
