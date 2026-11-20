# Migración RadioBOSS — rama aislada de preparación

## Protección del sitio público

- El trabajo de migración se mantiene en `migracion-radioboss`.
- `main` permanece intacta. La comparación actual indica que esta rama está 22 commits por delante y 0 por detrás de `main`.
- No integrar, cambiar DNS ni publicar en `www.puragracia.com` sin autorización expresa.
- `CNAME` contiene `www.puragracia.com`; es la configuración prevista para el destino final, no una autorización para publicar.
- `index.html` conserva `noindex,nofollow` durante las pruebas. Retirar esa protección solo al preparar el lanzamiento autorizado.
- `sw.js` usa actualmente el caché `pgr-v58`.

## Integración RadioBOSS

- La PWA usa el stream `https://c23.radioboss.fm/stream/296`.
- `js/nowplaying.js` consulta el endpoint independiente `https://puragracia-radio-api-nine.vercel.app/api/radioboss-nowplaying`.
- `api/radioboss-nowplaying.js` obtiene los datos desde RadioBOSS en el servidor; la clave no se expone en el navegador.
- Las variables `RADIOBOSS_API_URL` y `RADIOBOSS_API_KEY` están configuradas en el proyecto Vercel para Production y Preview. Los valores sensibles no se documentan aquí.
- El endpoint conserva la información visible durante elementos de producción identificados por las carpetas Jingles, Station ID, Stingers y Sweepers. No alterar esta lógica ni el comportamiento de actualización de metadata que ya se validó.

## API Vercel

- Proyecto: `puragracia-radio-api`.
- Dominio estable: `https://puragracia-radio-api-nine.vercel.app`.
- El último deployment revisado está READY y proviene de `migracion-radioboss`, commit `4aa8b9d5c94359560d88e27e7575e67d7072a689`.
- Este proyecto aloja la API; no es el hosting del sitio público ni autoriza cambios en `main`.
- CORS de `api/radioboss-nowplaying.js` permite actualmente solo `https://puragracia.com` y `https://www.puragracia.com`. Antes de probar esta rama desde otro origen, verificar el origen real y autorizarlo explícitamente; no usar comodines.

## Artículos y compartir

- Los artículos se consultan desde Supabase; no dependen de `data/articles.json`.
- El botón Compartir está dentro del artículo abierto.
- `api/article-share.js` genera los metadatos Open Graph/Twitter para las vistas previas.
- El destino de prueba está configurado temporalmente en `https://arios71.github.io/puragracia-radio-preview/`.
- El usuario confirmó que el enlace de compartir muestra correctamente la vista previa en WhatsApp y Facebook y abre el artículo en la PWA de prueba.
- No cambiar el destino mientras continúen las pruebas. En la migración final, cambiarlo a `https://www.puragracia.com/` conservando la generación de la vista previa.

## Pendientes antes del lanzamiento (no son autorización para publicar)

1. Resolver y probar CORS desde el origen exacto que se use para probar esta rama.
2. Completar la validación de programación, catálogo de programas, sermones y panel editorial en esta versión.
3. Confirmar la experiencia PWA instalada y el comportamiento del Service Worker en el dispositivo de prueba.
4. Confirmar la configuración de TuneIn con RadioBOSS.
5. Cuando el usuario autorice el lanzamiento: cambiar el destino de compartir al dominio oficial, retirar `noindex,nofollow`, revisar rutas/canonical y ejecutar una verificación final.
6. Solo después de aprobación expresa, integrar la rama y publicar el sitio oficial.

## Regla de trabajo

No modificar `main`, el dominio público ni el destino de compartir de prueba sin autorización expresa. No cambiar la lógica de metadata de RadioBOSS que ya funciona correctamente.
