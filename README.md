# Tech Studios · versión para Cloudflare (gratis, sin tarjeta)

Estructura
- public/             la página (index.html, app.js, _headers)
- src/worker.js       el servidor (catálogo, descargas, contadores, login, pánico, cuestionario, respaldos)
- src/sigv4.js        firma de enlaces temporales para Backblaze / Filebase
- wrangler.jsonc      configuración (aquí va el ID de tu base de datos D1)

Pasos (resumen; el detalle está en el chat)
1. Crear cuenta en dash.cloudflare.com (solo correo).
2. Crear la base de datos D1 «techstudios-db» y copiar su Database ID.
3. Pegar ese ID en wrangler.jsonc (reemplaza PEGA-AQUI-EL-ID-DE-TU-BASE-DE-DATOS).
4. Subir esta carpeta a un repositorio PRIVADO de GitHub.
5. Cloudflare > Workers & Pages > Create > Import a repository > elegir el repositorio.
6. En Settings > Variables and Secrets agregar: SESSION_SECRET, S3_ENDPOINT, S3_KEY_ID, S3_SECRET, S3_BUCKET
   (y S3B_ENDPOINT, S3B_KEY_ID, S3B_SECRET, S3B_BUCKET si usas Filebase). Después pulsar Deploy.
7. Actualizar el CORS de los buckets con la nueva dirección (https://tech-studios.TU-SUBDOMINIO.workers.dev).

Notas
- El login y los PIN se calculan en tu navegador (PBKDF2, 600.000 vueltas); el servidor solo compara un SHA-256.
- Respuestas públicas (catálogo, novedades, café, cuestionario) se guardan 30 s en la caché de Cloudflare.
- «Exportar respaldo» descarga TODO (catálogo, contadores, novedades, café, cuestionario y respuestas);
  «Importar / restaurar» lo vuelve a cargar (pide PIN).
