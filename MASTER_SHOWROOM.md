# MASTER SHOWROOM
## Sistema de Showroom Arquitectónico Interactivo 360°

> ARCHIVO MAESTRO / FUENTE DE VERDAD DEL PROYECTO
>
> Este archivo contiene las reglas, decisiones, nomenclaturas,
> arquitectura y criterios fundamentales que deben respetarse durante
> todo el desarrollo del showroom.
>
> Este documento debe ser leído antes de realizar modificaciones
> importantes al proyecto.

---

# 00. IDENTIDAD DEL PROYECTO

## Proyecto actual

**Casa Bonanza**

Abreviatura técnica:

`CBZ`

ID del proyecto:

`CASA_BONANZA`

La palabra Bonanza debe escribirse siempre:

`BONANZA`

Nunca utilizar variantes como:

- BONANSA
- BONANZA CASA
- BONANZA_
- BONANSSA
- cualquier otra variante

---

# 01. OBJETIVO GENERAL

Desarrollar una plataforma web tipo showroom arquitectónico interactivo
para presentar una vivienda mediante renders panorámicos 360°.

La experiencia debe sentirse:

- arquitectónica
- elegante
- limpia
- moderna
- inmersiva
- intuitiva
- profesional
- ligera
- rápida

El objetivo principal no es crear una aplicación compleja.

El objetivo es crear una experiencia digital de presentación arquitectónica
que permita al usuario explorar una vivienda mediante panoramas 360°.

---

# 02. OBJETIVO DE ENTREGA

Fecha objetivo:

**24 de agosto de 2026**

El proyecto debe desarrollarse progresivamente y de forma modular.

Debido a las limitaciones de tokens de Claude, se debe evitar:

- rehacer trabajo innecesariamente
- volver a descubrir decisiones ya tomadas
- modificar estructuras sin necesidad
- generar código innecesario
- instalar dependencias que no sean necesarias
- realizar grandes refactorizaciones sin autorización

El desarrollo debe realizarse por etapas pequeñas y verificables.

---

# 03. HERRAMIENTAS PRINCIPALES

## ChatGPT

Responsabilidades:

- planificación
- arquitectura general
- metodología
- decisiones de diseño
- documentación
- revisión
- resolución de problemas
- definición de prompts e instrucciones
- revisión del trabajo realizado por Claude
- definición de estándares

---

## Claude Code

Responsabilidades principales:

- desarrollo del código
- configuración del proyecto
- instalación y gestión de dependencias
- integración de Marzipano
- creación de la interfaz
- implementación de navegación
- implementación de hotspots
- implementación del plano
- implementación de transiciones
- debugging
- mantenimiento del proyecto

Claude debe leer este archivo antes de realizar cambios relevantes.

---

## Antigravity

Herramienta complementaria para:

- desarrollo
- edición
- revisión
- experimentación
- apoyo en programación

Debe trabajar sobre el mismo proyecto y la misma estructura de archivos.

No crear versiones paralelas del proyecto.

---

## D5 Render

Se utilizará para generar:

- renders 360°
- panoramas equirectangulares
- video timelapse día → noche

---

## Marzipano

Se utilizará como motor de visualización de panoramas 360°.

Marzipano será responsable principalmente de:

- visualizar panoramas 360°
- controlar la cámara
- permitir navegación dentro del panorama
- administrar escenas
- administrar hotspots
- realizar transiciones entre escenas

Marzipano NO será responsable de toda la interfaz.

La interfaz general será desarrollada mediante HTML/CSS/JavaScript.

---

## Node.js + npm

Node.js y npm serán utilizados como entorno de desarrollo y gestión
de dependencias.

npm viene incluido con Node.js.

No asumir que Node.js debe permanecer ejecutándose en el servidor
final.

---

## Git

Git será utilizado para:

- control de versiones
- respaldo
- recuperación de versiones
- seguimiento de cambios

Git no debe convertirse en una complejidad innecesaria durante el desarrollo.

---

## GitHub

GitHub será utilizado posteriormente para:

- almacenar el proyecto
- respaldarlo
- eventualmente publicar el proyecto

