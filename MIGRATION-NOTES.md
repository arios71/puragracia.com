# Migración RadioBOSS — rama aislada de preparación

## Protección del sitio público

- El trabajo de migración se mantiene en `migracion-radioboss`.
- Comparación verificada con `main`: 25 commits por delante y 0 por detrás.
- `main` y el sitio público no se han modificado como parte de esta preparación.
- No integrar, cambiar DNS ni publicar en `www.puragracia.com` sin autorización expresa.
- `CNAME` contiene `www.puragracia.com`; es la configuración prevista para el destino final, no una autorización para publicar.
- `index.html` conserva `noindex,nofollow` durante las pruebas. Retirar esa protección solo al preparar el lanzamiento autorizado.
- `sw.js` usa actualmente el caché `pgr-v58`.

## Integración RadioBOSS

- Stream configurado: `https://c23.radioboss.fm/stream/296`.
- `js/nowplaying.js` consulta el endpoint independiente `https://puragracia-radio-api-nine.vercel.app/api/radioboss-nowplaying`.
- `api/radioboss-nowplaying.js` obtiene los datos desde RadioBOSS en el servidor; la clave no se expone en el navegador.
- Las variables `RADIOBOSS_API_URL` y `RADIOBOSS_API_KEY` están configuradas en el proyecto Vercel para Production y Preview. Los valores sensibles no se documentan aquí.
- El endpoint identifica elementos de producción en las carpetas Jingles, Station ID, Stingers y Sweepers. La lógica y el comportamiento de metadata ya validados por el usuario no deben alterarse.
- CORS permite los orígenes `https://www.puragracia.com`, `https://puragracia.com` y `https://arios71.github.io`; no utiliza comodines.

## API Vercel

- Proyecto: `puragracia-radio-api`.
- Dominio estable: `https://puragracia-radio-api-nine.vercel.app`.
- Deployment más reciente revisado: READY, rama `migracion-radioboss`, commit `20a1b4ce281b57709ec3de1854ef6d389ce710a1`.
- Este proyecto aloja la API; no es el hosting del sitio público ni autoriza cambios en `main`.

## Artículos y compartir

- Los artículos se consultan desde Supabase; no dependen de `data/articles.json`.
- El botón Compartir está dentro del artículo abierto.
- `api/article-share.js` genera los metadatos Open Graph/Twitter para las vistas previas.
- El destino de prueba permanece temporalmente en `https://arios71.github.io/puragracia-radio-preview/`.
- El usuario confirmó que la vista previa funciona en WhatsApp y Facebook y que el enlace abre el artículo en la PWA de prueba.
- No cambiar el destino durante la validación. En la preparación del lanzamiento final, cambiarlo a `https://www.puragracia.com/` conservando la generación de la vista previa.

## Estado de validación

- [x] Rama aislada y comparación con `main` sin divergencia inversa (0 commits detrás).
- [x] Stream RadioBOSS configurado en la PWA.
- [x] Endpoint backend RadioBOSS y variables de entorno configurados.
- [x] Deployment de la API verificado como READY.
- [x] CORS habilitado para el origen GitHub Pages y los dominios oficiales.
- [x] Vista previa al compartir artículos confirmada por el usuario en WhatsApp y Facebook.
- [ ] Prueba integral de esta rama: reproducción, metadata/carátulas, navegación, programación, sermones, artículos y compartir.
- [ ] Verificación del panel editorial: acceso, roles, guardar, publicar, despublicar, imágenes y recuperación local.
- [ ] Verificación de PWA instalada y actualización del Service Worker en el dispositivo de prueba.
- [ ] Confirmar envío de metadata de RadioBOSS a TuneIn.
- [ ] Preparar URL/origen de prueba independiente para la rama sin activar el dominio oficial.

## Pasos de cierre (en este orden)

1. Completar las validaciones pendientes de esta rama y corregir cualquier fallo encontrado.
2. Ejecutar una última prueba integral en el entorno de prueba independiente. Este será el penúltimo paso.
3. Solo con el resultado satisfactorio y autorización expresa del usuario: preparar los cambios exclusivos de lanzamiento (destino final de compartir, retirar `noindex,nofollow`, verificar canonical/rutas) e integrar `migracion-radioboss` en `main`. La integración/publicación será el último paso y no se hará automáticamente.

## Regla de trabajo

No modificar `main`, el dominio público ni el destino de compartir de prueba sin autorización expresa. No cambiar la lógica de metadata de RadioBOSS que ya funciona correctamente.
