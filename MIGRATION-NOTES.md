# Migración RadioBOSS — estado de lanzamiento

## Estado general

- La migración `migracion-radioboss` fue integrada en `main` mediante PR #1.
- Commit de integración: `008fddb1979fd3fcc6c975b4ad41b3238647c375`.
- El usuario aprobó la PWA probada en Vercel, incluidos reproducción, artículos y panel editorial.
- El último deployment de `main` quedó `READY` en Vercel.
- El dominio oficial ya está asociado al proyecto Vercel; falta cambiar los registros DNS externos para que el tráfico deje GitHub Pages y llegue a Vercel.

## RadioBOSS y API

- Stream: `https://c23.radioboss.fm/stream/296`.
- Endpoint de metadata: `https://puragracia-radio-api-nine.vercel.app/api/radioboss-nowplaying`.
- Proyecto Vercel: `puragracia-radio-api`, vinculado a `arios71/puragracia.com`.
- Las credenciales RadioBOSS permanecen exclusivamente en backend mediante `RADIOBOSS_API_URL` y `RADIOBOSS_API_KEY`; no se exponen al navegador.
- Las variables están configuradas para Production y Preview.
- Se conserva el filtro de producción para Jingles, Station ID, Stingers y Sweepers.
- No alterar la lógica de metadata validada por el usuario.

## Artículos y panel editorial

- Los artículos publicados se consultan desde Supabase.
- El botón Compartir está dentro del artículo abierto.
- `api/article-share.js` genera Open Graph/Twitter y redirige al artículo en `https://www.puragracia.com/`.
- El usuario confirmó anteriormente las vistas previas de compartir en WhatsApp y Facebook.
- El panel editorial está en `/admin.html` y conserva `noindex,nofollow`.
- Supabase y el bucket `articles-images` siguen siendo la fuente editorial.

## Cambios finales integrados

- [x] Se retiró `noindex,nofollow` de la página principal.
- [x] Se conservó `noindex,nofollow` en el panel editorial.
- [x] Compartir artículos apunta a `https://www.puragracia.com/`.
- [x] Service Worker actualizado a `pgr-v59`.
- [x] Canonical de la página principal: `https://www.puragracia.com/`.
- [x] Recursos, iconos, JSON de programación, catálogo de 30 programas y carátulas verificados.
- [x] PR #1 integrado en `main`.
- [x] Deployment de producción de `main` en Vercel: `READY`.

## Vercel y dominio oficial

- [x] Proyecto Vercel: `puragracia-radio-api`.
- [x] `www.puragracia.com` añadido al proyecto y verificado por Vercel.
- [x] `puragracia.com` añadido como redirección 308 a `www.puragracia.com`.
- [ ] DNS externo pendiente: la configuración actual todavía apunta a GitHub Pages.
- [ ] En DNS, sustituir CNAME de `www` (`arios71.github.io`) por `52e112caba599478.vercel-dns-017.com`.
- [ ] En el apex `@`, sustituir los A de GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) por `216.198.79.1` y `64.29.17.1`.
- [ ] En Vercel Settings > Environments > Production > Branch Tracking, cambiar la rama de producción a `main` para que futuras actualizaciones de `main` se desplieguen automáticamente a producción.
- [ ] Tras DNS: verificar HTTPS, redirección apex/www, reproducción, metadata, artículos, compartir y PWA instalada en `www.puragracia.com`.

## Servicios externos aplazados

- Las credenciales Partner ID/Partner Key de TuneIn ya están introducidas en RadioBOSS. La recepción de metadata por TuneIn queda como comprobación externa separada.
- La posible integración HTTP GET/POST directa desde Radio Voice Cloud se evaluará después de la migración.

## Protección y rollback

- El deployment aprobado de Vercel continúa disponible en el historial del proyecto.
- El archivo `CNAME` de GitHub se conserva para facilitar rollback si fuera necesario; el registro DNS determina qué plataforma recibe el tráfico.
- No cambiar la configuración de RadioBOSS que ya funciona correctamente.
