// radio.js para player.html
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');

// Reproducir / Pausar
playBtn.addEventListener('click', async () => {
  try {
    if (audio.paused) {
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

// Inicializar ondas pausadas
waves.forEach(w => w.style.animationPlayState = 'paused');