---

## GitHub Pages

El objetivo final es poder publicar el showroom como sitio web estático
mediante GitHub Pages.

El resultado final debe poder ser accesible mediante una URL pública.

---

# 04. RESTRICCIÓN DE ARQUITECTURA WEB

El proyecto debe diseñarse pensando desde el inicio en una publicación
como sitio web estático.

Evitar depender innecesariamente de:

- bases de datos
- PHP
- servidores backend
- APIs propietarias
- servidores Node permanentes
- infraestructura compleja

Node.js/npm se utilizarán principalmente durante el desarrollo/build.

La aplicación final debe poder generar los archivos necesarios para
ser servidos como sitio web estático.

---

# 05. FILOSOFÍA DEL PROYECTO

La plataforma debe separar claramente:

1. recursos
2. configuración
3. lógica
4. interfaz
5. documentación

Los recursos visuales NO deben estar incrustados directamente en el código
si pueden mantenerse como archivos independientes.

Los archivos deben poder reemplazarse sin necesidad de reconstruir
innecesariamente toda la lógica.

Ejemplo:

Si se reemplaza:

`CBZ_360_02_AREA_SOCIAL.jpg`

por una versión de mayor calidad con exactamente el mismo nombre,
el sistema debería seguir utilizando ese recurso sin necesidad de cambiar
la lógica del proyecto.

---

# 06. ESTRUCTURA DEFINITIVA DEL PROYECTO

La estructura definitiva del proyecto es:

```text
SHOWROOM_BONANZA/
│
├── MASTER_SHOWROOM.md
│
├── 01_RECURSOS/
│   ├── 360/
│   ├── VIDEO/
│   ├── PLANO/
│   └── BRANDING/
│
├── 02_DOCUMENTACION/
│
└── 03_PROTOTIPO/
    ├── index.html
    ├── css/
    │   └── main.css
    ├── js/
    │   ├── app.js
    │   ├── scenes.js
    │   └── hotspots.js
    ├── lib/
    │   └── marzipano.js
    └── data/
        └── config.js
```

Las carpetas de recursos NO forman parte del build final.
Son el repositorio de materia prima del proyecto.

La carpeta `03_PROTOTIPO/` contiene todo el código que se publicará
en GitHub Pages.

---

# 07. NOMENCLATURA CBZ

## Regla general

Todos los archivos del proyecto siguen el prefijo:

`CBZ_`

Seguido de la categoría en mayúsculas, un número de dos dígitos,
y el nombre descriptivo también en mayúsculas separado por guiones bajos.

## Archivos de panoramas 360°

Formato:

`CBZ_360_NN_NOMBRE.jpg`

Donde `NN` es el número de escena con dos dígitos (01, 02, 03...).

## Archivos de video

Formato:

`CBZ_VIDEO_NN_NOMBRE.mp4`

## Archivos de plano

Formato:

`CBZ_PLANO_NN_NOMBRE.jpg` o `CBZ_PLANO_NN_NOMBRE.png`

## Archivos de branding

Formato:

`CBZ_BRAND_NOMBRE.svg` o `CBZ_BRAND_NOMBRE.png`

## Regla de reemplazo

Si un archivo se reemplaza por una versión de mayor calidad,
debe conservar exactamente el mismo nombre.

El sistema no debe requerir cambios en el código al reemplazar un recurso
con el mismo nombre.

---

# 08. PANORAMAS 360° — ESCENAS DE CASA BONANZA

Casa Bonanza tiene exactamente **7 escenas** distribuidas en tres niveles.

## Niveles

| Clave | Descripción |
|-------|-------------|
| PB | Planta Baja |
| N2 | Nivel 2 |
| N3 | Nivel 3 |

## Tabla de escenas

