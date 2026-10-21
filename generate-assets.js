'use strict';

// Catálogo compartido por el servidor local y la publicación estática.
// Solo lee nombres; no abre ni descarga imágenes.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { listPanoramas } = require('./validate-panoramas');
const PROPERTIES = ['ESPLENDOR', 'BONANZA'];
const IMAGE_EXTENSION = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

function listMedia(root, property, folder) {
  if (!PROPERTIES.includes(property) || !['RENDERS', 'PLANO'].includes(folder)) {
    throw new Error('Carpeta de recursos inválida');
  }
  const directory = path.join(root, '01_RECURSOS', property, folder);
  let files;
  try {
    files = fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return files.filter(entry => entry.isFile() && IMAGE_EXTENSION.test(entry.name))
    // Entrada pertenece al selector. Portada ya estaba reservada y excluida.
    .filter(entry => folder !== 'RENDERS' || !/^(entrada|portada)$/i.test(
      entry.name.replace(IMAGE_EXTENSION, '').normalize('NFC')))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }) || a.localeCompare(b))
    .map(file => ({ file, url: '../01_RECURSOS/' + property + '/' + folder + '/' + encodeURIComponent(file) }));
}

function generateAssets(root = __dirname) {
  return PROPERTIES.map(property => {
    const target = path.join(root, '01_RECURSOS', property, 'assets.js');
    const context = {};
    // Conservar el video; indexar nombres de panoramas sin cambiar escenas.
    new vm.Script(fs.readFileSync(target, 'utf8'), { filename: target })
      .runInNewContext(context, { timeout: 1000 });
    if (!context.CBZ_ASSETS || typeof context.CBZ_ASSETS !== 'object') {
      throw new Error('Catálogo CBZ_ASSETS inválido: ' + target);
    }
    const assets = context.CBZ_ASSETS;
    assets.panoramas = listPanoramas(root, property);
    assets.renders = listMedia(root, property, 'RENDERS');
    assets.plans = listMedia(root, property, 'PLANO');
    const text = '// Generado por node generate-assets.js. Rutas relativas a 03_PROTOTIPO/index.html.\n' +
      '// Renders y planos se regeneran desde sus carpetas; Entrada y Portada están reservadas.\n' +
      'var CBZ_ASSETS = ' + JSON.stringify(assets, null, 2) + ';\n';
    if (fs.readFileSync(target, 'utf8') !== text) fs.writeFileSync(target, text, 'utf8');
    return { property, renders: assets.renders.length, plans: assets.plans.length };
  });
}

module.exports = { generateAssets, listMedia };
if (require.main === module) {
  generateAssets().forEach(result => console.log(
    result.property + ': ' + result.renders + ' renders, ' + result.plans + ' planos.'));
}
