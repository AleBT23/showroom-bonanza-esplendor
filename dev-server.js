/**
 * dev-server.js — Servidor de desarrollo local para CASA BONANZA (CBZ)
 * ─────────────────────────────────────────────────────────────────────
 * USO:  node dev-server.js
 * URL:  http://127.0.0.1:8080/03_PROTOTIPO/index.html
 * EDIT: http://127.0.0.1:8080/03_PROTOTIPO/index.html?edit=1
 *
 * Reemplaza: npx http-server . -p 8080
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
const vm   = require('vm');
const resourceIndex = require('./generate-assets');
const panoramaFiles = require('./validate-panoramas');

// ── Configuración ────────────────────────────────────────────────
const PORT        = 8080;
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
  '.avif': 'image/avif',
  '.gif':  'image/gif',
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
// Localiza propiedades y arrays por sus límites sintácticos, admitiendo claves
// JS y JSON. Los comentarios, strings y arrays anidados no son delimitadores.
function locateConfigScenes(text) {
  const tokens = [];
  const lexer = /\s+|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[A-Za-z_$][\w$]*|[\s\S]/g;
  let match;
  while ((match = lexer.exec(text))) {
    const raw = match[0];
    if (/^\s/.test(raw) || raw.startsWith('//') || raw.startsWith('/*')) continue;
    if (raw === '`') throw new Error('Formato de plantilla no soportado en config.js');
    const value = raw[0] === '"' || raw[0] === "'"
      ? vm.runInNewContext(raw, {}, { timeout: 1000 }) : raw;
    tokens.push({ value, raw, start: match.index, end: lexer.lastIndex });
  }
  const closes = new Map();
  const stack = [];
  tokens.forEach(function (token, index) {
    if (['{', '[', '('].includes(token.raw)) stack.push(index);
    if (['}', ']', ')'].includes(token.raw)) {
      const open = stack.pop();
      if (open === undefined || '{[('.indexOf(tokens[open].raw) !== '}])'.indexOf(token.raw)) {
        throw new Error('Delimitadores inconsistentes en config.js');
      }
      closes.set(open, index);
    }
  });
  if (stack.length) throw new Error('Delimitadores incompletos en config.js');

  function property(objectIndex, key) {
    for (let i = objectIndex + 1; i < closes.get(objectIndex); i++) {
      if (tokens[i].value === key && tokens[i + 1].raw === ':') return i + 2;
      if (closes.has(i)) i = closes.get(i);
    }
    return -1;
  }
  const assignment = tokens.findIndex(function (token, i) {
    return token.raw === 'CBZ_CONFIG' && tokens[i + 1]?.raw === '=' && tokens[i + 2]?.raw === '{';
  });
  const array = assignment < 0 ? -1 : property(assignment + 2, 'scenes');
  if (array < 0 || tokens[array].raw !== '[') throw new Error('No se encontró CBZ_CONFIG.scenes');
  const scenes = new Map();
  for (let i = array + 1; i < closes.get(array); i++) {
    if (tokens[i].raw !== '{') continue;
    const idIndex = property(i, 'id');
    const hotspots = property(i, 'hotspots');
    if (idIndex < 0) throw new Error('Escena sin ID en config.js');
    const id = String(tokens[idIndex].value);
    if (scenes.has(id)) throw new Error('ID de escena duplicado en config.js: ' + id);
    if (hotspots < 0 || tokens[hotspots].raw !== '[') {
      throw new Error('Array de hotspots inválido en la escena ' + id);
    }
    const menu = property(i, 'menu');
    const file = property(i, 'file');
    scenes.set(id, {
      start: tokens[hotspots].end, end: tokens[closes.get(hotspots)].start,
      objectStart: tokens[i].end,
      file: file < 0 ? null : { start: tokens[file].start, end: tokens[file].end },
      menu: menu < 0 ? null : { start: tokens[menu].start,
        end: tokens[closes.has(menu) ? closes.get(menu) : menu].end }
    });
    i = closes.get(i);
  }
  return { scenes, arrayEnd: tokens[closes.get(array)].start,
    trailingComma: tokens[closes.get(array) - 1].raw === ',' };
}

function patchConfig(configText, hotspotsMap) {
  let text    = configText;
  let updated = 0;
  let matched = 0;

  Object.keys(hotspotsMap).forEach(function (sceneId) {
    // __sceneDefinitions accompanies the hotspot arrays as scene metadata;
    // it is not itself an array of hotspot records.
    if (sceneId === '__sceneDefinitions') return;
    const newHotspots = hotspotsMap[sceneId];
    if (!Array.isArray(newHotspots)) return;

    // Formatear los hotspots como código JS
    const formattedHotspots = newHotspots.map(hs => {
      if (!hs || typeof hs !== 'object') {
        throw new Error('Registro de hotspot inválido en la escena ' + sceneId);
      }
      const yaw = Number(hs.yaw);
      const pitch = Number(hs.pitch);
      if (!Number.isFinite(yaw) || !Number.isFinite(pitch)) {
        throw new Error('Coordenadas inválidas para el hotspot ' + String(hs.id || '(sin ID)'));
      }
      return `        {\n` +
             `          id:     ${JSON.stringify(String(hs.id == null ? '' : hs.id))},\n` +
             `          target: ${JSON.stringify(String(hs.target == null ? '' : hs.target))},\n` +
             `          label:  ${JSON.stringify(String(hs.label == null ? '' : hs.label))},\n` +
             `          yaw:    ${yaw},\n` +
             `          pitch:  ${pitch}\n` +
             `        }`;
    }).join(',\n');

    const range = locateConfigScenes(text).scenes.get(sceneId);
    if (!range) return;
    const before = text;
    const content = formattedHotspots ? `\n${formattedHotspots}\n      ` : '';
    text = text.slice(0, range.start) + content + text.slice(range.end);
    matched++;
    if (text !== before) updated++;
  });

  // El editor permite visitar y editar escenas resueltas bajo demanda que
  // todavía no tienen una entrada en CBZ_CONFIG. Añadir esas definiciones al
  // final del array para que sus hotspots sobrevivan a una recarga.
  const sceneDefinitions = Array.isArray(hotspotsMap.__sceneDefinitions)
    ? hotspotsMap.__sceneDefinitions
    : [];
  sceneDefinitions.forEach(function (scene) {
    if (!scene || !scene.id || !Array.isArray(hotspotsMap[scene.id])) return;

    const locations = locateConfigScenes(text);
    if (locations.scenes.has(String(scene.id))) return;

    if (typeof scene.file !== 'string' || !/\.(png|jpe?g|webp)$/i.test(scene.file)) throw new Error('Archivo de escena explícito requerido');
    const newScene = {
      id: String(scene.id),
      title: String(scene.title || scene.id),
      description: String(scene.description || ''),
      level: String(scene.level || 'PB'),
      file: String(scene.file || ''),
      basename: String(scene.basename || String(scene.file || '').replace(/\.(png|jpe?g|webp)$/i, '')),
      resolution: scene.resolution == null ? null : Number(scene.resolution),
      initialViewParameters: scene.initialViewParameters || null,
      hotspots: hotspotsMap[scene.id]
    };
    const sceneCode = JSON.stringify(newScene, null, 2)
      .split('\n')
      .map(line => '    ' + line)
      .join('\n');
    const insertion = (locations.scenes.size && !locations.trailingComma ? ',' : '') + '\n\n' + sceneCode + '\n  ';
    text = text.slice(0, locations.arrayEnd) + insertion + text.slice(locations.arrayEnd);
    updated++;
    matched++;
  });

  return { text: text, updated: updated, matched: matched };
}

function verifyHotspotsPersisted(configText, hotspotsMap) {
  const context = {};
  try {
    new vm.Script(configText, { filename: 'config.js' }).runInNewContext(context, { timeout: 1000 });
  } catch (error) {
    throw new Error('config.js resultante no es JavaScript válido: ' + error.message);
  }

  const config = context.CBZ_CONFIG;
  if (!config || !Array.isArray(config.scenes)) {
    throw new Error('config.js no contiene un arreglo CBZ_CONFIG.scenes válido');
  }

  Object.keys(hotspotsMap).forEach(function (sceneId) {
    if (sceneId === '__sceneDefinitions') return;
    const expected = hotspotsMap[sceneId];
    if (!Array.isArray(expected)) return;

    const scene = config.scenes.find(function (item) { return item.id === sceneId; });
    if (!scene) throw new Error('No se encontró la escena ' + sceneId + ' en config.js');
    const actual = Array.isArray(scene.hotspots) ? scene.hotspots : [];
    if (actual.length !== expected.length) {
      throw new Error('La escena ' + sceneId + ' tiene ' + actual.length +
        ' hotspots persistidos; se esperaban ' + expected.length);
    }

    expected.forEach(function (hotspot, index) {
      const saved = actual[index];
      const expectedYaw = Number(hotspot.yaw);
      const expectedPitch = Number(hotspot.pitch);
      if (!saved || String(saved.id) !== String(hotspot.id) ||
          String(saved.target) !== String(hotspot.target) ||
          String(saved.label) !== String(hotspot.label) ||
          !Number.isFinite(Number(saved.yaw)) || !Number.isFinite(Number(saved.pitch)) ||
          Math.abs(Number(saved.yaw) - expectedYaw) > 0.00000051 ||
          Math.abs(Number(saved.pitch) - expectedPitch) > 0.00000051) {
        throw new Error('Los datos del hotspot ' + String(hotspot.id || (index + 1)) +
          ' no coinciden con lo enviado para ' + sceneId);
      }
    });
  });

  return true;
}

function patchSceneMenus(configText, menuMap) {
  let text = configText;
  let updated = 0;

  Object.keys(menuMap).forEach(function (sceneId) {
    const menu = menuMap[sceneId];
    if (!menu || typeof menu !== 'object') return;
    const range = locateConfigScenes(text).scenes.get(sceneId);
    if (!range) throw new Error('No se encontró la escena ' + sceneId);
    const safeMenu = {
      visible: menu.visible !== false,
      title: String(menu.title || sceneId),
      level: String(menu.level || 'PB'),
      levelTitle: String(menu.levelTitle || menu.level || 'PB'),
      order: Math.max(1, Math.floor(Number(menu.order) || 1))
    };
    const formatted = JSON.stringify(safeMenu);
    if (range.menu) {
      text = text.slice(0, range.menu.start) + formatted + text.slice(range.menu.end);
    } else {
      text = text.slice(0, range.objectStart) + '\n      menu: ' + formatted + ',' + text.slice(range.objectStart);
    }
    updated++;
  });

  return { text: text, updated: updated };
}

function verifySceneMenus(configText, menuMap) {
  const context = {};
  new vm.Script(configText).runInNewContext(context, { timeout: 1000 });
  Object.keys(menuMap).forEach(function (sceneId) {
    const scene = context.CBZ_CONFIG.scenes.find(item => item.id === sceneId);
    const expected = menuMap[sceneId];
    if (!scene || !scene.menu || ['visible', 'title', 'level', 'levelTitle', 'order'].some(
      key => scene.menu[key] !== expected[key])) {
      throw new Error('La lista de espacios no quedó persistida para ' + sceneId);
    }
  });
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

    let result;
    try {
      result = patchConfig(configText, hotspotsMap);
    } catch (e) {
      console.error('[DEV] No se pudo procesar el guardado de hotspots:', e.message);
      return jsonResponse(res, 400, { ok: false, error: 'Payload de hotspots inválido: ' + e.message });
    }

    if (result.matched === 0) {
      return jsonResponse(res, 200, { ok: false, error: 'No se actualizó ninguna escena', updated: 0 });
    }

    try {
      verifyHotspotsPersisted(result.text, hotspotsMap);
    } catch (e) {
      console.error('[DEV] Verificación previa del guardado fallida:', e.message);
      return jsonResponse(res, 500, { ok: false, error: 'No se pudo verificar config.js: ' + e.message });
    }

    // Un guardado sin cambios también es válido; el archivo actual ya fue
    // leído y comprobado contra el payload antes de confirmar.
    if (result.updated === 0) {
      return jsonResponse(res, 200, { ok: true, persisted: true, updated: 0 });
    }

    try {
      fs.writeFileSync(configPath, result.text, 'utf8');
    } catch (e) {
      try { fs.writeFileSync(configPath, configText, 'utf8'); } catch (_) {}
      return jsonResponse(res, 500, { ok: false, error: 'Error al escribir config.js: ' + e.message });
    }

    try {
      const writtenText = fs.readFileSync(configPath, 'utf8');
      verifyHotspotsPersisted(writtenText, hotspotsMap);
    } catch (e) {
      try { fs.writeFileSync(configPath, configText, 'utf8'); } catch (_) {}
      console.error('[DEV] Verificación posterior del guardado fallida:', e.message);
      return jsonResponse(res, 500, { ok: false, error: 'El guardado no quedó persistido: ' + e.message });
    }

    console.log('[DEV] config.js actualizado — ' + result.updated + ' escenas modificadas.');
    return jsonResponse(res, 200, { ok: true, persisted: true, updated: result.updated });
  });
}

// Cambia exclusivamente el archivo de una escena: ID y hotspots permanecen iguales.
function patchScenePanorama(configText, sceneId, file) {
  const range = locateConfigScenes(configText).scenes.get(sceneId);
  if (!range) throw new Error('Escena no encontrada: ' + sceneId);
  const value = JSON.stringify(file);
  return range.file
    ? configText.slice(0, range.file.start) + value + configText.slice(range.file.end)
    : configText.slice(0, range.objectStart) + '\n      file: ' + value + ',' + configText.slice(range.objectStart);
}
function handleSaveScenePanorama(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    const property = getProperty(req);
    if (!property) return jsonResponse(res,400,{ok:false,error:'Propiedad inválida'});
    let configPath, original;
    try {
      const data = JSON.parse(body);
      const file = panoramaFiles.validateFile(ROOT,property,data.file);
      configPath = path.join(ROOT,'01_RECURSOS',property,'config.js');
      original = fs.readFileSync(configPath,'utf8');
      const next = patchScenePanorama(original,String(data.sceneId),file);
      const context = {};
      new vm.Script(next).runInNewContext(context,{timeout:1000});
      if (!context.CBZ_CONFIG.scenes.some(s=>s.id===data.sceneId && s.file===file)) throw new Error('Referencia no verificada');
      if (next !== original) fs.writeFileSync(configPath,next,'utf8');
      if (fs.readFileSync(configPath,'utf8') !== next) throw new Error('Guardado no verificado');
      return jsonResponse(res,200,{ok:true,persisted:true,file:file});
    } catch (error) {
      if (configPath && original !== undefined) {
        try { if(fs.readFileSync(configPath,'utf8')!==original) fs.writeFileSync(configPath,original,'utf8'); } catch (_) {}
      }
      return jsonResponse(res,400,{ok:false,error:error.message});
    }
  });
}

function handleSaveSceneMenu(req, res) {
  let body = '';
  req.on('data', function (chunk) { body += chunk.toString(); });
  req.on('end', function () {
    let menuMap;
    try {
      menuMap = JSON.parse(body);
    } catch (e) {
      return jsonResponse(res, 400, { ok: false, error: 'JSON inválido' });
    }
    const property = getProperty(req);
    if (!property) return jsonResponse(res, 400, { ok: false, error: 'Propiedad inválida' });

    const configPath = path.join(ROOT, '01_RECURSOS', property, 'config.js');
    let configText;
    try {
      configText = fs.readFileSync(configPath, 'utf8');
    } catch (e) {
      return jsonResponse(res, 500, { ok: false, error: 'No se pudo leer config.js' });
    }
    let result;
    try {
      result = patchSceneMenus(configText, menuMap);
      verifySceneMenus(result.text, menuMap);
    } catch (e) {
      return jsonResponse(res, 500, { ok: false, error: 'Error al procesar la lista de espacios: ' + e.message });
    }
    if (result.updated === 0) {
      return jsonResponse(res, 400, { ok: false, error: 'No se encontró ninguna escena para actualizar', updated: 0 });
    }
    try {
      fs.writeFileSync(configPath, result.text, 'utf8');
      verifySceneMenus(fs.readFileSync(configPath, 'utf8'), menuMap);
    } catch (e) {
      try { fs.writeFileSync(configPath, configText, 'utf8'); } catch (_) {}
      return jsonResponse(res, 500, { ok: false, error: 'Error al escribir config.js' });
    }
    console.log('[DEV] Lista de espacios guardada en ' + property + ' — ' + result.updated + ' escenas.');
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
  try {
    jsonResponse(res,200,{ok:true,renders:panoramaFiles.listPanoramas(ROOT,property)});
  } catch (error) {
    jsonResponse(res,500,{ok:false,error:'No se pudo leer el directorio 360'});
  }
}

// ════════════════════════════════════════════════════════════════
// MANEJADOR DEL CATÁLOGO DINÁMICO DE LA EXPERIENCIA
// ════════════════════════════════════════════════════════════════
function handleGetShowroomAssets(req, res) {
  const property = getProperty(req);
  if (!property) {
    return jsonResponse(res, 400, { ok: false, error: 'Propiedad inválida' });
  }
  jsonResponse(res, 200, {
    ok: true,
    renders: resourceIndex.listMedia(ROOT, property, 'RENDERS'),
    plans: resourceIndex.listMedia(ROOT, property, 'PLANO')
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
    'Content-Type':                'application/json; charset=utf-8',
    'Content-Length':              Buffer.byteLength(body),
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

  if (req.method === 'POST' && parsedUrl.pathname === '/api/save-scene-menu') {
    return handleSaveSceneMenu(req, res);
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/save-scene-panorama') {
    return handleSaveScenePanorama(req, res);
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

resourceIndex.generateAssets(ROOT);
server.listen(PORT, '0.0.0.0', function () {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  CASA BONANZA — Servidor de Desarrollo           ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Showroom:  http://127.0.0.1:8080/03_PROTOTIPO/ ║');
  console.log('║  Editor:    añade ?edit=1 a la URL               ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

server.on('error', function (e) {
  if (e.code === 'EADDRINUSE') {
    console.error('ERROR: El puerto 8080 ya está en uso. Cierra el otro servidor primero.');
  } else {
    console.error('Error del servidor:', e.message);
  }
  process.exit(1);
});
