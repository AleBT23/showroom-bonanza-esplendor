'use strict';
const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const {audit,validateFile,listPanoramas}=require('./validate-panoramas');
function config(text){const c={};vm.runInNewContext(text,c);return JSON.parse(JSON.stringify(c.CBZ_CONFIG));}
const serverText=fs.readFileSync('dev-server.js','utf8');
const server={require,__dirname:__dirname,console,Buffer};
vm.createContext(server);
vm.runInContext(serverText.slice(0,serverText.indexOf('const server = http.createServer')),server);
for(const house of ['BONANZA','ESPLENDOR']){
 const original=fs.readFileSync('01_RECURSOS/'+house+'/config.js','utf8');
 const before=config(original);
 const id=before.scenes[0].id,file=listPanoramas(__dirname,house)[0];
 const changed=server.patchScenePanorama(original,id,file),expected=config(original);
 expected.scenes[0].file=file;
 assert.deepEqual(config(changed),expected,'Only the explicit file can change');
 assert.throws(()=>server.patchScenePanorama(original,'missing',file));
 assert.equal(validateFile(__dirname,house,file),file);
 assert.throws(()=>validateFile(__dirname,house,file.toLowerCase()),'Case-sensitive names');
 assert.throws(()=>validateFile(__dirname,house,'../'+file));
 assert.throws(()=>validateFile(__dirname,house,'missing.webp'));
}
const quoted="var CBZ_CONFIG={scenes:[{id:'one',file:'before.png',hotspots:[],menu:{title:'A [title]'}}]};";
assert.equal(config(server.patchScenePanorama(quoted,'one','Baño "Á" 100%.webp')).scenes[0].file,'Baño "Á" 100%.webp');
const noFile="var CBZ_CONFIG={scenes:[{id:'one',hotspots:[]}]};";
assert.equal(config(server.patchScenePanorama(noFile,'one','new.webp')).scenes[0].file,'new.webp');
let c={CBZ_CONFIG:{scenes:[{id:'fixed',file:'Baño principal.png',hotspots:[]}]},
 CBZ_ASSETS:{panoramas:['Baño principal.png','Baño principal.webp','Único.webp','Ambiguous.png','Ambiguous.webp']},console:{warn(){}}};
vm.createContext(c);vm.runInContext(fs.readFileSync('03_PROTOTIPO/js/scenes.js','utf8'),c);
assert.equal(c.CBZ_sceneDataForTarget('fixed').file,'Baño principal.png','Never auto-prefer WebP');
assert.equal(c.CBZ_sceneDataForTarget('Baño principal.webp').file,'Baño principal.png','Legacy basename alias preserves configured scene');
assert.equal(c.CBZ_sceneDataForTarget('Único').file,'Único.webp');
assert.equal(c.CBZ_sceneDataForTarget('Ambiguous'),null);
assert.equal(c.CBZ_sceneDataForTarget('Absent'),null);
assert.equal(c.CBZ_sceneDataForTarget('New.webp').file,'New.webp');
c.window={CBZ_PROPERTY:'BONANZA'};
vm.runInContext(fs.readFileSync('03_PROTOTIPO/js/resourceResolver.js','utf8'),c);
assert.equal(c.window.CBZ_RESOURCES.resolve({file:'Baño Á 100%.webp'}),'../01_RECURSOS/BONANZA/360/'+encodeURIComponent('Baño Á 100%.webp'));
let pins=0,active=null;
c.Marzipano={ImageUrlSource:{fromString:url=>url},EquirectGeometry:function(){},
 RectilinearView:Object.assign(function(){},{limit:{traditional:()=>null}})};
const viewer={createScene(opts){assert.equal(opts.pinFirstLevel,false);return{layer:()=>({pinFirstLevel(){pins++;}}),switchTo(){active=this;}};},scene:()=>active};
c.document={getElementById:()=>null,dispatchEvent(){}};
c.CustomEvent=function(){};
c.CBZ_initScenes(viewer);
assert.equal(pins,0,'Registration does not load inactive panoramas');
c.CBZ_switchScene('fixed');c.CBZ_switchScene('fixed');
assert.equal(pins,1,'Visited scene pinned only once');
// Validación con nombres de prueba en memoria: no se crean imágenes.
const mockFiles=['Baño.png','Baño.webp','Case.webp','case.webp'];
const virtualFS={readdirSync:()=>mockFiles.map(name=>({name,isFile:()=>true})),
 readFileSync:()=>"var CBZ_CONFIG={placeholder:'Baño.png',scenes:[{id:'a',file:'Baño.png'},{id:'b',file:'Baño.png'},{id:'c',file:'CASE.webp'},{id:'d',file:'Ba%C3%B1o.webp'}]};"};
const mock={module:{exports:{}},require:n=>n==='fs'?virtualFS:require(n),__dirname,console,process};
vm.runInNewContext(fs.readFileSync('validate-panoramas.js','utf8'),mock);
const sample=mock.module.exports.audit()[0];
assert.equal(sample.sharedReferences.length,1);
assert.equal(sample.filenameCollisions.length,1);
assert.equal(sample.basenameVariants.length,2);
assert.equal(sample.missing.length,2);
const real=audit();
for(const r of real){
 const cfg=config(fs.readFileSync('01_RECURSOS/'+r.property+'/config.js','utf8'));
 c.CBZ_CONFIG=cfg;
 for(const scene of cfg.scenes)for(const hs of scene.hotspots){
  const dest=c.CBZ_sceneDataForTarget(hs.target);
  assert(dest && cfg.scenes.some(s=>s.id===dest.id),'Broken hotspot '+hs.target);
 }
}
console.log('PASS: explicit references; PNG/WebP coexistence; surgical save; aliases; accents/encoding; ambiguity/case validation; lazy loading and one-time pinning; hotspot destinations in both houses.');

