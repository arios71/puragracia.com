// Radio SPA Player: en vivo, pausa = detener, play = en vivo
const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');

let audioSrc = "https://playerservices.streamtheworld.com/api/livestream-redirect/SAM05AAC459_SC";

// Inicializa ondas pausadas
waves.forEach(w => w.style.animationPlayState = 'paused');

playBtn.addEventListener('click', async () => {
  try {
    if(audio.paused){
      audio.src = audioSrc;       // asegura que siempre cargue en vivo
      await audio.play();
      playBtn.textContent = '⏸ Pausar Radio';
      waves.forEach(w => w.style.animationPlayState = 'running');
    }else{
      audio.pause();
      audio.currentTime = 0;      // reinicia a tiempo real
      playBtn.textContent = '▶ Reproducir Radio';
      waves.forEach(w => w.style.animationPlayState = 'paused');
    }
  } catch(err){
    console.error('Error al reproducir audio:', err);
    alert('No se pudo reproducir el audio. Intenta en otro navegador o revisa tu conexión.');
  }
});

// SPA - navegación entre secciones
const links = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('.section');

links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.getAttribute('data-section');

    sections.forEach(sec => {
      if(sec.id === target){
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Scroll al inicio de la sección
    document.getElementById(target).scrollIntoView({behavior: 'smooth'});
  });
});