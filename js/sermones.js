(function() {
    const RSS_FEED_URL = "https://anchor.fm/s/dc304bfc/podcast/rss";
    const CONVERTER_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

    let sermonAudio, sermonPlayBtn, sermonPlayIcon, sermonProgressBar, sermonProgressContainer, sermonTimeDisplay;

    function vincularControles() {
        sermonAudio = document.getElementById('audioSermonPlayer');
        sermonPlayBtn = document.getElementById('custom-play-btn');
        sermonPlayIcon = document.getElementById('custom-play-icon');
        sermonProgressBar = document.getElementById('custom-progress-bar');
        sermonProgressContainer = document.getElementById('custom-progress-container');
        sermonTimeDisplay = document.getElementById('custom-player-time');

        if (sermonPlayBtn && sermonAudio && sermonProgressContainer) {
            sermonPlayBtn.onclick = togglePlaySermon;
            sermonAudio.ontimeupdate = actualizarProgresoSermon;
            sermonProgressContainer.onclick = buscarTiempoSermon;
            sermonAudio.onended = () => { if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-play"; };
        }
    }

    // Función auxiliar para extraer una URL multimedia real y limpiar basura
    function obtenerUrlAudioValida(item) {
        let candidatos = [];
        
        if (item.enclosure && item.enclosure.url) candidatos.push(item.enclosure.url);
        if (item.link) candidatos.push(item.link);
        if (item.guid && item.guid.startsWith("http")) candidatos.push(item.guid);

        for (let url of candidatos) {
            if (url && typeof url === 'string') {
                url = url.trim();
                // Si contiene la URL de prueba de googleusercontent o spotify genérico, descartar
                if (url.includes("googleusercontent.com") || url.includes("spotify.com/3") || url.includes("spotify.com/2")) {
                    continue; 
                }
                // Si pasa los filtros, devolvemos esta
                return url;
            }
        }
        return ""; // No se encontró URL válida
    }

    async function cargarPodcast() {
        vincularControles();
        try {
            const response = await fetch(CONVERTER_API);
            const data = await response.json();
            
            if (data.status === 'ok' && data.items && data.items.length > 0) {
                const episodios = data.items;
                
                // 1. Cargar el sermón más reciente en el Player Principal
                const primerEpisodio = episodios[0];
                const urlMasReciente = obtenerUrlAudioValida(primerEpisodio);
                
                console.log("URL detectada para el sermón más reciente:", urlMasReciente);
                inyectarAudioSermon(primerEpisodio.title, urlMasReciente, false);
                
                // 2. Renderizar la lista histórica de episodios anteriores
                const archiveContainer = document.getElementById('sermons-archive-list');
                if (archiveContainer) {
                    archiveContainer.innerHTML = '';
                    const historial = episodios.slice(1);
                    
                    historial.forEach(item => {
                        const fecha = item.pubDate ? new Date(item.pubDate).toLocaleDateString('es-ES', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        }) : "Pura Gracia Radio";

                        const urlEpisodio = obtenerUrlAudioValida(item);

                        const tarjeta = document.createElement('div');
                        tarjeta.style.cssText = "display: flex; align-items: center; background: #1a2436; padding: 12px; margin-bottom: 12px; border-radius: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;";
                        
                        tarjeta.onmouseenter = () => tarjeta.style.transform = "scale(1.01)";
                        tarjeta.onmouseleave = () => tarjeta.style.transform = "scale(1)";
                        
                        tarjeta.onclick = () => {
                            if (!urlEpisodio) {
                                alert("Este episodio no tiene un archivo de audio directo reproducible en la web.");
                                return;
                            }
                            console.log("Cargando desde el historial el episodio:", item.title, "URL:", urlEpisodio);
                            inyectarAudioSermon(item.title, urlEpisodio, true);
                            const seccionSermones = document.getElementById('sermones');
                            if (seccionSermones) seccionSermones.scrollTo({ top: 0, behavior: 'smooth' });
                        };

                        tarjeta.innerHTML = `
                            <img src="${item.thumbnail || (data.feed && data.feed.image) || '/assets/icons/logo-192.png'}" alt="Portada" style="width: 50px; height: 50px; border-radius: 6px; margin-right: 12px; object-fit: cover; flex-shrink: 0;">
                            <div style="flex-grow: 1; min-width: 0; text-align: left;">
                                <h4 style="color: #ffffff; margin: 0 0 4px 0; font-size: 0.95rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                                    ${item.title}
                                </h4>
                                <span style="color: #a0aec0; font-size: 0.8rem; display: block;">
                                    ${fecha}
                                </span>
                            </div>
                            <div style="color: #fbac33; padding-left: 8px; display: flex; align-items: center; flex-shrink: 0;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                            </div>
                        `;
                        archiveContainer.appendChild(tarjeta);
                    });
                }
            } else {
                marcarError();
            }
        } catch (error) {
            console.error("Error procesando podcast:", error);
            marcarError();
        }
    }

    function inyectarAudioSermon(titulo, mp3Url, reproducirInmediatamente) {
        const titleEl = document.getElementById('custom-player-title');
        if (titleEl) titleEl.innerText = titulo;
        
        if (!mp3Url) {
            console.warn("Llamada a inyectarAudioSermon cancelada: URL vacía o filtrada.");
            return;
        }

        if (sermonAudio) {
            sermonAudio.pause();
            
            let urlSegura = mp3Url.trim();
            if (urlSegura.startsWith("http://")) {
                urlSegura = urlSegura.replace("http://", "https://");
            }
            
            sermonAudio.removeAttribute('src'); 
            sermonAudio.load();
            
            sermonAudio.src = urlSegura;
            sermonAudio.load();
            
            if (reproducirInmediatamente) {
                setTimeout(() => {
                    sermonAudio.play()
                        .then(() => { 
                            if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause"; 
                        })
                        .catch(e => {
                            console.error("Fallo inicial CORS, probando sin cabecera crossorigin:", e);
                            sermonAudio.removeAttribute('crossorigin');
                            sermonAudio.load();
                            sermonAudio.play().then(() => {
                                if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause";
                            }).catch(err => console.log("Reproducción totalmente bloqueada en este navegador:", err));
                        });
                }, 200);
            } else {
                if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-play";
            }
        }
    }

    function togglePlaySermon() {
        if (!sermonAudio || !sermonAudio.src) return;
        
        if (sermonAudio.paused) {
            try {
                const radioAudioEl = document.getElementById('radioAudio');
                if (radioAudioEl && !radioAudioEl.paused) {
                    radioAudioEl.pause();
                    const radioIcon = document.getElementById('playIcon');
                    if (radioIcon) radioIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
                }
            } catch(e) {}

            sermonAudio.play()
                .then(() => { if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause"; })
                .catch(() => {
                    sermonAudio.load();
                    sermonAudio.play().then(() => { if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause"; });
                });
        } else {
            sermonAudio.pause();
            if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-play";
        }
    }

    function actualizarProgresoSermon() {
        if (sermonAudio && sermonAudio.duration) {
            const porcentaje = (sermonAudio.currentTime / sermonAudio.duration) * 100;
            if (sermonProgressBar) sermonProgressBar.style.width = `${porcentaje}%`;
            
            const mins = Math.floor(sermonAudio.currentTime / 60);
            const secs = Math.floor(sermonAudio.currentTime % 60).toString().padStart(2, '0');
            if (sermonTimeDisplay) sermonTimeDisplay.innerText = `${mins}:${secs}`;
        }
    }

    function buscarTiempoSermon(e) {
        if (!sermonAudio || !sermonProgressContainer) return;
        const width = sermonProgressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = sermonAudio.duration;
        if (duration) {
            sermonAudio.currentTime = (clickX / width) * duration;
        }
    }

    function marcarError() {
        const titleEl = document.getElementById('custom-player-title');
        if (titleEl) titleEl.innerText = "Sermones no disponibles en este momento";
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarPodcast);
    } else {
        cargarPodcast();
    }
})();
