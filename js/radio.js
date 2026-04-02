// -------------------------
// SPA Navigation
// -------------------------
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('header nav a');

// ✅ Google Analytics - navegación SPA
function trackPage(pageName){
  if (typeof gtag !== "undefined") {
    gtag('event', 'page_view', {
      page_title: pageName,
      page_path: '/' + pageName
    });
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;

    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === target);
    });

    trackPage(target);
  });
});

// -------------------------
// Radio Player
// -------------------------
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const body = document.body;
const radioStatus = document.getElementById('radioStatus');

const STREAM_URL = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";

// Estado interno
let isPlaying = false;
let isUserStopping = false;

// ✅ NUEVO: control de tiempo escuchando
let listenTimer = null;
let hasCounted30s = false;

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
    body.classList.add('playing');
  } else {
    playBtn.textContent = '▶ Reproducir Radio';
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

  // limpiar timer
  clearTimeout(listenTimer);
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

  // ✅ Analytics play/pause
  if (typeof gtag !== "undefined") {
    gtag('event', 'play_radio', {
      event_category: 'radio',
      event_label: isPlaying ? 'pause' : 'play'
    });
  }
});

// -------------------------
// AUDIO EVENTS
// -------------------------

audio.addEventListener('play', () => {
  updateUIPlayingState(true);
  setStatus("🔴 En vivo", "live");

  // ✅ sesión iniciada
  if (typeof gtag !== "undefined") {
    gtag('event', 'radio_session_start');
  }

  // ✅ medir 30 segundos reales
  hasCounted30s = false;
  clearTimeout(listenTimer);

  listenTimer = setTimeout(() => {
    if (!hasCounted30s && !isUserStopping) {
      hasCounted30s = true;

      if (typeof gtag !== "undefined") {
        gtag('event', 'listened_30s');
      }
    }
  }, 30000);
});

audio.addEventListener('pause', () => {
  if (isUserStopping) {
    updateUIPlayingState(false);
    setStatus("Pausado");

    // ✅ sesión terminada
    if (typeof gtag !== "undefined") {
      gtag('event', 'radio_session_end');
    }
  }

  clearTimeout(listenTimer);
});

audio.addEventListener('ended', () => {
  updateUIPlayingState(false);
  setStatus("Pausado");
  clearTimeout(listenTimer);
});

// Error en stream
audio.addEventListener('error', () => {
  if (isUserStopping) return;

  console.error("Error en el stream");
  updateUIPlayingState(false);
  setStatus("Error de conexión", "error");

  clearTimeout(listenTimer);
});

// -------------------------
// PWA DETECTION
// -------------------------
function detectPWA(){
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isStandalone && typeof gtag !== "undefined") {
    gtag('event', 'pwa_used');
  }
}

detectPWA();

// -------------------------
// INIT
// -------------------------
updateUIPlayingState(false);
setStatus("");