| ID | Archivo | Nivel | Nombre de escena |
|----|---------|-------|-----------------|
| 01 | `CBZ_360_01_ACCESO.jpg` | PB | Acceso |
| 02 | `CBZ_360_02_AREA_SOCIAL.jpg` | PB | Área Social |
| 03 | `CBZ_360_03_COCINA_COMEDOR.jpg` | PB | Cocina - Comedor |
| 04 | `CBZ_360_04_PASILLO_N2.jpg` | N2 | Pasillo N2 |
| 05 | `CBZ_360_05_RECAMARA_PRINCIPAL.jpg` | N2 | Recámara Principal |
| 06 | `CBZ_360_06_RECAMARA_2.jpg` | N2 | Recámara 2 |
| 07 | `CBZ_360_07_TERRAZA.jpg` | N3 | Terraza |

## Ubicación de archivos

Todos los panoramas residen en:

```text
01_RECURSOS/360/
```

## Valores pendientes de render

Los siguientes valores NO se definen hasta recibir los renders finales de D5 Render:

- resolución exacta de cada panorama
- orientación inicial de cámara por escena (yaw, pitch)
- coordenadas de hotspots (yaw, pitch) por escena

---

# 09. NAVEGACIÓN Y HOTSPOTS

## Concepto

Los hotspots son elementos interactivos dentro de cada panorama 360°
que permiten al usuario navegar de una escena a otra.

## Reglas de hotspots

- Cada hotspot enlaza una escena de origen con una escena de destino.
- Un hotspot tiene un ID único, una posición angular (yaw, pitch),
  y una etiqueta visible.
- Las coordenadas de los hotspots se definen DESPUÉS de recibir los renders.
- Los hotspots se configuran en `data/config.js`, no en el HTML.

## Formato de ID de hotspot

`HS_NN_a_MM`

Donde `NN` es el ID de la escena de origen y `MM` el de destino.

Ejemplo:

`HS_01_a_02` — hotspot en escena 01 que lleva a escena 02.

## Conexiones previstas (sujetas a ajuste)

| Hotspot | Origen | Destino |
|---------|--------|---------|
| HS_01_a_02 | Acceso | Área Social |
| HS_02_a_01 | Área Social | Acceso |
| HS_02_a_03 | Área Social | Cocina - Comedor |
| HS_03_a_02 | Cocina - Comedor | Área Social |
| HS_02_a_04 | Área Social | Pasillo N2 |
| HS_04_a_02 | Pasillo N2 | Área Social |
| HS_04_a_05 | Pasillo N2 | Recámara Principal |
| HS_04_a_06 | Pasillo N2 | Recámara 2 |
| HS_05_a_04 | Recámara Principal | Pasillo N2 |
| HS_06_a_04 | Recámara 2 | Pasillo N2 |
| HS_04_a_07 | Pasillo N2 | Terraza |
| HS_07_a_04 | Terraza | Pasillo N2 |

## Regla de coordenadas

No registrar coordenadas de hotspots en este documento hasta tener los renders.
Las coordenadas se registran en `data/config.js` una vez definidas.

---

# 10. PLANO E INDICADOR DE UBICACIÓN

## Concepto

El plano arquitectónico de Casa Bonanza se muestra como elemento
de orientación dentro de la interfaz.

Permite al usuario saber en qué espacio de la vivienda se encuentra.

## Comportamiento

- El plano se muestra en una esquina de la interfaz (posición por definir).
- Al cambiar de escena, el indicador de ubicación se actualiza
  para señalar el espacio activo.
- El indicador puede ser un punto, ícono o resaltado sobre el plano.

## Archivos de plano

| Archivo | Uso |
|---------|-----|
| `CBZ_PLANO_PB.jpg` | Plano de Planta Baja |
| `CBZ_PLANO_N2.jpg` | Plano de Nivel 2 |
| `CBZ_PLANO_N3.jpg` | Plano de Nivel 3 |

## Regla de niveles

El plano mostrado cambia automáticamente según el nivel de la escena activa:

- Escenas 01, 02, 03 → mostrar `CBZ_PLANO_PB.jpg`
- Escenas 04, 05, 06 → mostrar `CBZ_PLANO_N2.jpg`
- Escena 07 → mostrar `CBZ_PLANO_N3.jpg`

## Coordenadas del indicador

