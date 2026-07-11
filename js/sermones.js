(function() {
    // Usamos el proxy de Allorigins para saltar el CORS del XML directo de Anchor sin alterar el contenido
    const RSS_FEED_URL = "https://anchor.fm/s/dc304bfc/podcast/rss";
    const PROXY_API = `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_FEED_URL)}`;

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

    async function cargarPodcast() {
        vincularControles();
        try {
            // Buscamos el XML crudo directo
            const response = await fetch(PROXY_API);
            const xmlText = await response.text();
            
            // Parseamos el XML de forma nativa en el navegador
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            const items = xmlDoc.getElementsByTagName("item");
            
            if (items && items.length > 0) {
                const episodios = [];
                
                // Mapeamos el XML a un array limpio extrayendo los MP3 reales de las etiquetas <enclosure>
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const title = item.getElementsByTagName("title")[0]?.textContent || "Sermón sin título";
                    const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || "";
                    const enclosure = item.getElementsByTagName("enclosure")[0];
                    const mp3Url = enclosure ? enclosure.getAttribute("url") : "";
                    
                    // Imagen del podcast o del episodio
                    let thumbnail = xmlDoc.getElementsByTagName("image")[0]?.getElementsByTagName("url")[0]?.textContent || "/assets/icons/logo-192.png";
                    const itunesImage = item.getElementsByTagName("itunes:image")[0];
                    if (itunesImage) {
                        thumbnail = itunesImage.getAttribute("href") || thumbnail;
                    }

                    episodios.push({ title, pubDate, mp3Url, thumbnail });
                }

                // 1. Cargar el sermón más reciente en el Player Principal
                const primerEpisodio = episodios[0];
                console.log("--- SOLUCIÓN XML NATIVA ---");
                console.log("Sermón detectado legítimo:", primerEpisodio.title);
                console.log("URL de MP3 REAL extraída:", primerEpisodio.mp3Url);

                inyectarAudioSermon(primerEpisodio.title, primerEpisodio.mp3Url, false);
                
                // 2. Renderizar la lista histórica de episodios anteriores
                const archiveContainer = document.getElementById('sermons-archive-list');
                if (archiveContainer) {
                    archiveContainer.innerHTML = '';
                    const historial = episodios.slice(1);
                    
                    historial.forEach(item => {
                        const fecha = item.pubDate ? new Date(item.pubDate).toLocaleDateString('es-ES', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        }) : "Pura Gracia Radio";

                        const tarjeta = document.createElement('div');
                        tarjeta.style.cssText = "display: flex; align-items: center; background: #1a2436; padding: 12px; margin-bottom: 12px; border-radius: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;";
                        
                        tarjeta.onmouseenter = () => tarjeta.style.transform = "scale(1.01)";
                        tarjeta.onmouseleave = () => tarjeta.style.transform = "scale(1)";
                        
                        tarjeta.onclick = () => {
                            if (!item.mp3Url) {
                                alert("Este episodio no cuenta con un archivo de audio directo.");
                                return;
                            }
                            inyectarAudioSermon(item.title, item.mp3Url, true);
                            const seccionSermones = document.getElementById('sermones');
                            if (seccionSermones) seccionSermones.scrollTo({ top: 0, behavior: 'smooth' });
                        };

                        tarjeta.innerHTML = `
                            <img src="${item.thumbnail}" alt="Portada" style="width: 50px; height: 50px; border-radius: 6px; margin-right: 12px; object-fit: cover; flex-shrink: 0;">
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
            console.error("Error procesando XML del podcast:", error);
            marcarError();
        }
    }

    function inyectarAudioSermon(titulo, mp3Url, reproducirInmediatamente) {
        const titleEl = document.getElementById('custom-player-title');
        if (titleEl) titleEl.innerText = titulo;
        
        if (!mp3Url) {
            if (titleEl) titleEl.innerText = titulo + " (Audio no disponible)";
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
                            console.log("Reintentando play nativo alternativo sin crossorigin...");
                            sermonAudio.removeAttribute('crossorigin');
                            sermonAudio.load();
                            sermonAudio.play().then(() => {
                                if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause";
                            }).catch(err => console.log("Audio bloqueado:", err));
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
            if (sermonProgressBar) sermonProgressBar.style.width = `${percentage}%`;
            
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
        if (titleEl) titleEl.innerText = "Sermones temporalmente fuera de línea";
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarPodcast);
    } else {
        cargarPodcast();
    }
})();
