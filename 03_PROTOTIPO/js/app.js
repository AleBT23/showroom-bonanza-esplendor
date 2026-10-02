/**
 * app.js — Orquestador principal
 * CASA BONANZA (CBZ)
 *
 * Flujo de inicialización (todo SÍNCRONO):
 *   1. Crear visor Marzipano
 *   2. CBZ_initScenes()   — registra todas las escenas
 *   3. CBZ_initHotspots() — registra hotspots en cada escena
 *   4. CBZ_switchScene()  — activa la escena inicial → HUD actualiza
 */

(function () {
  'use strict';

  // ── Elemento contenedor del visor ────────────────────────────────
  var panoElement = document.getElementById('pano');

  // ── Crear el visor Marzipano ──────────────────────────────────────
  var viewer = new Marzipano.Viewer(panoElement, CBZ_CONFIG.viewer);

  // ── Suscribirse al evento de cambio de escena (HUD) ───────────────
  var hudTitle = document.getElementById('cbz-hud-title');
  var hudLevel = document.getElementById('cbz-hud-level');

  document.addEventListener('cbz:sceneChanged', function (e) {
    if (hudTitle) hudTitle.textContent = e.detail.sceneData.title.toUpperCase();
    if (hudLevel) {
      var lvl        = e.detail.sceneData.level;
      var displayLvl = (lvl === 'PB') ? 'PB' : 'PA';
      hudLevel.textContent = 'NIVEL: ' + displayLvl;
    }
    console.log('[CBZ] Escena activa:', e.detail.sceneId);
  });

  // ── Inicializar (sincrónico) ──────────────────────────────────────
  CBZ_initScenes(viewer);
  CBZ_initHotspots();

  // Activar escena inicial — este evento actualiza el HUD inmediatamente
  CBZ_switchScene('CBZ_360_01_ACCESO');

})();
