# Migración RadioBOSS — rama de pruebas

Esta rama contiene la versión de Pura Gracia Radio preparada para la migración de SAM Broadcaster Cloud a RadioBOSS.

## Protección

- Trabajar únicamente en `migracion-radioboss` durante las pruebas.
- No integrar a `main` ni publicar en `puragracia.com` sin aprobación expresa.
- `vercel.json` aplica `noindex, nofollow` para impedir indexación de las vistas de prueba. Retirar esta protección antes de la publicación final.
- El Service Worker usa el identificador independiente `pgr-radioboss-migration-v2`.

## Configuración que falta cerrar

- Sustituir en `js/nowplaying.js` el endpoint de API de preview por el endpoint definitivo de producción.
- Configurar CORS para el dominio de prueba de Vercel y, cuando corresponda, `https://puragracia.com` y `https://www.puragracia.com`.
- Confirmar variables de entorno de RadioBOSS en el proyecto de API; no guardar claves en este repositorio.
- Verificar que el despliegue de la rama sea un preview independiente y no modifique GitHub Pages ni el dominio personalizado.

## Lista de pruebas antes de integrar

- Reproducción del stream RadioBOSS y controles de pausa/reanudación.
- Metadatos y carátulas de canciones y programas.
- Programación, catálogo y carátulas de los 30 programas.
- Artículos: lectura, publicación, despublicación y eliminación.
- Panel editorial: autenticación, guardado, imágenes y permisos.
- Manifest, Service Worker e instalación PWA en móvil.
- TuneIn y metadatos enviados por RadioBOSS.
