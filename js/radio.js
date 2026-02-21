// radio.js
const playBtn = document.getElementById('playRadio');
const waves = document.querySelectorAll('.wave');

// Creamos un nuevo elemento <audio> cada vez que reproducimos
let audio = null;

playBtn.addEventListener('click', async () => {
  try {
    if (!audio) {
      // Crear audio nuevo para reproducción en vivo
      audio = new Audio("https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC");
      audio.autoplay = true;
      audio.play();
      playBtn.textContent = '⏸ Pausar Radio';
      waves.forEach(w => w.style.animationPlayState = 'running');
    } else if (!audio.paused) {
      // Pausar/detener el audio
      audio.pause();
      audio = null; // destruimos para que next play sea en vivo
      playBtn.textContent = '▶ Reproducir Radio';
      waves.forEach(w => w.style.animationPlayState = 'paused');
    }
  } catch (err) {
    console.error('Error al reproducir audio:', err);
    alert('No se pudo reproducir el audio. Intenta en otro navegador o revisa tu conexión.');
  }
});

// Iniciar ondas pausadas al cargar
waves.forEach(w => w.style.animationPlayState = 'paused');