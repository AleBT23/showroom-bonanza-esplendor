/**
 * dev-server.js — Servidor de desarrollo local para CASA BONANZA (CBZ)
 * ─────────────────────────────────────────────────────────────────────
 * USO:  node dev-server.js
 * URL:  http://127.0.0.1:8081/03_PROTOTIPO/index.html
 * EDIT: http://127.0.0.1:8081/03_PROTOTIPO/index.html?edit=1
 *
 * Reemplaza: npx http-server . -p 8081
 *
 * Lo que añade sobre http-server:
 *   POST /api/save-hotspots → escribe yaw/pitch en data/config.js
 *     quirúrgicamente (solo esos valores, sin tocar el resto).
 *
 * SOLO PARA DESARROLLO LOCAL.
 * En producción (GitHub Pages) este archivo NO se usa. El showroom
 * funciona normalmente como sitio estático.
 *
 * Requiere: Node.js (ya instalado). Sin npm install.
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// ── Configuración ────────────────────────────────────────────────
const PORT        = 8081;
const ROOT        = __dirname;   // C:\...\SHOWROOM_BONANZA
const VALID_PROPERTIES = new Set(['ESPLENDOR', 'BONANZA']);

function getProperty(req) {
  const raw = url.parse(req.url, true).query.property || 'ESPLENDOR';
  const property = String(raw).toUpperCase();
  return VALID_PROPERTIES.has(property) ? property : null;
}


// ── Tipos MIME ───────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.mp4':  'video/mp4'
};

// ════════════════════════════════════════════════════════════════
// PARCHE QUIRÚRGICO DE CONFIG.JS
// Solo reemplaza los valores yaw/pitch de hotspots existentes.
// El resto del archivo queda intacto.
//
// Recibe:
//   configText  → contenido actual de config.js como string
//   hotspotsMap → { sceneId: { hsId: { yaw, pitch } } }
//
// Devuelve:
//   { text: string, updated: number }
// ════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════
// PARCHE QUIRÚRGICO DE CONFIG.JS
// Reemplaza el array de hotspots completo para cada escena enviada.
//
// Recibe:
//   configText  → contenido actual de config.js como string
//   hotspotsMap → { sceneId: [ { id, target, label, yaw, pitch }, ... ] }
// ════════════════════════════════════════════════════════════════
function patchConfig(configText, hotspotsMap) {
  let text    = configText;
  let updated = 0;

  Object.keys(hotspotsMap).forEach(function (sceneId) {
    const newHotspots = hotspotsMap[sceneId];
    if (!Array.isArray(newHotspots)) return;

    // Formatear los hotspots como código JS
    const formattedHotspots = newHotspots.map(hs => {
      return `        {\n` +
             `          id:     '${hs.id}',\n` +
             `          target: '${hs.target}',\n` +
             `          label:  '${hs.label}',\n` +
             `          yaw:    ${hs.yaw.toFixed(6)},\n` +
             `          pitch:  ${hs.pitch.toFixed(6)}\n` +
             `        }`;
    }).join(',\n');

    const escapedId = sceneId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(id\\s*:\\s*['"]${escapedId}['"][\\s\\S]*?hotspots\\s*:\\s*\\[)([\\s\\S]*?)(\\])`, 'g');

    const before = text;
    text = text.replace(re, function (_match, p1, _oldContent, p3) {
      // Si el array está vacío, un formato limpio:
      const content = formattedHotspots ? `\n${formattedHotspots}\n      ` : '';
      return p1 + content + p3;
    });

    if (text !== before) updated++;
  });

  return { text: text, updated: updated };
}

// ════════════════════════════════════════════════════════════════
// MANEJADOR DEL ENDPOINT  POST /api/save-hotspots
// ════════════════════════════════════════════════════════════════
function handleSaveHotspots(req, res) {
  let body = '';
  req.on('data', function (chunk) { body += chunk.toString(); });
  req.on('end', function () {
    let hotspotsMap;
    try {
      hotspotsMap = JSON.parse(body);
    } catch (e) {
      return jsonResponse(res, 400, { ok: false, error: 'JSON inválido' });
    }

    const property = getProperty(req);
    if (!property) {
      return jsonResponse(res, 400, { ok: false, error: 'Propiedad inválida' });
    }
    const configPath = path.join(ROOT, '01_RECURSOS', property, 'config.js');
    let configText;
    try {
      configText = fs.readFileSync(configPath, 'utf8');
    } catch (e) {
      return jsonResponse(res, 500, { ok: false, error: 'No se pudo leer config.js' });
    }

    try {
      fs.writeFileSync(configPath + ".bak", configText, 'utf8');
    } catch (e) {
      return jsonResponse(res, 500, { ok: false, error: 'No se pudo crear backup' });
    }

    let result;
    try {
      result = patchConfig(configText, hotspotsMap);
    } catch (e) {
      return jsonResponse(res, 500, { ok: false, error: 'Error al procesar config.js' });
    }

    if (result.updated === 0) {
      return jsonResponse(res, 200, { ok: false, error: 'No se actualizó ninguna escena', updated: 0 });
    }

    try {
      fs.writeFileSync(configPath, result.text, 'utf8');
    } catch (e) {
      try { fs.writeFileSync(configPath, configText, 'utf8'); } catch (_) {}
      return jsonResponse(res, 500, { ok: false, error: 'Error al escribir config.js' });
    }

    console.log('[DEV] config.js actualizado — ' + result.updated + ' escenas modificadas.');
    return jsonResponse(res, 200, { ok: true, updated: result.updated });
  });
}

// ════════════════════════════════════════════════════════════════
// MANEJADOR DEL ENDPOINT  GET /api/renders
// ════════════════════════════════════════════════════════════════
function handleGetRenders(req, res) {
  const property = getProperty(req);
  if (!property) {
    return jsonResponse(res, 400, { ok: false, error: 'Propiedad inválida' });
  }
  const rendersPath = path.join(ROOT, '01_RECURSOS', property, '360');
  fs.readdir(rendersPath, (err, files) => {
    if (err) {
      return jsonResponse(res, 500, { ok: false, error: 'No se pudo leer el directorio 360' });
    }
    const renders = files.filter(f => /\.(png|jpe?g|webp)$/i.test(f));
    jsonResponse(res, 200, { ok: true, renders: renders });
  });
}

// ════════════════════════════════════════════════════════════════
// MANEJADOR DEL CATÁLOGO DINÁMICO DE LA EXPERIENCIA
// ════════════════════════════════════════════════════════════════
function listMedia(directory, relativeDirectory) {
  const directoryPath = path.join(ROOT, directory);
  if (!fs.existsSync(directoryPath)) return [];

  return fs.readdirSync(directoryPath)
    .filter(file => /\.(png|jpe?g|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }))
    .map(file => ({
      file: file,
      url: '/' + relativeDirectory + '/' + encodeURIComponent(file)
    }));
}

function handleGetShowroomAssets(req, res) {
  const property = getProperty(req);
  if (!property) {
    return jsonResponse(res, 400, { ok: false, error: 'Propiedad inválida' });
  }
  jsonResponse(res, 200, {
    ok: true,
    renders: listMedia('01_RECURSOS/' + property + '/RENDERS', '01_RECURSOS/' + property + '/RENDERS'),
    plans: listMedia('01_RECURSOS/' + property + '/PLANO', '01_RECURSOS/' + property + '/PLANO')
  });
}

// ════════════════════════════════════════════════════════════════
// SERVIDOR DE ARCHIVOS ESTÁTICOS
// ════════════════════════════════════════════════════════════════
function handleStatic(req, res) {
  let filePath = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));

  // Ruta raíz → index del prototipo
  if (filePath === ROOT || filePath === path.join(ROOT, '/')) {
    filePath = path.join(ROOT, '03_PROTOTIPO', 'index.html');
  }

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found: ' + req.url);
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type':  mime,
      'Cache-Control': 'no-store'   // sin caché en desarrollo
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

// ════════════════════════════════════════════════════════════════
// SERVIDOR HTTP PRINCIPAL
// ════════════════════════════════════════════════════════════════
function jsonResponse(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

const server = http.createServer(function (req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  const parsedUrl = url.parse(req.url);

  // API de guardado
  if (req.method === 'POST' && parsedUrl.pathname === '/api/save-hotspots') {
    return handleSaveHotspots(req, res);
  }

  // API de renders
  if (req.method === 'GET' && parsedUrl.pathname === '/api/renders') {
    return handleGetRenders(req, res);
  }

  // Catálogo de renders y plantas para la capa editorial
  if (req.method === 'GET' && parsedUrl.pathname === '/api/showroom-assets') {
    return handleGetShowroomAssets(req, res);
  }

  // Archivos estáticos
  handleStatic(req, res);
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  CASA BONANZA — Servidor de Desarrollo           ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Showroom:  http://127.0.0.1:8081/03_PROTOTIPO/ ║');
  console.log('║  Editor:    añade ?edit=1 a la URL               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

server.on('error', function (e) {
  if (e.code === 'EADDRINUSE') {
    console.error('ERROR: El puerto 8081 ya está en uso. Cierra el otro servidor primero.');
  } else {
    console.error('Error del servidor:', e.message);
  }
  process.exit(1);
});

