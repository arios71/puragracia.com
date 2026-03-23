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
const radioStatus = document.getElementById('radioStatus');

const STREAM_URL = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";

// Estado interno
let isPlaying = false;

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
// AUDIO EVENTS
// -------------------------

audio.addEventListener('play', () => {
  updateUIPlayingState(true);
  setStatus("🔴 En vivo", "live");
});

audio.addEventListener('pause', () => {
  updateUIPlayingState(false);
  setStatus("Pausado");
});

audio.addEventListener('ended', () => {
  updateUIPlayingState(false);
  setStatus("Pausado");
});

// Error en stream (evitar falso positivo al hacer stop)
audio.addEventListener('error', () => {
  if (!audio.src) return;

  console.error("Error en el stream");
  updateUIPlayingState(false);
  setStatus("Error de conexión", "error");
});

// -------------------------
// INIT
// -------------------------
updateUIPlayingState(false);
waves.forEach(w => w.style.animationPlayState = 'paused');
setStatus("Listo para reproducir");
