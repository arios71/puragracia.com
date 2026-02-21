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