Las coordenadas de posición del indicador sobre el plano (en píxeles o porcentaje)
se definen en `data/config.js` una vez disponibles los planos finales.

---

# 11. INTERFAZ

## Principios

La interfaz es responsabilidad del código HTML/CSS/JS,
no de Marzipano.

Marzipano controla únicamente el visor de panoramas.

## Elementos de la interfaz

| Elemento | Descripción |
|----------|-------------|
| Visor 360° | Área principal — controlada por Marzipano |
| Indicador de escena | Nombre de la escena activa |
| Menú de navegación | Lista o botones de escenas disponibles |
| Plano | Miniatura con indicador de ubicación |
| Botón de pantalla completa | Activar/desactivar fullscreen |
| Logotipo | Branding de Casa Bonanza |
| Controles de cámara | Movimiento y zoom — gestionados por Marzipano |

## Filosofía visual

- Arquitectónica, elegante y limpia
- Sin elementos innecesarios
- El panorama debe dominar la pantalla
- La interfaz es discreta y no invasiva
- Colores neutros: negro, blanco, grises y dorado como acento

## Tipografía

Tipografía por definir. Debe ser:

- limpia
- geométrica o humanista
- sin serifa
- compatible con Google Fonts o cargada localmente

---

# 12. LANDING — VIDEO DÍA → NOCHE

## Concepto

La primera pantalla que ve el usuario es una landing page
con un video timelapse de la fachada de Casa Bonanza
que transita de día a noche.

## Comportamiento

1. El video inicia automáticamente y en silencio (autoplay, muted).
2. El video se reproduce en loop o una sola vez según se decida.
3. Sobre el video aparece el nombre del proyecto y un llamado a la acción.
4. El usuario hace clic o toca para ingresar al showroom.
5. Se ejecuta una transición fade a negro.
6. El visor 360° de Marzipano aparece.

## Archivo de video

`CBZ_VIDEO_01_FACHADA_DIA_NOCHE.mp4`

Ubicado en:

```text
01_RECURSOS/VIDEO/
```

## Especificaciones del video (a confirmar con D5 Render)

- Formato: MP4
- Duración: por definir
- Resolución: por definir
- Autoplay: sí
- Muted: sí
- Loop: por definir

---

# 13. TRANSICIÓN FADE A NEGRO

## Concepto

Entre la landing y el visor, y entre escenas del panorama,
se utilizará una transición de fade a negro.

## Reglas

- La transición es un overlay negro con opacidad que va de 0 a 1 y vuelve a 0.
- La duración del fade es uniforme en toda la experiencia.
- La duración exacta se define durante el prototipo (valor de referencia: 600ms).
- La transición se implementa en CSS con una clase activada por JavaScript.
- No depende de Marzipano para ejecutarse.

## Casos de uso

| Caso | Descripción |
|------|-------------|
| Landing → Visor | Al hacer clic en el botón de entrada |
| Escena → Escena | Al navegar por hotspots |

---

# 14. BRANDING

## Nombre del proyecto

Casa Bonanza

La palabra Bonanza se escribe siempre:

`BONANZA`

Nunca con variantes.

## Logotipo

El logotipo de Casa Bonanza se almacena en:

```text
01_RECURSOS/BRANDING/
```

Archivos previstos:

| Archivo | Uso |
|---------|-----|
| `CBZ_BRAND_LOGO.svg` | Logotipo principal vectorial |
| `CBZ_BRAND_LOGO_DARK.svg` | Versión sobre fondo oscuro |
| `CBZ_BRAND_LOGO_LIGHT.svg` | Versión sobre fondo claro |

## Uso del logotipo en la interfaz

- Aparece en la landing sobre el video.
- Aparece en la interfaz del visor en una posición discreta.
- No debe competir visualmente con el panorama.

---

# 15. REGLAS DE MARZIPANO

## Versión

Se utilizará Marzipano desde su distribución oficial.

Puede cargarse como archivo local dentro de `03_PROTOTIPO/lib/`
o desde CDN. La decisión se toma al iniciar el prototipo.

## Responsabilidades de Marzipano

