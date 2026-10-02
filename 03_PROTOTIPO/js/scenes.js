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
function CBZ_initScenes(viewer) {
  CBZ_viewer = viewer;

  var limiter = Marzipano.RectilinearView.limit.traditional(
    1024,
    100 * Math.PI / 180
  );

  CBZ_CONFIG.scenes.forEach(function (data) {

    // Resolver URL sincrónicamente — nunca bloquea
    var resolver = window.CBZ_RESOURCES;
    if (!resolver) {
      console.error('[CBZ·Scenes] CBZ_RESOURCES no está definido. Verifica que resourceResolver.js se carga antes de scenes.js.');
      return;
    }
    var url = resolver.resolve(data);

    if (!url) {
      // Sin URL: registrar escena vacía para que la arquitectura no se rompa
      CBZ_SCENES[data.id] = { data: data, marzipanoScene: null, resolvedUrl: null };
      return;
    }

    var source   = Marzipano.ImageUrlSource.fromString(url);
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

    var view = new Marzipano.RectilinearView(viewParams, limiter);

    var marzipanoScene = viewer.createScene({
      source:        source,
      geometry:      geometry,
      view:          view,
      pinFirstLevel: true
    });

    CBZ_SCENES[data.id] = {
      data:           data,
      marzipanoScene: marzipanoScene,
      resolvedUrl:    url
    };
  });
}

// ── Cambiar de escena ─────────────────────────────────────────────
function CBZ_switchScene(targetId) {
  var entry = CBZ_SCENES[targetId];

  if (!entry) {
    console.warn('[CBZ·Scenes] Escena no encontrada:', targetId);
    return;
  }
  if (!entry.marzipanoScene) {
    console.error('[CBZ·Scenes] La escena "' + targetId + '" no tiene panorama. Revisa config.js.');
    return;
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
    detail: { sceneId: targetId, sceneData: entry.data }
  });
  document.dispatchEvent(event);
}
