// radio.js – Player SPA centralizado

const audio = document.getElementById('radioAudio');
const playBtn = document.getElementById('playRadio');
const waves = document.querySelectorAll('.wave');

// Función para reproducir/pausar audio en vivo
playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
      // Reinicia al momento en vivo
      audio.currentTime = 0;
      await audio.play();
      playBtn.textContent = '⏸ Pausar Radio';
      waves.forEach(w => w.style.animationPlayState = 'running');
    } else {
      audio.pause();
      playBtn.textContent = '▶ Reproducir Radio';
      waves.forEach(w => w.style.animationPlayState = 'paused');
    }
  } catch(err) {
    console.error('Error al reproducir audio:', err);
    alert('No se pudo reproducir el audio. Intenta en otro navegador o revisa tu conexión.');
  }
});

// Inicializa ondas pausadas
waves.forEach(w => w.style.animationPlayState = 'paused');

// SPA Navigation
const menuLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main .section');

menuLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('data-section');

    sections.forEach(sec => {
      if (sec.id === target) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });
  });
});