- Visualizar panoramas equirectangulares 360°
- Controlar la cámara (yaw, pitch, zoom)
- Permitir navegación dentro del panorama
- Administrar múltiples escenas
- Administrar hotspots
- Realizar transiciones entre escenas

## Lo que Marzipano NO gestiona

- La landing page
- El video de la fachada
- El menú de navegación
- El plano arquitectónico
- El logotipo
- Las transiciones fade a negro (solo gestiona transición entre escenas internamente)
- El layout general de la interfaz

## Configuración de escenas

Las escenas se registran en `data/config.js` como un array de objetos.

Estructura de referencia de cada escena:

```js
{
  id: 'CBZ_360_01_ACCESO',
  title: 'Acceso',
  level: 'PB',
  file: '01_RECURSOS/360/CBZ_360_01_ACCESO.jpg',
  initialViewParameters: {
    yaw: null,       // pendiente de render
    pitch: null,     // pendiente de render
    fov: null        // pendiente de render
  },
  hotspots: []       // pendiente de render
}
```

Los valores `null` se completan una vez disponibles los renders finales.

---

# 16. HTML / CSS / JS

## HTML

- Un único archivo `index.html` en la raíz de `03_PROTOTIPO/`.
- Semántico, limpio y sin lógica incrustada.
- No se incluyen estilos inline salvo excepciones justificadas.

## CSS

- Un archivo principal `css/main.css`.
- Variables CSS para colores, tipografía y transiciones.
- Sin frameworks CSS externos salvo decisión explícita.
- Sin TailwindCSS.

## JavaScript

| Archivo | Responsabilidad |
|---------|----------------|
| `js/app.js` | Punto de entrada, inicialización general |
| `js/scenes.js` | Gestión de escenas Marzipano |
| `js/hotspots.js` | Gestión de hotspots |
| `data/config.js` | Configuración de escenas, hotspots y plano |

## Reglas JS

- Vanilla JavaScript. Sin frameworks (React, Vue, Angular).
- Sin bundlers en el prototipo inicial (sin Webpack, sin Vite).
- El prototipo debe funcionar abriendo `index.html` directamente
  o con un servidor estático mínimo.
- Las dependencias externas se cargan desde `lib/` o CDN.

---

# 17. NODE / NPM / GIT / GITHUB PAGES

## Node.js y npm

- Node.js se utiliza únicamente como entorno de desarrollo.
- npm se utiliza para gestionar dependencias de desarrollo si las hay.
- El resultado final no depende de Node.js en producción.
- Versión instalada: v24.19.0 / npm 11.17.0

## Git

- El repositorio se inicializa en la raíz `SHOWROOM_BONANZA/`.
- Se utiliza una rama principal: `main`.
- Los commits deben ser descriptivos y atómicos.
- No se sube a GitHub hasta tener un prototipo funcional mínimo.
- El archivo `.gitignore` debe excluir `node_modules/`.

## GitHub Pages

- El objetivo final es publicar el showroom como sitio estático.
- La carpeta publicable es `03_PROTOTIPO/`.
- GitHub Pages se configura apuntando a esa carpeta o rama `gh-pages`.
- No se configura GitHub Pages hasta tener el proyecto listo para publicación.

---

# 18. REGLAS DE TRABAJO DE ANTIGRAVITY

## Principios

- Leer `MASTER_SHOWROOM.md` completo antes de cualquier cambio relevante.
- No crear versiones paralelas del proyecto.
- No modificar la nomenclatura establecida en este documento.
- No instalar dependencias sin autorización explícita.
- No realizar grandes refactorizaciones sin autorización.
- No inventar valores que dependan de los renders finales.

## Alcance por sesión

Cada sesión de trabajo debe:

1. Declarar qué tarea se va a realizar.
2. Limitarse a esa tarea.
3. Verificar el resultado antes de terminar.

## Archivos que nunca se modifican sin autorización

- `MASTER_SHOWROOM.md` (solo con instrucción explícita)
- `data/config.js` (hasta tener renders finales)

## Reporte al terminar

Al finalizar cada tarea, Antigravity debe reportar:

