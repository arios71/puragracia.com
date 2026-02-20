const playBtn = document.getElementById('playRadio');
const audio = document.getElementById('radioAudio');
const waves = document.querySelectorAll('.wave');

if(playBtn){
  playBtn.addEventListener('click', async () => {
    try {
      if(audio.paused){
        await audio.play();
        playBtn.textContent = '⏸ Pausar Radio';
        waves.forEach(w => w.style.animationPlayState = 'running');
      }else{
        audio.pause();
        playBtn.textContent = '▶ Reproducir Radio';
        waves.forEach(w => w.style.animationPlayState = 'paused');
      }
    } catch(err){
      alert('No se pudo reproducir el audio.');
    }
  });

  waves.forEach(w => w.style.animationPlayState = 'paused');
}