// Elementos del player
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');

// Función para reproducir la radio desde vivo
async function playRadio() {
  try {
    // Siempre reinicia la URL para que esté en vivo
    audio.src = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";
    await audio.play();
    playBtn.textContent = '⏸ Detener Radio';
    waves.forEach(w => w.style.animationPlayState = 'running');
  } catch (err) {
    console.error('Error al reproducir audio:', err);
    alert('No se pudo reproducir el audio. Intenta en otro navegador o revisa tu conexión.');
  }
}

// Función para detener la radio
function stopRadio() {
  audio.pause();
  audio.currentTime = 0; // Reinicia al inicio (sincroniza con transmisión en vivo)
  playBtn.textContent = '▶ Reproducir Radio';
  waves.forEach(w => w.style.animationPlayState = 'paused');
}

// Botón play/stop
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    playRadio();
  } else {
    stopRadio();
  }
});

// Iniciar ondas pausadas al cargar
waves.forEach(w => w.style.animationPlayState = 'paused');

// SPA: manejar navegación entre secciones
const menuLinks = document.querySelectorAll('nav a[data-section]');
const sections = document.querySelectorAll('.section');

menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.section;
    sections.forEach(sec => sec.classList.remove('active'));
    const activeSection = document.getElementById(target);
    if(activeSection) activeSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});