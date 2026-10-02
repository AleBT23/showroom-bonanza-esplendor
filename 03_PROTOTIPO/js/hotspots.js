/**
 * hotspots.js — Gestor de hotspots
 * CASA BONANZA (CBZ) — Fase 1.2: arquitectura de escenas
 *
 * Responsabilidades:
 *   - Crear elementos DOM para los hotspots de cada escena
 *   - Registrarlos en Marzipano usando scene.hotspotContainer()
 *   - Usar coordenadas reales (yaw/pitch) si están disponibles,
 *     o distribuirlos en fila para prueba si son null
 *   - Al hacer clic en un hotspot → llamar CBZ_switchScene(targetId)
 *
 * NOTA: Las coordenadas null son temporales.
 * Se reemplazarán por los valores reales al recibir los renders.
 */

// ── Posiciones de prueba para hotspots sin coordenadas ────────────
// Se distribuyen en fila horizontal frente al usuario.
// Estos valores SOLO se usan mientras yaw/pitch sean null.
var CBZ_HOTSPOT_FALLBACK_POSITIONS = [
  { yaw:  -0.5, pitch: 0 },
  { yaw:   0,   pitch: 0 },
  { yaw:   0.5, pitch: 0 },
  { yaw:   1.0, pitch: 0 }
];

// ── Inicializar hotspots de todas las escenas ─────────────────────
function CBZ_initHotspots() {
  CBZ_CONFIG.scenes.forEach(function (sceneData) {
    var entry = CBZ_SCENES[sceneData.id];
    if (!entry) return;

    var container = entry.marzipanoScene.hotspotContainer();

    sceneData.hotspots.forEach(function (hsData, index) {
      // Resolver coordenadas: reales o fallback de prueba
      var yaw, pitch;
      if (hsData.yaw !== null && hsData.pitch !== null) {
        yaw   = hsData.yaw;
        pitch = hsData.pitch;
      } else {
        var fallback = CBZ_HOTSPOT_FALLBACK_POSITIONS[index % CBZ_HOTSPOT_FALLBACK_POSITIONS.length];
        yaw   = fallback.yaw;
        pitch = fallback.pitch;
      }

      // Crear elemento DOM del hotspot
      var el = CBZ_createHotspotElement(hsData);

      // Registrar en Marzipano
      container.createHotspot(el, { yaw: yaw, pitch: pitch });
    });
  });
}

// ── Crear elemento DOM de un hotspot ─────────────────────────────
function CBZ_createHotspotElement(hsData) {
  var wrapper = document.createElement('div');
  wrapper.className   = 'cbz-hotspot';
  wrapper.dataset.id  = hsData.id;
  wrapper.dataset.target = hsData.target;
  wrapper.title       = 'Ir a: ' + hsData.label;

  // Ícono (CSS maneja el círculo y el punto central)
  var icon = document.createElement('div');
  icon.className = 'cbz-hotspot__icon';

  // Etiqueta de texto
  var label = document.createElement('span');
  label.className   = 'cbz-hotspot__label';
  label.textContent = hsData.label;

  wrapper.appendChild(icon);
  wrapper.appendChild(label);

  // Evento de clic: navegar a la escena destino
  wrapper.addEventListener('click', function () {
    CBZ_switchScene(hsData.target);
  });

  return wrapper;
}
