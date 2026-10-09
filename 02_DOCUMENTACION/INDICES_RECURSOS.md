# Índices de renders y planos

Los catálogos `01_RECURSOS/ESPLENDOR/assets.js` y `01_RECURSOS/BONANZA/assets.js`
se generan a partir de los archivos de `RENDERS` y `PLANO` de cada propiedad.
Se admiten PNG, JPG/JPEG, WebP, AVIF, GIF y SVG. Solo se leen nombres de archivos.
Los títulos conservan el nombre real sin extensión y las rutas codifican los
espacios, acentos y caracteres especiales. El orden es alfabético natural en español.

`ENTRADA` y `PORTADA` (sin importar mayúsculas ni extensión) siguen reservadas y
no aparecen como tarjetas de la galería. Entrada conserva su uso en el selector
de propiedades. No se modifican esos archivos ni el selector.

## Desarrollo local

Desde la carpeta principal, `node dev-server.js` regenera ambos catálogos al
iniciar. Si cambias recursos con el servidor abierto, ejecuta
`node generate-assets.js` y recarga la página.

## Antes de publicar en GitHub Pages

1. Agrega, renombra o elimina los recursos en la carpeta de la propiedad.
2. Ejecuta `node generate-assets.js` desde la carpeta principal.
3. Incluye en la publicación los recursos y ambos `assets.js` actualizados,
   junto con los `config.js` si editaste la lista de espacios.
4. Publica y recarga la página para cargar los catálogos nuevos.

GitHub Pages utiliza los catálogos estáticos; no necesita una API ni Node.js en
el navegador. Las rutas relativas también funcionan al publicar bajo el nombre
de un repositorio. No edites manualmente las listas `renders` y `plans`: se
regeneran. El generador conserva los valores de video y panoramas existentes.

## Lista de espacios

La lista del visor y la vista previa del editor leen `CBZ_CONFIG.scenes[].menu`
de la propiedad activa: `title`, `visible`, `level`, `levelTitle` y `order`.
Usa «Guardar lista de espacios» en el editor para persistir estos cambios y
publica el `config.js` de esa propiedad. Guardar hotspots es un flujo separado.
