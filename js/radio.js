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
const waves = document.querySelectorAll('.equalizer span');
const body = document.body;
const radioStatus = document.getElementById('radioStatus');

const STREAM_URL = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";

// Estado interno
let isPlaying = false;
let isUserStopping = false;

// -------------------------
// STATUS UI
// -------------------------
function setStatus(text, type = ""){
  if (!radioStatus) return;

  radioStatus.textContent = text;
  radioStatus.className = "radio-status";

  if(type){
    radioStatus.classList.add(type);
  }
}

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
  isUserStopping = false;

  setStatus("Conectando...", "loading");

  audio.src = STREAM_URL;
  audio.load();

  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(err => {
      console.error('Error al reproducir:', err);
      setStatus("No se pudo reproducir", "error");
      updateUIPlayingState(false);
    });
  }
}

// -------------------------
// PAUSE / STOP
// -------------------------
function stopLive() {
  isUserStopping = true;

  audio.pause();

  // IMPORTANTE: no limpiar src para evitar error falso del stream
  // audio.src = "";  ❌ esto causaba el error
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
// AUDIO EVENTS
// -------------------------

audio.addEventListener('play', () => {
  updateUIPlayingState(true);
  setStatus("🔴 En vivo", "live");
});

audio.addEventListener('pause', () => {
  // Si el usuario pausó manualmente → no mostrar error
  if (isUserStopping) {
    updateUIPlayingState(false);
    setStatus("Pausado");
  }
});

audio.addEventListener('ended', () => {
  updateUIPlayingState(false);
  setStatus("Pausado");
});

// Error en stream (solo si NO fue pausa manual)
audio.addEventListener('error', () => {
  if (isUserStopping) return;

  console.error("Error en el stream");
  updateUIPlayingState(false);
  setStatus("Error de conexión", "error");
});

// -------------------------
// INIT
// -------------------------
updateUIPlayingState(false);

// NO mostrar texto permanente
setStatus("");
