/**
 * hotspotEditor.js — Modo Editor de Hotspots Avanzado
 * CASA BONANZA (CBZ)
 *
 * Activación: ?edit=1 en la URL
 */

(function () {
  'use strict';

  // ── Verificar activación ────────────────────────────────────────
  var params = new URLSearchParams(window.location.search);
  if (params.get('edit') !== '1') return;

  // ── Estado interno del editor ───────────────────────────────────
  var CBZ_EDITOR = {
    activeSceneId:    null,
    selectedHotspot:  null,
    dragging:         false,
    registry:         {}, // sceneId → [ { hsData, mzHotspot, el } ]
    fileToSceneId:    {}, // Mapea archivo físico a ID de escena
    availableFiles:   [], // Lista de archivos disponibles en 01_RECURSOS/360/
    initialized:      false
  };

  // ══════════════════════════════════════════════════════════════════
  // INICIALIZACIÓN Y MAPEOS
  // ══════════════════════════════════════════════════════════════════
  function _buildFileMapping() {
    CBZ_CONFIG.scenes.forEach(function(scene) {
      if (scene.file) {
        CBZ_EDITOR.fileToSceneId[scene.file] = scene.id;
      }
    });
  }

  function _fetchAvailableRenders(callback) {
    var property = encodeURIComponent(window.CBZ_PROPERTY || 'ESPLENDOR');
    fetch('../api/renders?property=' + property)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          CBZ_EDITOR.availableFiles = data.renders;
        } else {
          console.error('[CBZ·Editor] Error fetching renders:', data.error);
        }
        callback();
      })
      .catch(err => {
        console.error('[CBZ·Editor] Fetch error:', err);
        callback();
      });
  }

  function _registerHotspots() {
    CBZ_CONFIG.scenes.forEach(function (sceneData) {
      var entry = CBZ_SCENES[sceneData.id];
      if (!entry || !entry.marzipanoScene) return;

      var hsList = sceneData.hotspots || [];
      var container = entry.marzipanoScene.hotspotContainer();
      var mzHotspots = container.listHotspots();

      CBZ_EDITOR.registry[sceneData.id] = [];

      hsList.forEach(function (hsData, index) {
        var mzHotspot = mzHotspots[index];
        if (!mzHotspot) return;

        var reg = {
          hsData: hsData,
          mzHotspot: mzHotspot,
          el: mzHotspot.domElement()
        };

        CBZ_EDITOR.registry[sceneData.id].push(reg);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════
  function _screenToCoords(screenX, screenY) {
    var entry = CBZ_SCENES[CBZ_EDITOR.activeSceneId];
    if (!entry || !entry.marzipanoScene) return null;

    var view   = entry.marzipanoScene.view();
    var stage  = CBZ_viewer.stage();
    var width  = stage.width();
    var height = stage.height();

    var ndcX = (screenX / width)  - 0.5;
    var ndcY = (screenY / height) - 0.5;

    var coords = {};
    try {
      view.screenToCoordinates({ x: screenX, y: screenY }, coords);
      return { yaw: coords.yaw, pitch: coords.pitch };
    } catch (e) {
      var fov   = view.fov();
      var yaw   = view.yaw()   + ndcX * fov;
      var pitch = view.pitch() - ndcY * fov * (height / width);
      return { yaw: yaw, pitch: pitch };
    }
  }

  function _moveHotspot(reg, yaw, pitch) {
    if (!reg.mzHotspot) return;
    reg.mzHotspot.setPosition({ yaw: yaw, pitch: pitch });
    reg.hsData.yaw = yaw;
    reg.hsData.pitch = pitch;
    _updatePanel();
  }

  function _selectHotspot(reg) {
    if (CBZ_EDITOR.selectedHotspot && CBZ_EDITOR.selectedHotspot.el) {
      CBZ_EDITOR.selectedHotspot.el.classList.remove('cbz-editor-selected');
    }
    CBZ_EDITOR.selectedHotspot = reg;
    if (reg && reg.el) {
      reg.el.classList.add('cbz-editor-selected');
    }
    _updatePanel();
    _updateHotspotList();
  }

  // ══════════════════════════════════════════════════════════════════
  // DRAG
  // ══════════════════════════════════════════════════════════════════
  function _attachDragToScene(sceneId) {
    var regs = CBZ_EDITOR.registry[sceneId] || [];
    regs.forEach(_attachDragToHotspot);
  }

  function _attachDragToHotspot(reg) {
    if (!reg.el) return;
    // Evitar múltiples listeners
    if (reg.el._dragAttached) return;
    reg.el._dragAttached = true;

    reg.el.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      e.preventDefault();

      _selectHotspot(reg);
      CBZ_EDITOR.dragging = true;
      reg.el.setPointerCapture(e.pointerId);

      reg.el.addEventListener('pointermove', onMove);
      reg.el.addEventListener('pointerup',   onUp);
      reg.el.addEventListener('pointercancel', onUp);

      function onMove(ev) {
        if (!CBZ_EDITOR.dragging) return;
        ev.preventDefault();
        var coords = _screenToCoords(ev.clientX, ev.clientY);
        if (coords) {
          _moveHotspot(reg, coords.yaw, coords.pitch);
        }
      }

      function onUp(ev) {
        CBZ_EDITOR.dragging = false;
        reg.el.releasePointerCapture(ev.pointerId);
        reg.el.removeEventListener('pointermove', onMove);
        reg.el.removeEventListener('pointerup',   onUp);
        reg.el.removeEventListener('pointercancel', onUp);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ACCIONES DEL EDITOR (AGREGAR / ELIMINAR)
  // ══════════════════════════════════════════════════════════════════
  function _addHotspot() {
    var sceneId = CBZ_EDITOR.activeSceneId;
    if (!sceneId) return;

    var entry = CBZ_SCENES[sceneId];
    if (!entry || !entry.marzipanoScene) return;

    // Generar ID único
    var hsCount = (CBZ_EDITOR.registry[sceneId] || []).length + 1;
    var newId = 'HS_NEW_' + Date.now();

    var hsData = {
      id: newId,
      target: '',
      label: 'Nuevo Hotspot',
      yaw: entry.marzipanoScene.view().yaw(),
      pitch: entry.marzipanoScene.view().pitch()
    };

    var el = CBZ_createHotspotElement(hsData);
    var mzHotspot = entry.marzipanoScene.hotspotContainer().createHotspot(el, { yaw: hsData.yaw, pitch: hsData.pitch });

    var reg = { hsData: hsData, mzHotspot: mzHotspot, el: el };
    
    if (!CBZ_EDITOR.registry[sceneId]) CBZ_EDITOR.registry[sceneId] = [];
    CBZ_EDITOR.registry[sceneId].push(reg);

    _attachDragToHotspot(reg);
    _selectHotspot(reg);
  }

  function _deleteHotspot() {
    var reg = CBZ_EDITOR.selectedHotspot;
    if (!reg) return;

    if (!confirm('¿Eliminar este hotspot?')) return;

    var sceneId = CBZ_EDITOR.activeSceneId;
    var entry = CBZ_SCENES[sceneId];
    if (entry && entry.marzipanoScene && reg.mzHotspot) {
      entry.marzipanoScene.hotspotContainer().destroyHotspot(reg.mzHotspot);
    }

    var idx = CBZ_EDITOR.registry[sceneId].indexOf(reg);
    if (idx !== -1) {
      CBZ_EDITOR.registry[sceneId].splice(idx, 1);
    }

    CBZ_EDITOR.selectedHotspot = null;
    _updateHotspotList();
    _updatePanel();
  }

  // ══════════════════════════════════════════════════════════════════
  // PANEL UI DEL EDITOR
  // ══════════════════════════════════════════════════════════════════
  var _panel, _elScene, _elList, _elName, _elTarget, _elYaw, _elPitch, _btnDelete;

  function _buildPanel() {
    _panel = document.createElement('div');
    _panel.id = 'cbz-editor-panel';
    
    // Opciones del select target basadas en los renders disponibles
    var targetOptions = '<option value="">-- Seleccionar --</option>';
    CBZ_EDITOR.availableFiles.forEach(function(file) {
      var targetSceneId = CBZ_EDITOR.fileToSceneId[file] || '';
      var targetValue = targetSceneId || file;
      targetOptions += '<option value="' + targetValue + '">' + file + '</option>';
    });

    var sceneOptions = '';
    CBZ_CONFIG.scenes.forEach(function (scene) {
      var entry = CBZ_SCENES[scene.id];
      if (!entry || !entry.marzipanoScene) return;
      sceneOptions += '<option value="' + scene.id + '">' +
        scene.title + ' — ' + scene.file + '</option>';
    });

    _panel.innerHTML = [
      '<div class="cbz-ed-header">',
      '  <span class="cbz-ed-badge">MODO EDITOR</span>',
      '</div>',
      '<div class="cbz-ed-section">',
      '  <div class="cbz-ed-label">PANORAMA 360 ACTIVO</div>',
      '  <select id="cbz-ed-scene-select" class="cbz-ed-input">',
             sceneOptions,
      '  </select>',
      '</div>',
      '<div class="cbz-ed-section">',
      '  <div class="cbz-ed-label">HOTSPOTS — ESCENA ACTIVA</div>',
      '  <ul id="cbz-ed-list"></ul>',
      '  <button id="cbz-ed-add" style="margin-top:10px;">+ AGREGAR HOTSPOT</button>',
      '</div>',
      '<div class="cbz-ed-section" id="cbz-ed-info">',
      '  <div class="cbz-ed-label">HOTSPOT SELECCIONADO</div>',
      '  <div class="cbz-ed-field">',
      '    <span class="cbz-ed-coord-label">NOMBRE</span>',
      '    <input type="text" id="cbz-ed-name-input" class="cbz-ed-input" disabled />',
      '  </div>',
      '  <div class="cbz-ed-field">',
      '    <span class="cbz-ed-coord-label">DESTINO (ARCHIVO 360)</span>',
      '    <select id="cbz-ed-target-select" class="cbz-ed-input" disabled>',
             targetOptions,
      '    </select>',
      '  </div>',
      '  <div class="cbz-ed-coords">',
      '    <span class="cbz-ed-coord-label">YAW</span>',
      '    <span id="cbz-ed-yaw">—</span>',
      '  </div>',
      '  <div class="cbz-ed-coords">',
      '    <span class="cbz-ed-coord-label">PITCH</span>',
      '    <span id="cbz-ed-pitch">—</span>',
      '  </div>',
      '  <button id="cbz-ed-delete" style="margin-top:10px; border-color:#e06060; color:#e06060;" disabled>ELIMINAR HOTSPOT</button>',
      '</div>',
      '<div class="cbz-ed-section">',
      '  <button id="cbz-ed-save" class="cbz-ed-btn-primary">GUARDAR EN CONFIG.JS</button>',
      '  <div id="cbz-ed-save-status"></div>',
      '</div>',
    ].join('');

    document.body.appendChild(_panel);

    _elScene    = document.getElementById('cbz-ed-scene-select');
    _elList     = document.getElementById('cbz-ed-list');
    _elName     = document.getElementById('cbz-ed-name-input');
    _elTarget   = document.getElementById('cbz-ed-target-select');
    _elYaw      = document.getElementById('cbz-ed-yaw');
    _elPitch    = document.getElementById('cbz-ed-pitch');
    _btnDelete  = document.getElementById('cbz-ed-delete');

    document.getElementById('cbz-ed-add').addEventListener('click', _addHotspot);
    _btnDelete.addEventListener('click', _deleteHotspot);
    document.getElementById('cbz-ed-save').addEventListener('click', _saveToConfig);
    _elScene.addEventListener('change', function (event) {
      CBZ_switchScene(event.target.value);
    });

    // Actualizar nombre en tiempo real
    _elName.addEventListener('input', function(e) {
      if (CBZ_EDITOR.selectedHotspot) {
        CBZ_EDITOR.selectedHotspot.hsData.label = e.target.value;
        // Actualizar visualmente en el DOM
        var labelEl = CBZ_EDITOR.selectedHotspot.el.querySelector('.cbz-hotspot__label');
        if (labelEl) labelEl.textContent = e.target.value;
        _updateHotspotList();
      }
    });

    // Actualizar target
    _elTarget.addEventListener('change', function(e) {
      if (CBZ_EDITOR.selectedHotspot) {
        CBZ_EDITOR.selectedHotspot.hsData.target = e.target.value;
      }
    });
  }

  function _updateHotspotList() {
    if (!_elList) return;
    var regs = CBZ_EDITOR.registry[CBZ_EDITOR.activeSceneId] || [];
    _elList.innerHTML = '';

    regs.forEach(function (reg) {
      var li = document.createElement('li');
      // Mostrar archivo en lugar de scene ID si es posible
      var targetFile = 'No asignado';
      CBZ_CONFIG.scenes.forEach(function(s) {
        if (s.id === reg.hsData.target && s.file) targetFile = s.file;
      });

      li.textContent = reg.hsData.label + ' → ' + targetFile;
      li.dataset.hsId = reg.hsData.id;

      if (CBZ_EDITOR.selectedHotspot &&
          CBZ_EDITOR.selectedHotspot.hsData.id === reg.hsData.id) {
        li.classList.add('cbz-ed-active');
      }

      li.addEventListener('click', function () {
        _selectHotspot(reg);
      });

      _elList.appendChild(li);
    });
  }

  function _updatePanel() {
    var sel = CBZ_EDITOR.selectedHotspot;

    if (_elScene) _elScene.value = CBZ_EDITOR.activeSceneId || '';

    if (sel) {
      _elName.disabled = false;
      _elTarget.disabled = false;
      _btnDelete.disabled = false;

      _elName.value = sel.hsData.label;
      _elTarget.value = sel.hsData.target;
      _elYaw.textContent = sel.hsData.yaw.toFixed(4);
      _elPitch.textContent = sel.hsData.pitch.toFixed(4);
    } else {
      _elName.disabled = true;
      _elTarget.disabled = true;
      _btnDelete.disabled = true;

      _elName.value = '';
      _elTarget.value = '';
      _elYaw.textContent = '—';
      _elPitch.textContent = '—';
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // EXPORTAR Y GUARDAR
  // ══════════════════════════════════════════════════════════════════
  function _buildExportData() {
    var out = {};
    CBZ_CONFIG.scenes.forEach(function (scene) {
      var regs = CBZ_EDITOR.registry[scene.id] || [];
      out[scene.id] = regs.map(function(reg) {
        return {
          id: reg.hsData.id,
          target: reg.hsData.target,
          label: reg.hsData.label,
          yaw: reg.hsData.yaw,
          pitch: reg.hsData.pitch
        };
      });
    });
    return out;
  }

  function _saveToConfig() {
    var btn    = document.getElementById('cbz-ed-save');
    var status = document.getElementById('cbz-ed-save-status');
    var data   = _buildExportData();

    btn.disabled = true;
    btn.textContent = 'GUARDANDO...';
    status.textContent = '';
    status.className = '';

    var property = encodeURIComponent(window.CBZ_PROPERTY || 'ESPLENDOR');
    fetch('../api/save-hotspots?property=' + property, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'GUARDAR EN CONFIG.JS';

      if (res.ok) {
        status.textContent = '✓ CONFIG.JS ACTUALIZADO\nEscenas modificadas: ' + res.updated;
        status.className = 'cbz-ed-status-ok';
      } else {
        status.textContent = '✗ ERROR\n' + (res.error || 'Respuesta inesperada.');
        status.className = 'cbz-ed-status-error';
      }
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.textContent = 'GUARDAR EN CONFIG.JS';
      status.className = 'cbz-ed-status-error';
      status.textContent = '✗ Error: ' + err.message;
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ESTILOS
  // ══════════════════════════════════════════════════════════════════
  function _injectStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '#cbz-editor-panel { position: fixed; top: 0; right: 0; width: 280px; height: 100%; background: rgba(10,10,10,0.95); color: #fff; font-family: "Helvetica Neue", sans-serif; font-size: 11px; letter-spacing: 0.08em; z-index: 100; display: flex; flex-direction: column; overflow-y: auto; border-left: 1px solid rgba(255,255,255,0.1); }',
      '.cbz-ed-header { padding: 16px 14px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }',
      '.cbz-ed-badge { font-size: 9px; letter-spacing: 0.2em; color: #c5a059; font-weight: 600; }',
      '.cbz-ed-section { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.07); }',
      '.cbz-ed-label { font-size: 8px; letter-spacing: 0.18em; color: rgba(255,255,255,0.35); margin-bottom: 8px; }',
      '#cbz-ed-list { list-style: none; margin: 0; padding: 0; max-height: 150px; overflow-y: auto; }',
      '#cbz-ed-list li { padding: 6px 8px; cursor: pointer; border-radius: 3px; color: rgba(255,255,255,0.7); transition: background 0.15s; margin-bottom: 2px; }',
      '#cbz-ed-list li:hover { background: rgba(255,255,255,0.08); }',
      '#cbz-ed-list li.cbz-ed-active { background: rgba(197,160,89,0.2); color: #c5a059; }',
      '.cbz-ed-field { margin-bottom: 10px; }',
      '.cbz-ed-input { width: 100%; padding: 6px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 11px; border-radius: 3px; margin-top: 4px; }',
      '.cbz-ed-input:disabled { opacity: 0.4; }',
      '.cbz-ed-input option { background: #111; color: #fff; }',
      '.cbz-ed-coords { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }',
      '.cbz-ed-coord-label { font-size: 8px; color: rgba(255,255,255,0.35); letter-spacing: 0.15em; }',
      '#cbz-ed-yaw, #cbz-ed-pitch { font-size: 12px; font-family: monospace; color: #c5a059; }',
      '#cbz-editor-panel button { display: block; width: 100%; padding: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7); font-size: 9px; letter-spacing: 0.15em; cursor: pointer; border-radius: 3px; transition: background 0.2s, color 0.2s; }',
      '#cbz-editor-panel button:hover { background: rgba(197,160,89,0.2); color: #c5a059; border-color: #c5a059; }',
      '#cbz-editor-panel button:disabled { opacity: 0.4; cursor: not-allowed; }',
      '.cbz-hotspot.cbz-editor-selected .cbz-hotspot__icon { border-color: #c5a059 !important; box-shadow: 0 0 0 2px rgba(197,160,89,0.4); }',
      '.cbz-hotspot.cbz-editor-selected .cbz-hotspot__icon::after { background-color: #c5a059 !important; }',
      '.cbz-hotspot { cursor: grab !important; }',
      '.cbz-hotspot:active { cursor: grabbing !important; }',
      '.cbz-ed-btn-primary { background: rgba(197,160,89,0.15) !important; border-color: rgba(197,160,89,0.5) !important; color: #c5a059 !important; font-weight: 600; }',
      '.cbz-ed-btn-primary:hover { background: rgba(197,160,89,0.3) !important; border-color: #c5a059 !important; }',
      '#cbz-ed-save-status { font-size: 9px; line-height: 1.5; white-space: pre-line; padding: 6px 0 0; min-height: 0; }',
      '.cbz-ed-status-ok { color: #6bc46b; }',
      '.cbz-ed-status-error { color: #e06060; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════════════════════════════
  // REACCIONAR AL CAMBIO DE ESCENA Y ARRANQUE
  // ══════════════════════════════════════════════════════════════════
  document.addEventListener('cbz:sceneChanged', function (e) {
    CBZ_EDITOR.activeSceneId = e.detail.sceneId;
    CBZ_EDITOR.selectedHotspot = null;
    _attachDragToScene(e.detail.sceneId);
    _updateHotspotList();
    _updatePanel();
  });

  function _initializeEditor() {
    if (CBZ_EDITOR.initialized) return;
    CBZ_EDITOR.initialized = true;

    // Primero, construir mapeo
    _buildFileMapping();
    
    // Luego, obtener archivos disponibles del servidor
    _fetchAvailableRenders(function() {
      // Finalmente, registrar hotspots y armar UI
      _registerHotspots();
      _attachDragToScene(CBZ_EDITOR.activeSceneId);
      _injectStyles();
      _buildPanel();
      _updateHotspotList();
    });
  }

  document.addEventListener('cbz:sceneChanged', _initializeEditor, { once: true });

  // app.js inicializa la escena antes de cargar este script. Si eso ocurre,
  // recuperar la escena activa y montar el editor inmediatamente.
  var firstAvailableSceneId = null;
  (CBZ_CONFIG.scenes || []).some(function (sceneData) {
    if (CBZ_SCENES[sceneData.id] && CBZ_SCENES[sceneData.id].marzipanoScene) {
      firstAvailableSceneId = sceneData.id;
      return true;
    }
    return false;
  });

  if (!CBZ_EDITOR.activeSceneId && firstAvailableSceneId) {
    CBZ_EDITOR.activeSceneId = firstAvailableSceneId;
    _initializeEditor();
  }

})();


