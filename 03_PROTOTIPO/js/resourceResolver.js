/**
 * resourceResolver.js — Resolutor de recursos CASA BONANZA (CBZ)
 *
 * Principio de operación:
 *   La resolución de URL es SÍNCRONA. Se construye la URL desde la
 *   ruta base centralizada + el nombre de archivo de config.js.
 *   Marzipano gestiona la carga real de la imagen por su cuenta.
 *
 *   La validación HTTP (HEAD) es OPCIONAL y ASÍNCRONA, se usa
 *   únicamente para diagnóstico en consola. JAMÁS bloquea el inicio.
 *
 * Compatibilidad: Marzipano 0.10.2 / Vanilla JS / sin dependencias.
 */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // RUTAS BASE — fuente única de verdad para ubicación de recursos.
  // Relativas a: 03_PROTOTIPO/index.html
  // ══════════════════════════════════════════════════════════════════
  var prop = window.CBZ_PROPERTY || 'ESPLENDOR';
  var BASE = {
    RECURSOS:  '../01_RECURSOS/' + prop + '/',
    PANORAMAS: '../01_RECURSOS/' + prop + '/360/',
    PLANOS:    '../01_RECURSOS/' + prop + '/PLANO/',
    VIDEO:     '../01_RECURSOS/' + prop + '/VIDEO/',
    BRANDING:  '../01_RECURSOS/' + prop + '/BRANDING/'
  };

  // ══════════════════════════════════════════════════════════════════
  // EXTENSIONES SOPORTADAS — para diagnóstico y auto-detección futura
  // ══════════════════════════════════════════════════════════════════
  var EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'];

  // ══════════════════════════════════════════════════════════════════
  // CONSTRUCCIÓN SÍNCRONA DE URL
  // ══════════════════════════════════════════════════════════════════
  function buildPanoUrl(filename) {
    // `file` siempre es un nombre de archivo, no una ruta. Codificarlo aquí
    // conserva nombres reales con espacios o caracteres como Ñ en GitHub Pages.
    return BASE.PANORAMAS + encodeURIComponent(String(filename));
  }

  // ══════════════════════════════════════════════════════════════════
  // RESOLVER SÍNCRONO — devuelve URL inmediatamente.
  //
  // Prioridad:
  //   1. sceneData.file  → archivo explícito (solo nombre, sin ruta)
  //   2. CBZ_CONFIG.placeholder → fallback global
  //   3. null → sin recurso (escena queda negra, error en consola)
  // ══════════════════════════════════════════════════════════════════
  function resolve(sceneData) {
    var url = null;

    if (sceneData.file) {
      url = buildPanoUrl(sceneData.file);
    } else if (CBZ_CONFIG.placeholder) {
      url = buildPanoUrl(CBZ_CONFIG.placeholder);
    }

    // Diagnóstico en consola (no bloquea nada)
    if (url) {
      _logAsync(sceneData, url);
    } else {
      console.error(
        '[CBZ·Resolver] ' + sceneData.id + ' — Sin file ni placeholder. ' +
        'El visor quedará negro para esta escena.'
      );
      _showOnScreenError(sceneData.id, '(sin archivo configurado)');
    }

    return url;
  }

  // ══════════════════════════════════════════════════════════════════
  // DIAGNÓSTICO ASÍNCRONO (fire-and-forget)
  // Verifica que la URL exista y registra el resultado.
  // NO bloquea la inicialización de Marzipano.
  //
  // IMPORTANTE: si esto falla (img.onerror), es la causa exacta del
  // síntoma "ya no dice Cargando pero la pantalla queda negra": Marzipano
  // activa la escena (el HUD se actualiza igual) aunque la textura nunca
  // haya llegado a WebGL. Por eso, además de loguear en consola, se pinta
  // un aviso visible en pantalla — un 404 aquí NUNCA debe quedar en
  // silencio.
  // ══════════════════════════════════════════════════════════════════
  function _logAsync(sceneData, url) {
    var img = new Image();
    img.onload = function () {
      console.log(
        '[CBZ·Resolver] ' + sceneData.id + ' — ' + sceneData.title + '\n' +
        '  Archivo: ' + url.split('/').pop() + '\n' +
        '  Ruta: ' + url + '\n' +
        '  Estado: ✓ OK'
      );
    };
    img.onerror = function () {
      console.error(
        '[CBZ·Resolver] ' + sceneData.id + ' — ' + sceneData.title + '\n' +
        '  ✗ ERROR: No se pudo cargar la imagen.\n' +
        '  Ruta: ' + url + '\n' +
        '  Verifica que el archivo existe EXACTAMENTE con ese nombre ' +
        '(mayúsculas/minúsculas incluidas) en 01_RECURSOS/360/.'
      );
      _showOnScreenError(sceneData.id, url);
    };
    img.src = url;
  }

  // ══════════════════════════════════════════════════════════════════
  // AVISO VISIBLE — para que un 404 nunca se confunda con "ya funciona"
  // solo porque el HUD dejó de decir "Cargando...".
  // ══════════════════════════════════════════════════════════════════
  function _showOnScreenError(sceneId, url) {
    var box = document.getElementById('cbz-resource-error');
    if (!box) {
      box = document.createElement('div');
      box.id = 'cbz-resource-error';
      box.style.position = 'fixed';
      box.style.bottom = '20px';
      box.style.left = '20px';
      box.style.right = '20px';
      box.style.zIndex = '9999';
      box.style.background = 'rgba(180,20,20,0.9)';
      box.style.color = '#fff';
      box.style.font = '12px/1.4 monospace';
      box.style.padding = '10px 14px';
      box.style.borderRadius = '4px';
      box.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(box);
    }
    box.textContent += (box.textContent ? '\n' : '') +
      '[CBZ] No se pudo cargar el panorama de "' + sceneId + '" → ' + url;
  }

  // ══════════════════════════════════════════════════════════════════
  // NORMALIZACIÓN — disponible para comparaciones opcionales de alias.
  // No se usa en el flujo principal de carga.
  // ══════════════════════════════════════════════════════════════════
  function normalize(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[\s\-_]+/g, '_')
      .trim();
  }

  // ══════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ══════════════════════════════════════════════════════════════════
  window.CBZ_RESOURCES = {
    BASE:         BASE,
    EXTENSIONS:   EXTENSIONS,
    buildPanoUrl: buildPanoUrl,
    resolve:      resolve,       // SÍNCRONO
    normalize:    normalize
  };

})();

