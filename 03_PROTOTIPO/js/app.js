/**
 * app.js — Orquestador principal
 * CASA BONANZA (CBZ)
 *
 * Flujo de inicialización (todo SÍNCRONO):
 *   1. Crear visor Marzipano
 *   2. CBZ_initScenes()   — registra todas las escenas
 *   3. CBZ_initHotspots() — registra hotspots en cada escena
 *   4. Activar acceso al iniciar recorrido, o inmediatamente en el editor.
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
    var sceneData = e.detail.sceneData || {};
    var configuredScene = (CBZ_CONFIG.scenes || []).find(function (scene) {
      return scene.id === sceneData.id;
    });
    var menuTitle = (sceneData.menu && sceneData.menu.title) ||
      (configuredScene && configuredScene.menu && configuredScene.menu.title);
    var fallbackTitle = sceneData.title || sceneData.id || '';
    if (!menuTitle) {
      fallbackTitle = String(fallbackTitle)
        .replace(/\.(png|jpe?g|webp)$/i, '')
        .replace(/^CBZ_360(?:_\d+)?_/i, '')
        .replace(/^CBZ_/i, '')
        .replace(/^\d+[_\s]+/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
    }
    var visibleTitle = menuTitle || fallbackTitle;
    if (hudTitle) hudTitle.textContent = String(visibleTitle).toUpperCase();
    if (hudLevel) {
      var lvl        = sceneData.level;
      var displayLvl = (lvl === 'PB') ? 'PB' : 'PA';
      hudLevel.textContent = 'NIVEL: ' + displayLvl;
    }
    console.log('[CBZ] Escena activa:', e.detail.sceneId);
  });

  // ── Inicializar (sincrónico) ──────────────────────────────────────
  CBZ_initScenes(viewer);
  CBZ_initHotspots();

  // En presentación/selector se registran escenas sin descargar panoramas.
  // Los botones de iniciar recorrido activan el acceso cuando se necesita.
  if (new URLSearchParams(window.location.search).get('edit') === '1' ||
      !document.getElementById('cbz-hero')) {
    CBZ_switchScene('CBZ_360_01_ACCESO');
  }

})();
