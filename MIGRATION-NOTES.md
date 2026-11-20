# Migración RadioBOSS — rama de lanzamiento

## Estado general

- Rama de trabajo: `migracion-radioboss`.
- La última comparación con `main` confirmó 31 commits por delante y 0 por detrás antes de esta actualización de notas; consultar GitHub para el conteo vigente.
- El usuario aprobó la PWA probada en Vercel, incluyendo reproducción, sección de artículos, apertura de artículos y acceso al panel editorial.
- La implementación de RadioBOSS y el panel editorial se conservan; no alterar la lógica de metadata ya validada.
- El dominio público todavía no se ha cambiado de proveedor/DNS. La publicación bajo `www.puragracia.com` requiere completar la asignación del dominio en Vercel y actualizar los registros DNS en el proveedor del dominio.

## RadioBOSS y API

- Stream: `https://c23.radioboss.fm/stream/296`.
- Endpoint consumido por la PWA: `https://puragracia-radio-api-nine.vercel.app/api/radioboss-nowplaying`.
- Proyecto Vercel: `puragracia-radio-api`, vinculado al repositorio `arios71/puragracia.com`.
- La clave de RadioBOSS se utiliza únicamente en el backend mediante `RADIOBOSS_API_URL` y `RADIOBOSS_API_KEY`; no se expone al navegador.
- Las variables están configuradas para Production y Preview. No documentar sus valores.
- Se mantiene el filtro de carpetas de producción: Jingles, Station ID, Stingers y Sweepers.
- CORS permite explícitamente `https://www.puragracia.com`, `https://puragracia.com`, `https://arios71.github.io` y el origen de preview Vercel utilizado en la prueba.

## Artículos y panel editorial

- La sección pública consulta los artículos publicados en Supabase.
- El botón Compartir permanece dentro del artículo abierto.
- `api/article-share.js` genera los metadatos Open Graph/Twitter y ahora dirige al artículo en `https://www.puragracia.com/`.
- El usuario confirmó previamente las vistas previas en WhatsApp y Facebook; la actualización del destino final se preparó para el lanzamiento.
- El panel editorial se mantiene en `/admin.html`; su etiqueta `noindex,nofollow` se conserva intencionalmente.
- Supabase y su bucket `articles-images` siguen siendo la fuente de datos y almacenamiento editorial.

## Preparación de lanzamiento aplicada en la rama

- [x] Se retiró `noindex,nofollow` de la página principal para permitir indexación.
- [x] Se conservó `noindex,nofollow` en el panel editorial.
- [x] Se cambió el destino de compartir artículos a `https://www.puragracia.com/`.
- [x] Se incrementó el caché del Service Worker de `pgr-v58` a `pgr-v59` para que las instalaciones reciban los recursos actualizados.
- [x] Se conservó el canonical de la página principal en `https://www.puragracia.com/`.
- [x] Se verificó que los archivos estáticos precargados, iconos, JSON de programación, catálogo de 30 programas y carátulas existen y son válidos.
- [x] Se verificó que el último deployment de la rama quedó `READY`.

## Pendiente de infraestructura del dominio

- [ ] Añadir `www.puragracia.com` al proyecto Vercel de la PWA y obtener la configuración DNS requerida.
- [ ] Configurar el dominio raíz `puragracia.com` para redirigir a `www.puragracia.com`, si el panel de dominio lo permite.
- [ ] Actualizar los registros DNS en el proveedor donde se administra el dominio.
- [ ] Verificar HTTPS, redirección y carga de la PWA una vez propagado DNS.
- [ ] Confirmar que la rama de producción del proyecto Vercel quede alineada con `main` después de la integración.

## Servicios externos

- Las credenciales Partner ID/Partner Key de TuneIn ya fueron introducidas en RadioBOSS. La recepción de metadata por TuneIn queda como verificación externa separada; no se deben volver a introducir credenciales.
- La posible integración HTTP GET/POST directa desde Radio Voice Cloud queda aplazada hasta después de la migración.

## Cierre

1. Validación del código y preparación de lanzamiento: completada.
2. Prueba funcional de la PWA en el enlace Vercel, incluida la sección de artículos y el panel editorial: aprobada por el usuario.
3. Ajustes finales de lanzamiento en la rama: completados.
4. Integración de `migracion-radioboss` en `main`: autorizada por el usuario y pendiente de ejecutarse.

## Protección

- No se han modificado los archivos de `main` hasta la integración.
- El archivo `CNAME` conserva `www.puragracia.com`; por sí solo no cambia el DNS.
- No modificar la lógica de metadata de RadioBOSS que ya funciona.
