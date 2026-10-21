/**
 * scenes.js — Gestor de escenas Marzipano
 * CASA BONANZA (CBZ)
 *
 * Inicialización SÍNCRONA.
 * CBZ_RESOURCES.resolve() devuelve la URL de forma inmediata.
 * Marzipano gestiona la carga real de la imagen por su cuenta.
 */

var CBZ_SCENES = {};    // mapa id → { data, marzipanoScene, resolvedUrl }
var CBZ_viewer = null;  // referencia global al visor Marzipano
var CBZ_sceneLimiter = null;

// ── Parámetros de cámara por defecto (hasta recibir renders finales)
var CBZ_DEFAULT_VIEW = {
  yaw:   0,
  pitch: 0,
  fov:   1.5707963267948966   // 90° en radianes
};

// ── Ancho por defecto para EquirectGeometry (hint de resolución)
// Se puede sobreescribir por escena con sceneData.resolution.
// Marzipano escala la imagen independientemente de este valor.
var CBZ_DEFAULT_PANO_WIDTH = 4096;

// ── Inicializar todas las escenas (SÍNCRONO) ──────────────────────
function CBZ_registerScene(data) {
  var resolver = window.CBZ_RESOURCES;
  if (!resolver) {
    console.error('[CBZ·Scenes] CBZ_RESOURCES no está definido. Verifica que resourceResolver.js se carga antes de scenes.js.');
    return null;
  }

  // Registrar sin fijar texturas: pinFirstLevel en createScene descargaría
  // el panorama incluso con la escena inactiva.
  var url = resolver.resolve(data);
  if (!url) {
    var emptyEntry = { data: data, marzipanoScene: null, resolvedUrl: null };
    CBZ_SCENES[data.id] = emptyEntry;
    return emptyEntry;
  }

  var source = Marzipano.ImageUrlSource.fromString(url);
  var panoWidth = (data.resolution !== null && data.resolution !== undefined)
    ? data.resolution
    : CBZ_DEFAULT_PANO_WIDTH;
  var geometry = new Marzipano.EquirectGeometry([{ width: panoWidth }]);
  var params = data.initialViewParameters || {};
  var viewParams = {
    yaw:   (params.yaw   !== null && params.yaw   !== undefined) ? params.yaw   : CBZ_DEFAULT_VIEW.yaw,
    pitch: (params.pitch !== null && params.pitch !== undefined) ? params.pitch : CBZ_DEFAULT_VIEW.pitch,
    fov:   (params.fov   !== null && params.fov   !== undefined) ? params.fov   : CBZ_DEFAULT_VIEW.fov
  };
  var view = new Marzipano.RectilinearView(viewParams, CBZ_sceneLimiter);
  var entry = {
    data: data,
    marzipanoScene: CBZ_viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: false
    }),
    resolvedUrl: url
  };

  CBZ_SCENES[data.id] = entry;
  return entry;
}

function CBZ_initScenes(viewer) {
  CBZ_viewer = viewer;
  CBZ_sceneLimiter = Marzipano.RectilinearView.limit.traditional(
    1024,
    100 * Math.PI / 180
  );

  CBZ_CONFIG.scenes.forEach(CBZ_registerScene);
}

function CBZ_sceneDataForTarget(targetId) {
  var target = String(targetId || '');
  var targetBase = target.replace(/\.(png|jpe?g|webp)$/i, '');
  var scenes = CBZ_CONFIG.scenes || [];
  // Los IDs y archivos configurados tienen prioridad sobre cualquier catálogo.
  var exact = scenes.filter(function (item) { return item.id === target || item.file === target; });
  var matches = exact.length ? exact : scenes.filter(function (item) {
    return item.id === targetBase || (item.file && item.file.replace(/\.(png|jpe?g|webp)$/i, '') === targetBase);
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) { console.warn('[CBZ] Destino ambiguo:', target); return null; }

  var file = target;
  var id = targetBase;
  if (!/\.(png|jpe?g|webp)$/i.test(target)) {
    var available = (typeof CBZ_ASSETS !== 'undefined' && CBZ_ASSETS.panoramas) || [];
    var candidates = available.filter(function (name) {
      return name.replace(/\.(png|jpe?g|webp)$/i, '') === target;
    });
    if (candidates.length !== 1) { console.warn('[CBZ] Destino sin archivo explícito o ambiguo:', target); return null; }
    file = candidates[0];
  }

  return {
    id: id,
    title: id,
    level: 'PB',
    file: file,
    resolution: null,
    initialViewParameters: null,
    hotspots: []
  };
}

// ── Cambiar de escena ─────────────────────────────────────────────
function CBZ_switchScene(targetId) {
  var sceneId = String(targetId || '');
  var entry = CBZ_SCENES[sceneId];

  if (!entry) {
    var data = CBZ_sceneDataForTarget(sceneId);
    if (!data) return;
    sceneId = data.id;
    entry = CBZ_SCENES[sceneId] || CBZ_registerScene(data);
  }

  if (!entry) {
    console.warn('[CBZ·Scenes] Escena no encontrada:', sceneId);
    return;
  }
  if (!entry.marzipanoScene) {
    console.error('[CBZ·Scenes] La escena "' + sceneId + '" no tiene panorama. Revisa config.js.');
    return;
  }

  if (CBZ_viewer.scene() === entry.marzipanoScene) return;

  // Solo las escenas visitadas conservan su textura. La fijación se hace
  // una vez y evita nuevas descargas cuando se vuelve a este panorama.
  if (!entry.panoramaPinned) {
    entry.marzipanoScene.layer().pinFirstLevel();
    entry.panoramaPinned = true;
  }

  var transition = document.getElementById('cbz-scene-transition');
  if (transition) {
    if (transition._timer) window.clearTimeout(transition._timer);
    transition.classList.remove('is-active');
    void transition.offsetWidth;
    transition.classList.add('is-active');
    transition._timer = window.setTimeout(function () {
      transition.classList.remove('is-active');
    }, 320);
  }

  entry.marzipanoScene.switchTo();

  var event = new CustomEvent('cbz:sceneChanged', {
    detail: { sceneId: sceneId, sceneData: entry.data }
  });
  document.dispatchEvent(event);
}
