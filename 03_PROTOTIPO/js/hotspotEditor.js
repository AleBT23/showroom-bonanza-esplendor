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
    dirtyScenes:      {}, // Solo escenas con cambios explícitos del usuario
    dirtyVersions:    {}, // Evita limpiar cambios hechos mientras se guarda
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

      hsList.forEach(function (hsData) {
        // Marzipano no garantiza que listHotspots conserve el orden del
        // config.js. Asociar por el ID DOM evita editar/omitir otro registro.
        var mzHotspot = mzHotspots.find(function (candidate) {
          var element = candidate.domElement();
          return element && element.dataset.id === String(hsData.id);
        }) || null;

        var reg = {
          hsData: hsData,
          mzHotspot: mzHotspot,
          el: mzHotspot ? mzHotspot.domElement() : null
        };

        CBZ_EDITOR.registry[sceneData.id].push(reg);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════
  function _markSceneDirty(sceneId) {
    if (!sceneId) return;
    CBZ_EDITOR.dirtyScenes[sceneId] = true;
    CBZ_EDITOR.dirtyVersions[sceneId] = (CBZ_EDITOR.dirtyVersions[sceneId] || 0) + 1;
  }

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
    _markSceneDirty(CBZ_EDITOR.activeSceneId);
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
    _markSceneDirty(sceneId);

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
      _markSceneDirty(sceneId);
    }

    CBZ_EDITOR.selectedHotspot = null;
    _updateHotspotList();
    _updatePanel();
  }

  // ══════════════════════════════════════════════════════════════════
  // PANEL UI DEL EDITOR
  // ══════════════════════════════════════════════════════════════════
  var _panel, _elScene, _elList, _elName, _elTarget, _elYaw, _elPitch, _btnDelete;
  var _menuVisible, _menuTitle, _menuLevel, _menuLevelTitle, _menuOrder, _menuId, _menuFile;
  var _menuPreview, _menuSaveStatus;

  function _defaultLevelTitle(level) {
    var titles = { PB: 'Planta baja', PA: 'Planta alta', N2: 'Nivel 2', N3: 'Nivel 3' };
    return titles[level] || level || 'Sin nivel';
  }

  function _initializeSceneMenus() {
    CBZ_CONFIG.scenes.forEach(function (scene, index) {
      if (!scene.menu || typeof scene.menu !== 'object') scene.menu = {};
      if (scene.menu.visible === undefined) scene.menu.visible = true;
      if (!scene.menu.title) scene.menu.title = scene.title || scene.id;
      if (!scene.menu.level) scene.menu.level = scene.level || 'PB';
      if (!scene.menu.levelTitle) scene.menu.levelTitle = _defaultLevelTitle(scene.menu.level);
      if (!Number.isFinite(Number(scene.menu.order)) || Number(scene.menu.order) < 1) scene.menu.order = index + 1;
      scene.menu.order = Number(scene.menu.order);
    });
  }

  function _activeSceneData() {
    var id = CBZ_EDITOR.activeSceneId;
    for (var i = 0; i < CBZ_CONFIG.scenes.length; i++) {
      if (CBZ_CONFIG.scenes[i].id === id) return CBZ_CONFIG.scenes[i];
    }
    return null;
  }

  function _updateMenuPreview() {
    if (!_menuPreview) return;
    _menuPreview.innerHTML = '';
    var groups = [];
    var byLevel = {};
    CBZ_CONFIG.scenes.forEach(function (scene, index) {
      var menu = scene.menu || {};
      if (menu.visible === false) return;
      var level = menu.level || scene.level || 'OTRO';
      var group = byLevel[level];
      if (!group) {
        group = byLevel[level] = { level: level, title: menu.levelTitle || _defaultLevelTitle(level), firstIndex: index, items: [] };
        groups.push(group);
      } else if (menu.levelTitle && menu.levelTitle !== _defaultLevelTitle(level)) {
        group.title = menu.levelTitle;
      }
      group.items.push({ title: menu.title || scene.title || scene.id, order: Number(menu.order) || index + 1, index: index });
    });
    groups.sort(function (a, b) { return a.firstIndex - b.firstIndex; });
    groups.forEach(function (group) {
      group.items.sort(function (a, b) { return a.order - b.order || a.index - b.index; });
      var section = document.createElement('div');
      section.className = 'cbz-ed-preview-group';
      var heading = document.createElement('div');
      heading.className = 'cbz-ed-preview-heading';
      heading.textContent = group.title;
      section.appendChild(heading);
      group.items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'cbz-ed-preview-item';
        row.textContent = item.title;
        section.appendChild(row);
      });
      _menuPreview.appendChild(section);
    });
    if (!groups.length) _menuPreview.textContent = 'No hay espacios visibles en el menú.';
  }

  function _updateMenuEditor() {
    var scene = _activeSceneData();
    if (!scene || !_menuVisible) return;
    var menu = scene.menu;
    _menuVisible.checked = menu.visible !== false;
    _menuTitle.value = menu.title || '';
    _menuLevel.value = menu.level || '';
    _menuLevelTitle.value = menu.levelTitle || '';
    _menuOrder.value = menu.order;
    _menuId.textContent = scene.id;
    _menuFile.textContent = scene.file || scene.basename || '(sin archivo configurado)';
    _menuTitle.disabled = !_menuVisible.checked;
    _menuLevel.disabled = !_menuVisible.checked;
    _menuLevelTitle.disabled = !_menuVisible.checked;
    _menuOrder.disabled = !_menuVisible.checked;
    _updateMenuPreview();
  }

  function _saveSceneMenus() {
    var button = document.getElementById('cbz-ed-menu-save');
    var status = _menuSaveStatus;
    var data = {};
    CBZ_CONFIG.scenes.forEach(function (scene) {
      var menu = scene.menu || {};
      data[scene.id] = {
        visible: menu.visible !== false,
        title: menu.title || scene.title || scene.id,
        level: menu.level || scene.level || 'PB',
        levelTitle: menu.levelTitle || _defaultLevelTitle(menu.level || scene.level),
        order: Math.max(1, Math.floor(Number(menu.order) || 1))
      };
    });

    button.disabled = true;
    button.textContent = 'GUARDANDO...';
    status.textContent = '';
    var property = encodeURIComponent(window.CBZ_PROPERTY || 'ESPLENDOR');
    fetch('../api/save-scene-menu?property=' + property, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (response) { return response.json(); })
    .then(function (result) {
      button.disabled = false;
      button.textContent = 'GUARDAR LISTA DE ESPACIOS';
      if (result.ok) {
        status.textContent = '✓ LISTA GUARDADA EN ' + (window.CBZ_PROPERTY || 'ESPLENDOR');
        status.className = 'cbz-ed-status-ok';
      } else {
        status.textContent = '✗ ' + (result.error || 'No se pudo guardar la lista.');
        status.className = 'cbz-ed-status-error';
      }
    })
    .catch(function (error) {
      button.disabled = false;
      button.textContent = 'GUARDAR LISTA DE ESPACIOS';
      status.textContent = '✗ Error: ' + error.message;
      status.className = 'cbz-ed-status-error';
    });
  }

  function _buildPanel() {
    _panel = document.createElement('div');
    _panel.id = 'cbz-editor-panel';
    
    // Opciones del select target basadas en los renders disponibles
    var targetOptions = '<option value="">-- Seleccionar --</option>';
    CBZ_EDITOR.availableFiles.forEach(function(file) {
      var targetSceneId = CBZ_EDITOR.fileToSceneId[file] || '';
      var targetValue = targetSceneId || file.replace(/\.png$/i, '');
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
      '<div class="cbz-ed-section cbz-ed-menu-editor">',
      '  <div class="cbz-ed-label">LISTA DE ESPACIOS — ESCENA SELECCIONADA</div>',
      '  <div class="cbz-ed-reference"><span>ID</span><code id="cbz-ed-menu-id"></code></div>',
      '  <div class="cbz-ed-reference"><span>ARCHIVO 360</span><code id="cbz-ed-menu-file"></code></div>',
      '  <label class="cbz-ed-check"><input id="cbz-ed-menu-visible" type="checkbox"> MOSTRAR EN MENÚ</label>',
      '  <label class="cbz-ed-menu-field">NOMBRE VISIBLE<input id="cbz-ed-menu-title" class="cbz-ed-input" type="text"></label>',
      '  <label class="cbz-ed-menu-field">NIVEL / CÓDIGO<input id="cbz-ed-menu-level" class="cbz-ed-input" type="text" list="cbz-ed-level-options"><datalist id="cbz-ed-level-options"><option value="PB"><option value="PA"><option value="N2"><option value="N3"><option value="TERRAZA"></datalist></label>',
      '  <label class="cbz-ed-menu-field">NOMBRE DEL GRUPO<input id="cbz-ed-menu-level-title" class="cbz-ed-input" type="text"></label>',
      '  <label class="cbz-ed-menu-field">ORDEN<input id="cbz-ed-menu-order" class="cbz-ed-input" type="number" min="1" step="1"></label>',
      '  <div class="cbz-ed-label cbz-ed-preview-label">PREVISUALIZACIÓN DE LA LISTA</div>',
      '  <div id="cbz-ed-menu-preview"></div>',
      '  <button id="cbz-ed-menu-save" class="cbz-ed-btn-primary" type="button">GUARDAR LISTA DE ESPACIOS</button>',
      '  <div id="cbz-ed-menu-save-status"></div>',
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
    _menuVisible = document.getElementById('cbz-ed-menu-visible');
    _menuTitle = document.getElementById('cbz-ed-menu-title');
    _menuLevel = document.getElementById('cbz-ed-menu-level');
    _menuLevelTitle = document.getElementById('cbz-ed-menu-level-title');
    _menuOrder = document.getElementById('cbz-ed-menu-order');
    _menuId = document.getElementById('cbz-ed-menu-id');
    _menuFile = document.getElementById('cbz-ed-menu-file');
    _menuPreview = document.getElementById('cbz-ed-menu-preview');
    _menuSaveStatus = document.getElementById('cbz-ed-menu-save-status');

    document.getElementById('cbz-ed-add').addEventListener('click', _addHotspot);
    _btnDelete.addEventListener('click', _deleteHotspot);
    document.getElementById('cbz-ed-save').addEventListener('click', _saveToConfig);
    document.getElementById('cbz-ed-menu-save').addEventListener('click', _saveSceneMenus);
    _elScene.addEventListener('change', function (event) {
      CBZ_switchScene(event.target.value);
    });

    _menuVisible.addEventListener('change', function (event) {
      var scene = _activeSceneData();
      if (!scene) return;
      scene.menu.visible = event.target.checked;
      _updateMenuEditor();
    });
    _menuTitle.addEventListener('input', function (event) {
      var scene = _activeSceneData();
      if (scene) scene.menu.title = event.target.value;
      _updateMenuPreview();
    });
    _menuLevel.addEventListener('input', function (event) {
      var scene = _activeSceneData();
      if (scene) {
        var previousLevel = scene.menu.level;
        var usesDefaultTitle = !scene.menu.levelTitle || scene.menu.levelTitle === _defaultLevelTitle(previousLevel);
        scene.menu.level = event.target.value.trim() || 'OTRO';
        if (usesDefaultTitle) {
          scene.menu.levelTitle = _defaultLevelTitle(scene.menu.level);
          _menuLevelTitle.value = scene.menu.levelTitle;
        }
      }
      _updateMenuPreview();
    });
    _menuLevelTitle.addEventListener('input', function (event) {
      var scene = _activeSceneData();
      if (scene) scene.menu.levelTitle = event.target.value || scene.menu.level;
      _updateMenuPreview();
    });
    _menuOrder.addEventListener('input', function (event) {
      var scene = _activeSceneData();
      if (scene) scene.menu.order = Math.max(1, Math.floor(Number(event.target.value) || 1));
      _updateMenuPreview();
    });

    // Actualizar nombre en tiempo real
    _elName.addEventListener('input', function(e) {
      if (CBZ_EDITOR.selectedHotspot) {
        CBZ_EDITOR.selectedHotspot.hsData.label = e.target.value;
        // Actualizar visualmente en el DOM
        var labelEl = CBZ_EDITOR.selectedHotspot.el.querySelector('.cbz-hotspot__label');
        if (labelEl) labelEl.textContent = e.target.value;
        _markSceneDirty(CBZ_EDITOR.activeSceneId);
        _updateHotspotList();
      }
    });

    // Actualizar target
    _elTarget.addEventListener('change', function(e) {
      if (CBZ_EDITOR.selectedHotspot) {
        CBZ_EDITOR.selectedHotspot.hsData.target = e.target.value;
        _markSceneDirty(CBZ_EDITOR.activeSceneId);
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
    _updateMenuEditor();

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
    // Los controles editan el registro seleccionado en vivo. Sincronizarlos
    // justo antes de serializar también cubre el guardado inmediato tras editar.
    var selected = CBZ_EDITOR.selectedHotspot;
    if (selected) {
      if (_elName) selected.hsData.label = _elName.value;
      if (_elTarget && (_elTarget.value || !selected.hsData.target)) {
        selected.hsData.target = _elTarget.value;
      }
    }

    var out = {};
    var sceneDefinitions = [];
    Object.keys(CBZ_EDITOR.dirtyScenes).forEach(function (sceneId) {
      var regs = (CBZ_EDITOR.registry[sceneId] || []).slice();
      // El hotspot seleccionado es la fuente visible del editor. No permitir
      // que una referencia de registro desfasada lo excluya del payload.
      if (sceneId === CBZ_EDITOR.activeSceneId && selected && regs.indexOf(selected) === -1) {
        regs.push(selected);
      }
      out[sceneId] = regs.map(function(reg) {
        return {
          id: reg.hsData.id,
          target: reg.hsData.target,
          label: reg.hsData.label,
          yaw: reg.hsData.yaw,
          pitch: reg.hsData.pitch
        };
      });

      var isConfigured = CBZ_CONFIG.scenes.some(function (scene) {
        return scene.id === sceneId;
      });
      var activeEntry = CBZ_SCENES[sceneId];
      if (!isConfigured && activeEntry && activeEntry.data) {
        var sceneData = activeEntry.data;
        sceneDefinitions.push({
          id: sceneData.id,
          title: sceneData.title || sceneData.id,
          description: sceneData.description || '',
          level: sceneData.level || 'PB',
          file: sceneData.file,
          basename: sceneData.basename || String(sceneData.file || '').replace(/\.(png|jpe?g|webp)$/i, ''),
          resolution: sceneData.resolution == null ? null : sceneData.resolution,
          initialViewParameters: sceneData.initialViewParameters || null,
          hotspots: out[sceneId]
        });
      }
    });
    if (sceneDefinitions.length) out.__sceneDefinitions = sceneDefinitions;
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
    if (!Object.keys(data).some(function (key) { return key !== '__sceneDefinitions'; })) {
      btn.disabled = false;
      btn.textContent = 'GUARDAR EN CONFIG.JS';
      status.textContent = 'No hay cambios pendientes.';
      return;
    }
    var savedVersions = {};
    Object.keys(data).forEach(function (sceneId) {
      if (sceneId !== '__sceneDefinitions') savedVersions[sceneId] = CBZ_EDITOR.dirtyVersions[sceneId];
    });
    fetch('../api/save-hotspots?property=' + property, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function (r) {
      return r.json().catch(function () {
        throw new Error('El servidor devolvió una respuesta vacía o no válida (HTTP ' + r.status + ')');
      }).then(function (res) {
        if (!r.ok || !res.ok) throw new Error(res.error || ('El servidor respondió HTTP ' + r.status));
        if (res.persisted !== true) throw new Error('El servidor no confirmó la persistencia de los cambios.');
        return res;
      });
    })
    .then(function (res) {
      btn.disabled = false;
      btn.textContent = 'GUARDAR EN CONFIG.JS';

      status.textContent = res.updated === 0
        ? '✓ CONFIG.JS VERIFICADO\nSin cambios pendientes.'
        : '✓ CONFIG.JS ACTUALIZADO Y VERIFICADO\nEscenas modificadas: ' + res.updated;
      status.className = 'cbz-ed-status-ok';
      Object.keys(savedVersions).forEach(function (sceneId) {
        if (CBZ_EDITOR.dirtyVersions[sceneId] === savedVersions[sceneId]) {
          delete CBZ_EDITOR.dirtyScenes[sceneId];
          delete CBZ_EDITOR.dirtyVersions[sceneId];
        }
      });
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
      '.cbz-ed-reference { display: flex; flex-direction: column; gap: 3px; margin: 0 0 7px; color: rgba(255,255,255,0.4); font-size: 8px; letter-spacing: 0.12em; }',
      '.cbz-ed-reference code { color: rgba(255,255,255,0.78); font-size: 9px; letter-spacing: 0; overflow-wrap: anywhere; }',
      '.cbz-ed-check { display: flex; align-items: center; gap: 7px; margin: 10px 0; color: #c5a059; font-size: 9px; cursor: pointer; }',
      '.cbz-ed-menu-field { display: block; margin: 9px 0; color: rgba(255,255,255,0.5); font-size: 8px; letter-spacing: 0.12em; }',
      '.cbz-ed-menu-field .cbz-ed-input { box-sizing: border-box; }',
      '.cbz-ed-menu-field .cbz-ed-input:disabled { opacity: 0.35; }',
      '.cbz-ed-preview-label { margin-top: 16px; }',
      '#cbz-ed-menu-preview { max-height: 180px; overflow-y: auto; margin-bottom: 10px; padding: 7px 9px; border: 1px solid rgba(255,255,255,0.1); border-radius: 3px; }',
      '.cbz-ed-preview-group { margin-bottom: 9px; }',
      '.cbz-ed-preview-heading { padding-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.14); color: #c5a059; font-size: 8px; letter-spacing: 0.14em; }',
      '.cbz-ed-preview-item { padding: 5px 0 0 4px; color: rgba(255,255,255,0.75); font-size: 10px; letter-spacing: 0.04em; }',
      '#cbz-ed-menu-save-status { min-height: 12px; font-size: 9px; line-height: 1.5; }',
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
    _initializeSceneMenus();
    
    // Luego, obtener archivos disponibles del servidor
    _fetchAvailableRenders(function() {
      // Finalmente, registrar hotspots y armar UI
      _registerHotspots();
      _attachDragToScene(CBZ_EDITOR.activeSceneId);
      _injectStyles();
      _buildPanel();
      _updateHotspotList();
      _updatePanel();
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


