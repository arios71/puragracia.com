(function() {
    // Apuntamos directamente al feed real de Anchor sin intermediarios defectuosos
    const RSS_FEED_URL = "https://anchor.fm/s/dc304bfc/podcast/rss";

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
            const response = await fetch(RSS_FEED_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            
            if (items && items.length > 0) {
                const episodios = [];
                
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const title = item.getElementsByTagName("title")[0]?.textContent || "Sermón sin título";
                    const pubDate = item.getElementsByTagName("pubDate")[0]?.textContent || "";
                    const enclosure = item.getElementsByTagName("enclosure")[0];
                    const mp3Url = enclosure ? enclosure.getAttribute("url") : "";
                    
                    let thumbnail = xmlDoc.getElementsByTagName("image")[0]?.getElementsByTagName("url")[0]?.textContent || "/assets/icons/logo-192.png";
                    const itunesImage = item.getElementsByTagName("itunes:image")[0];
                    if (itunesImage) {
                        thumbnail = itunesImage.getAttribute("href") || thumbnail;
                    }

                    const asegurarHttps = (url) => url && url.startsWith("http://") ? url.replace("http://", "https://") : url;

                    // Guardamos el episodio aunque no tenga audio aún, para mostrar el título, pero registramos si es válido
                    episodios.push({ 
                        title, 
                        pubDate, 
                        mp3Url: mp3Url ? asegurarHttps(mp3Url) : "", 
                        thumbnail: asegurarHttps(thumbnail) 
                    });
                }

                // 1. ASIGNACIÓN INTELIGENTE DEL PLAYER PRINCIPAL
                // Buscamos el primer episodio de la lista que SÍ tenga un MP3 real listo
                let episodioParaPlayer = episodios.find(ep => ep.mp3Url !== "");
                
                // Si por alguna razón ninguno tiene (raro), usamos el primero por defecto
                if (!episodioParaPlayer) episodioParaPlayer = episodios[0];

                console.log("--- CONTROL DE AUDIO PRINCIPAL ---");
                console.log("Episodio asignado al Player Principal:", episodioParaPlayer.title);
                console.log("URL Real:", episodioParaPlayer.mp3Url || "Ninguna disponible");

                inyectarAudioSermon(episodioParaPlayer.title, episodioParaPlayer.mp3Url, false);
                
                // 2. Renderizar la lista histórica de episodios anteriores
                const archiveContainer = document.getElementById('sermons-archive-list');
                if (archiveContainer) {
                    archiveContainer.innerHTML = '';
                    
                    // Mostramos todos en el historial
                    episodios.forEach(item => {
                        const fecha = item.pubDate ? new Date(item.pubDate).toLocaleDateString('es-ES', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        }) : "Pura Gracia Radio";

                        const tarjeta = document.createElement('div');
                        tarjeta.style.cssText = "display: flex; align-items: center; background: #1a2436; padding: 12px; margin-bottom: 12px; border-radius: 8px; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;";
                        
                        tarjeta.onmouseenter = () => tarjeta.style.transform = "scale(1.01)";
                        tarjeta.onmouseleave = () => tarjeta.style.transform = "scale(1)";
                        
                        tarjeta.onclick = () => {
                            if (!item.mp3Url) {
                                alert("Este episodio aún se está procesando en las plataformas de distribución y no tiene el archivo de audio listo.");
                                return;
                            }
                            inyectarAudioSermon(item.title, item.mp3Url, true);
                            const seccionSermones = document.getElementById('sermones');
                            if (seccionSermones) seccionSermones.scrollTo({ top: 0, behavior: 'smooth' });
                        };

                        // Si el audio no está listo, le ponemos un tono opaco visualmente
                        const estiloTexto = item.mp3Url ? "color: #ffffff;" : "color: #718096; font-style: italic;";

                        tarjeta.innerHTML = `
                            <img src="${item.thumbnail}" alt="Portada" style="width: 50px; height: 50px; border-radius: 6px; margin-right: 12px; object-fit: cover; flex-shrink: 0; ${!item.mp3Url ? 'opacity: 0.5;' : ''}">
                            <div style="flex-grow: 1; min-width: 0; text-align: left;">
                                <h4 style="${estiloTexto} margin: 0 0 4px 0; font-size: 0.95rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                                    ${item.title} ${!item.mp3Url ? ' (Procesando)' : ''}
                                </h4>
                                <span style="color: #a0aec0; font-size: 0.8rem; display: block;">
                                    ${fecha}
                                </span>
                            </div>
                            <div style="color: ${item.mp3Url ? '#fbac33' : '#4a5568'}; padding-left: 8px; display: flex; align-items: center; flex-shrink: 0;">
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
            console.error("Error procesando XML directo del podcast:", error);
            marcarError();
        }
    }

                if (episodios.length === 0) {
                    marcarError();
                    return;
                }

                // 1. Cargar el sermón más reciente en el Player Principal
                const primerEpisodio = episodios[0];
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
            console.error("Error procesando XML directo del podcast:", error);
            marcarError();
        }
    }

    function inyectarAudioSermon(titulo, mp3Url, reproducirInmediatamente) {
        const titleEl = document.getElementById('custom-player-title');
        if (titleEl) titleEl.innerText = titulo;
        
        if (sermonAudio && mp3Url) {
            sermonAudio.pause();
            sermonAudio.removeAttribute('src'); 
            sermonAudio.load();
            
            sermonAudio.src = mp3Url;
            sermonAudio.load();
            
            if (reproducirInmediatamente) {
                setTimeout(() => {
                    sermonAudio.play()
                        .then(() => { if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause"; })
                        .catch(e => {
                            sermonAudio.removeAttribute('crossorigin');
                            sermonAudio.load();
                            sermonAudio.play().then(() => {
                                if (sermonPlayIcon) sermonPlayIcon.className = "fas fa-pause";
                            }).catch(err => console.log("Reproducción bloqueada:", err));
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
        if (titleEl) titleEl.innerText = "Sermones temporalmente no disponibles";
    }

    // Asegurar ejecución limpia esperando al DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cargarPodcast);
    } else {
        cargarPodcast();
    }
})();