- qué se hizo
- qué archivos se crearon o modificaron
- qué sigue como próximo paso

---

# 19. ESTRATEGIA DE AHORRO DE TOKENS

## Principio

El desarrollo se realiza por etapas pequeñas y verificables.

Cada sesión tiene una tarea concreta y acotada.

## Reglas

- No rehacer trabajo ya hecho.
- No volver a descubrir decisiones ya tomadas — están en este documento.
- No generar código innecesario.
- No instalar dependencias que no sean necesarias.
- No realizar cambios estructurales sin autorización.
- Antes de cada tarea, declarar brevemente qué se va a hacer.
- Confirmar con el usuario antes de tareas ambiguas o de alto impacto.

## Uso de este documento

`MASTER_SHOWROOM.md` es la fuente de verdad del proyecto.

Leerlo reemplaza la necesidad de explorar el proyecto desde cero
en cada sesión.

---

# 20. FASES DE DESARROLLO

## Fase 0 — Preparación

- [x] Crear estructura de carpetas base
- [x] Crear y completar MASTER_SHOWROOM.md
- [ ] Inicializar repositorio Git
- [ ] Crear `.gitignore`
- [ ] Primer commit del proyecto

## Fase 1 — Prototipo base

- [ ] Crear `03_PROTOTIPO/` con estructura de archivos
- [ ] Integrar Marzipano (lib local o CDN)
- [ ] Crear `index.html` base
- [ ] Crear `css/main.css` base
- [ ] Crear `data/config.js` con escenas placeholder
- [ ] Cargar un panorama de prueba (imagen equirectangular de ejemplo)
- [ ] Verificar que Marzipano funciona correctamente

## Fase 2 — Escenas y navegación

- [ ] Agregar los 7 panoramas reales de Casa Bonanza
- [ ] Configurar escenas en `data/config.js`
- [ ] Implementar hotspots entre escenas
- [ ] Implementar transición fade a negro entre escenas

## Fase 3 — Interfaz

- [ ] Diseñar e implementar interfaz completa
- [ ] Menú de navegación por escenas
- [ ] Plano con indicador de ubicación
- [ ] Logotipo y branding
- [ ] Ajustes visuales finales

## Fase 4 — Landing

- [ ] Implementar landing page con video
- [ ] Transición fade a negro de landing a visor
- [ ] Ajustar timing y comportamiento del video

## Fase 5 — Publicación

- [ ] Revisión general de la experiencia
- [ ] Optimización de recursos
- [ ] Configurar repositorio en GitHub
- [ ] Configurar GitHub Pages
- [ ] Publicar y verificar URL pública

---

# 21. ESTADO ACTUAL Y SIGUIENTE HITO

## Estado actual

| Elemento | Estado |
|----------|--------|
| MASTER_SHOWROOM.md | ✅ Completo |
| Estructura de carpetas base (`01_RECURSOS/`, `02_DOCUMENTACION/`) | ✅ Creada |
| Node.js v24.19.0 | ✅ Instalado |
| npm 11.17.0 | ✅ Instalado |
| Git 2.55.0 | ✅ Instalado |
| Repositorio Git inicializado | ❌ Pendiente |
| `03_PROTOTIPO/` | ❌ Pendiente |
| Panoramas 360° reales | ❌ Pendiente (D5 Render) |
| Video fachada día → noche | ❌ Pendiente (D5 Render) |
| Planos arquitectónicos | ❌ Pendiente |
| Logotipo / branding | ❌ Pendiente |

## Siguiente hito — Fase 0 completa

Tareas inmediatas (en orden):

1. Inicializar repositorio Git en `SHOWROOM_BONANZA/`
2. Crear `.gitignore`
3. Hacer el primer commit con el estado actual del proyecto

Una vez completada la Fase 0, iniciar la Fase 1:
crear la estructura de `03_PROTOTIPO/` y verificar que Marzipano
carga un panorama de prueba correctamente.

---

*MASTER_SHOWROOM.md — Fuente de verdad del proyecto CASA BONANZA (CBZ)*
*Última actualización: 2026-08-19*