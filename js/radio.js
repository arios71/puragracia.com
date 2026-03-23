
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
      sec.classList.toggle('active', sec.id === target);
    });
  });
});

// -------------------------
// Radio Player
// -------------------------
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');
const body = document.body;

const STREAM_URL = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";

// Estado interno (source of truth)
let isPlaying = false;

// -------------------------
// UI UPDATE
// -------------------------
function updateUIPlayingState(state){
  isPlaying = state;

  if(state){
    playBtn.textContent = '⏸ Pausar Radio';
    waves.forEach(w => w.style.animationPlayState = 'running');
    body.classList.add('playing');
  } else {
    playBtn.textContent = '▶ Reproducir Radio';
    waves.forEach(w => w.style.animationPlayState = 'paused');
    body.classList.remove('playing');
  }
}

// -------------------------
// PLAY
// -------------------------
function playLive() {
  audio.src = STREAM_URL;
  audio.load();

  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.error('Error al reproducir:', err);
      alert('No se pudo reproducir el audio. Verifica conexión o permisos del navegador.');
      updateUIPlayingState(false);
    });
  }
}

// -------------------------
// PAUSE / STOP
// -------------------------
function stopLive() {
  audio.pause();
  audio.src = "";
}

// -------------------------
// BUTTON CLICK
// -------------------------
playBtn.addEventListener('click', () => {
  if (!isPlaying) {
    playLive();
  } else {
    stopLive();
  }
});

// -------------------------
// AUDIO EVENTS (SOURCE OF TRUTH)
// -------------------------

// Cuando realmente empieza a reproducir
audio.addEventListener('play', () => {
  updateUIPlayingState(true);
});

// Cuando se pausa
audio.addEventListener('pause', () => {
  updateUIPlayingState(false);
});

// Cuando termina (por seguridad)
audio.addEventListener('ended', () => {
  updateUIPlayingState(false);
});

// Cuando puede reproducir (buffer listo)
audio.addEventListener('canplay', () => {
  // opcional: podrías usar esto para indicadores
});

// Error en stream
audio.addEventListener('error', () => {
  console.error("Error en el stream");
  updateUIPlayingState(false);
  alert("Error en el stream. Intenta nuevamente.");
});

// -------------------------
// INIT
// -------------------------
updateUIPlayingState(false);
waves.forEach(w => w.style.animationPlayState = 'paused');
