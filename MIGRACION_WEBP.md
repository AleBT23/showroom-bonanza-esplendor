# Migración gradual de panoramas a WebP

El visor admite archivos PNG, JPEG y WebP mezclados. Cada `scene.file` es la referencia autoritativa: copiar un WebP con el mismo nombre base no cambia ninguna escena. Se conservan IDs, hotspots, cámaras, menús y marca.

## Uso del editor local

1. Desde esta carpeta principal ejecuta `node dev-server.js`.
2. Copia los WebP a `01_RECURSOS/BONANZA/360/` o `01_RECURSOS/ESPLENDOR/360/`. Conserva los PNG que todavía utilices. No hace falta renombrar IDs.
3. Abre `http://127.0.0.1:8080/03_PROTOTIPO/index.html?property=bonanza&edit=1` (o `property=esplendor`).
4. Elige la escena en **PANORAMA 360 ACTIVO**. Pulsa **ACTUALIZAR ARCHIVOS** si acabas de copiar imágenes.
5. En **ARCHIVO DE ESTA ESCENA**, selecciona el nombre exacto, incluida la extensión. Pulsa **GUARDAR PANORAMA**. Guarda por separado los cambios de hotspots o de lista de espacios antes de recargar.
6. Recarga la página y vuelve a elegir la escena para comprobarla. El guardado modifica exclusivamente su campo `file`; no cambia IDs, destinos, coordenadas, orden ni visibilidad.
7. Al terminar, ejecuta `node generate-assets.js` para actualizar el catálogo estático y `node validate-panoramas.js` para validar referencias. Reiniciar el servidor también regenera el catálogo.

Los nombres con espacios, acentos y porcentajes se guardan literalmente; el visor aplica URL encoding al construir la solicitud. No introduzcas una URL ya codificada en `file`. Respeta exactamente las mayúsculas y la composición Unicode de los nombres físicos.

## Validación

- `node validate-panoramas.js`: resumen y referencias ausentes por casa.
- `node validate-panoramas.js --json`: todas las escenas, formatos, archivos ausentes, referencias compartidas, colisiones por mayúsculas/Unicode y variantes de un nombre base.
- El validador solo lee. Devuelve código 1 si hay referencias o respaldo ausentes, o colisiones.
- `node test-panorama-migration.js`: pruebas focalizadas sin crear ni convertir imágenes.
- PNG y WebP del mismo nombre base pueden coexistir: no son una elección automática. Las referencias explícitas prevalecen. Un destino nuevo sin extensión debe ser inequívoco; no se inventa una extensión PNG.

## Estado observado al preparar la migración

| Casa | Escenas WebP configuradas | Escenas PNG configuradas | Referencias ausentes | WebP físicos |
|---|---:|---:|---:|---:|
| Bonanza | 3 | 16 | 16 | 19 |
| Esplendor | 0 | 15 | 15 | 15 |

Las carpetas 360 ya contienen únicamente WebP. Los PNG referenciados estaban ausentes antes de estos cambios. No se reemplazaron referencias automáticamente, no se buscaron archivos en otras copias y no se borró ninguna imagen. Esplendor conserva además un `placeholder` PNG ausente; las escenas con `file` explícito no utilizan ese respaldo. Si se desea utilizarlo, su referencia debe actualizarse explícitamente en config.js.

No se detectaron archivos con colisiones de mayúsculas/Unicode, referencias compartidas ni variantes ambiguas en las carpetas actuales. Los tres WebP activos de Bonanza siguen siendo Acceso, Área social y Cocina-comedor. Las dos configuraciones finales conservan su contenido original.

**No está listo para publicar el contenido completo:** es necesario seleccionar los WebP de las 31 escenas pendientes, o restituir los PNG exactos. No se pudo verificar visualmente una combinación PNG/WebP ni Esplendor con PNG porque no hay PNG físicos en 360. La coexistencia, los alias y la conservación de destinos se verificaron con pruebas en memoria.

## Verificación realizada

- Editor: cambio temporal explícito de archivo de Acceso, guardado y recarga; selección persistente comprobada en el archivo y en el visor. Después se restauró la configuración original.
- Recorrido normal: Acceso → Área social → Cocina → Área social por hotspots, con solicitudes reales HTTP 200 y sin errores de imágenes. Solo se solicitaron escenas visitadas.
- Pruebas: guardado quirúrgico, PNG/WebP simultáneos en memoria, referencias autoritativas, extensiones antiguas en destinos, espacios/acentos/URL encoding, ambigüedad, mayúsculas, carga diferida y fijación única de texturas.
- SHA-256: los 34 panoramas físicos permanecen intactos. Galería, planos y selección de video no cambiaron.
- Hosting estático: el recorrido continúa usando rutas relativas y configuraciones JS; el nuevo endpoint de guardado solo se usa en el editor local. No se publicaron cambios.

## Servidor local: espera intermitente

El servidor ya servía WebP como `image/webp` y utilizaba `fs.createReadStream(...).pipe(res)`, sin cargar imágenes completas en memoria ni aplicar compresión.

Se midieron 12 GET completos de los tres WebP de Bonanza, incluidos 3 GET de Acceso mientras un flujo de video permanecía abierto y pausado. Todos fueron HTTP 200, MIME `image/webp`, con el número de bytes esperado:

| Caso | Muestras | Primer byte | Descarga completa |
|---|---:|---:|---:|
| Acceso sin video concurrente | 3 | 0,88–4,96 ms | 11,96–30,75 ms |
| Acceso con video concurrente | 3 | 1,00–1,63 ms | 10,14–27,08 ms |
| Área social | 3 | 1,09–1,33 ms | 5,71–7,35 ms |
| Cocina-comedor | 3 | 0,89–1,16 ms | 4,66–8,31 ms |

Acceso Esplendor WebP también respondió HTTP 200 en 12,27 ms mediante una solicitud directa, sin cambiar su configuración PNG. Las solicitudes del navegador se contrastaron con registros HTTP temporales del servidor; la herramienta de navegador no expone una traza completa de DevTools Network.

No se reprodujeron los 62 segundos ni HTTP 503. No se modificó el manejador estático y no se declara resuelta la causa de un retraso que no se reprodujo.
