'use strict';
// Solo lee las configuraciones y nombres de 360 en el proyecto principal.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const PROPERTIES = ['BONANZA', 'ESPLENDOR'];
const EXTENSION = /\.(png|jpe?g|webp)$/i;
function listPanoramas(root, property) {
  if (!PROPERTIES.includes(property)) throw new Error('Propiedad inválida');
  return fs.readdirSync(path.join(root, '01_RECURSOS', property, '360'), {withFileTypes:true})
    .filter(e => e.isFile() && EXTENSION.test(e.name)).map(e => e.name).sort();
}
function validateFile(root, property, file) {
  if (typeof file !== 'string' || !EXTENSION.test(file) || /[\\/]/.test(file) ||
      !listPanoramas(root, property).includes(file)) {
    throw new Error('Elige un archivo existente con su nombre y mayúsculas exactos: ' + file);
  }
  return file;
}
function audit(root = __dirname) {
  return PROPERTIES.map(property => {
    const context = {};
    new vm.Script(fs.readFileSync(path.join(root,'01_RECURSOS',property,'config.js'),'utf8'))
      .runInNewContext(context,{timeout:1000});
    const config = context.CBZ_CONFIG, files = listPanoramas(root,property);
    const key = s => String(s).normalize('NFC').toLowerCase();
    const stem = s => key(s).replace(EXTENSION,'');
    function inspect(file) {
      if (typeof file !== 'string' || !file) return {file:file || null, exists:false, issue:'Sin archivo'};
      if (files.includes(file)) return {file, exists:true};
      let decoded;
      try { decoded=decodeURIComponent(file); } catch (_) {}
      const similar = files.filter(f => key(f)===key(file) || (decoded && key(f)===key(decoded)));
      return {file, exists:false, issue:similar.length ? 'Mayúsculas, Unicode o URL codificada: no coincide exactamente' : 'Archivo ausente', candidates:similar};
    }
    const scenes = config.scenes.map(scene => Object.assign({id:scene.id,
      format:(String(scene.file || config.placeholder || '').match(EXTENSION)||[])[1] || 'sin formato'},
      inspect(scene.file || config.placeholder)));
    function groups(values, by) {
      const map = new Map();
      values.forEach(v => { const k=by(v); if (!map.has(k)) map.set(k,[]); map.get(k).push(v); });
      return Array.from(map.values()).filter(g => g.length>1);
    }
    return {property, png:scenes.filter(s=>/^png$/i.test(s.format)).length,
      webp:scenes.filter(s=>/^webp$/i.test(s.format)).length, scenes,
      missing:scenes.filter(s=>!s.exists), placeholder:inspect(config.placeholder),
      sharedReferences:groups(scenes,s=>s.file).map(g=>({file:g[0].file,scenes:g.map(s=>s.id)})),
      filenameCollisions:groups(files,key),
      basenameVariants:groups(files,stem)};
  });
}
module.exports={listPanoramas,validateFile,audit};
if(require.main===module) {
  const report=audit();
  if(process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
  else report.forEach(r=>{
    console.log(r.property+': '+r.webp+' WebP, '+r.png+' PNG; '+r.missing.length+' referencias ausentes.');
    r.missing.forEach(s=>console.log('  FALTA '+s.id+' -> '+s.file+' ('+s.issue+')'));
    if(!r.placeholder.exists) console.log('  RESPALDO AUSENTE: '+r.placeholder.file);
    console.log('  Referencias compartidas: '+r.sharedReferences.length+
      '; colisiones de nombres: '+r.filenameCollisions.length+'; variantes de un mismo nombre base: '+r.basenameVariants.length);
  });
  if(report.some(r=>r.missing.length || r.filenameCollisions.length || !r.placeholder.exists)) process.exitCode=1;
}
