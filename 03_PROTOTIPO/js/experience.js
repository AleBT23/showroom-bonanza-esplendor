/**
 * experience.js — Navegación editorial de CASA ESPLENDOR
 * Mantiene el visor 360 independiente y añade la capa de Hero, Galería,
 * renders, plantas y contacto.
 */

(function () {
  'use strict';

  var isEditor = new URLSearchParams(window.location.search).get('edit') === '1';
  if (isEditor) return;

  var experience = document.getElementById('cbz-experience');
  var hero = document.getElementById('cbz-hero');
  var screens = Array.prototype.slice.call(document.querySelectorAll('[data-screen]'));
  var rendersGrid = document.getElementById('cbz-renders-grid');
  var plansTabs = document.getElementById('cbz-plans-tabs');
  var planViewer = document.getElementById('cbz-plan-viewer');
  var lightbox = document.getElementById('cbz-lightbox');
  var lightboxImage = document.getElementById('cbz-lightbox-image');
  var lightboxCaption = document.getElementById('cbz-lightbox-caption');
  var tourMenu = document.getElementById('cbz-tour-menu');
  var tourMenuToggle = document.getElementById('cbz-hud-menu');
  var tourMenuContact = document.getElementById('cbz-hud-contact');
  var tourMenuPb = document.getElementById('cbz-tour-menu-pb');
  var tourMenuPa = document.getElementById('cbz-tour-menu-pa');
  var tourMenuHome = document.getElementById('cbz-tour-home');
  var assetsLoaded = false;
  var assets = { renders: [], plans: [] };

  if (!experience) return;

  function titleFromFile(file) {
    return file.replace(/\.[^/.]+$/, '');
  }

  function setScreen(name) {
    closeTourMenu();
    screens.forEach(function (screen) {
      var active = screen.getAttribute('data-screen') === name;
      screen.classList.toggle('is-active', active);
      screen.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    experience.classList.add('is-open');
    experience.setAttribute('aria-hidden', 'false');

    if (name === 'renders' || name === 'plans') loadAssets();
  }

  function openFromHero(name) {
    if (hero) {
      hero.style.display = 'none';
      hero.setAttribute('aria-hidden', 'true');
    }
    setScreen(name);
  }

  function closeExperience() {
    closeTourMenu();
    experience.classList.remove('is-open');
    experience.setAttribute('aria-hidden', 'true');
    screens.forEach(function (screen) {
      screen.classList.remove('is-active');
      screen.setAttribute('aria-hidden', 'true');
    });
  }

  function closeTourMenu() {
    if (!tourMenu) return;
    tourMenu.classList.remove('is-open');
    tourMenu.setAttribute('aria-hidden', 'true');
    if (tourMenuToggle) tourMenuToggle.setAttribute('aria-expanded', 'false');
    if (tourMenuToggle) tourMenuToggle.setAttribute('aria-label', 'Abrir menú');
  }

  function toggleTourMenu() {
    if (!tourMenu) return;
    var open = !tourMenu.classList.contains('is-open');
    tourMenu.classList.toggle('is-open', open);
    tourMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (tourMenuToggle) {
      tourMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      tourMenuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
  }

  function addMenuItem(container, item) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cbz-tour-menu__link';
    button.textContent = item.label;
    button.dataset.tourScene = item.sceneId;
    container.appendChild(button);
  }

  function buildTourMenu() {
    if (!tourMenuPb || !tourMenuPa || typeof CBZ_CONFIG === 'undefined') return;

    var groups = { PB: [], PA: [] };
    var seenTargets = {};

    (CBZ_CONFIG.scenes || []).forEach(function (sceneData) {
      var sceneEntry = CBZ_SCENES[sceneData.id];
      if (!sceneEntry || !sceneEntry.marzipanoScene) return;

      (sceneData.hotspots || []).forEach(function (hotspot) {
        var targetEntry = CBZ_SCENES[hotspot.target];
        if (!targetEntry || !targetEntry.marzipanoScene || !hotspot.label || seenTargets[hotspot.target]) return;

        seenTargets[hotspot.target] = true;
        var group = targetEntry.data.level === 'PB' ? groups.PB : groups.PA;
        group.push({ sceneId: hotspot.target, label: hotspot.label });
      });
    });

    function renderGroup(container, items) {
      container.innerHTML = '';
      if (!items.length) {
        var empty = document.createElement('p');
        empty.className = 'cbz-tour-menu__empty';
        empty.textContent = 'Sin espacios configurados';
        container.appendChild(empty);
        return;
      }
      items.forEach(function (item) { addMenuItem(container, item); });
    }

    renderGroup(tourMenuPb, groups.PB);
    renderGroup(tourMenuPa, groups.PA);
  }

  function showEmpty(container, message) {
    container.innerHTML = '<p class="cbz-empty-state">' + message + '</p>';
  }

  function renderCards() {
    if (!rendersGrid) return;
    rendersGrid.innerHTML = '';
    if (!assets.renders.length) {
      showEmpty(rendersGrid, 'Los renders fotográficos aparecerán aquí próximamente.');
      return;
    }

    assets.renders.forEach(function (asset, index) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'cbz-render-card';
      card.innerHTML = '<span class="cbz-render-index">0' + (index + 1) + '</span>' +
        '<img src="' + asset.url + '" alt="" loading="lazy">' +
        '<span class="cbz-render-name">' + titleFromFile(asset.file) + '</span>';
      card.addEventListener('click', function () {
        openLightbox(asset.url, titleFromFile(asset.file));
      });
      rendersGrid.appendChild(card);
    });
  }

  function renderPlans() {
    if (!plansTabs || !planViewer) return;
    plansTabs.innerHTML = '';
    planViewer.innerHTML = '';

    if (!assets.plans.length) {
      showEmpty(planViewer, 'Las plantas arquitectónicas aparecerán aquí próximamente.');
      return;
    }

    assets.plans.forEach(function (asset, index) {
      var label = titleFromFile(asset.file).toUpperCase();
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'cbz-plan-tab';
      tab.setAttribute('role', 'tab');
      tab.textContent = label;
      tab.addEventListener('click', function () {
        selectPlan(index);
      });
      plansTabs.appendChild(tab);
    });
    selectPlan(0);
  }

  function selectPlan(index) {
    var asset = assets.plans[index];
    if (!asset || !planViewer) return;
    Array.prototype.slice.call(plansTabs.children).forEach(function (tab, tabIndex) {
      var active = tabIndex === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    planViewer.innerHTML = '<img src="' + asset.url + '" alt="' + titleFromFile(asset.file) + '">';
  }

  function loadAssets() {
    if (assetsLoaded) return;
    assetsLoaded = true;

    // En GitHub Pages se utiliza el catálogo estático; no requiere Node ni API.
    if (typeof CBZ_ASSETS !== 'undefined') {
      assets.renders = Array.isArray(CBZ_ASSETS.renders) ? CBZ_ASSETS.renders : [];
      assets.plans = Array.isArray(CBZ_ASSETS.plans) ? CBZ_ASSETS.plans : [];
      renderCards();
      renderPlans();
      return;
    }

    // Fallback para instalaciones locales antiguas sin data/assets.js.
    var property = encodeURIComponent(window.CBZ_PROPERTY || 'ESPLENDOR');
    fetch('../api/showroom-assets?property=' + property)
      .then(function (response) {
        if (!response.ok) throw new Error('No se pudo consultar el catálogo');
        return response.json();
      })
      .then(function (data) {
        assets.renders = Array.isArray(data.renders) ? data.renders : [];
        assets.plans = Array.isArray(data.plans) ? data.plans : [];
        renderCards();
        renderPlans();
      })
      .catch(function () {
        assetsLoaded = false;
        if (rendersGrid) showEmpty(rendersGrid, 'El catálogo de renders estará disponible al iniciar el servidor local.');
        if (planViewer) showEmpty(planViewer, 'El catálogo de plantas estará disponible al iniciar el servidor local.');
      });
  }

  function openLightbox(url, caption) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = url;
    lightboxImage.alt = caption;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImage) lightboxImage.src = '';
  }

  document.getElementById('cbz-hero-gallery-btn').addEventListener('click', function () {
    openFromHero('gallery');
  });
  document.getElementById('cbz-hero-contact-btn').addEventListener('click', function () {
    openFromHero('contact');
  });

  if (tourMenuToggle) tourMenuToggle.addEventListener('click', toggleTourMenu);
  if (tourMenuContact) tourMenuContact.addEventListener('click', function () {
    setScreen('contact');
  });
  if (tourMenuHome) tourMenuHome.addEventListener('click', function () {
    closeExperience();
    if (typeof window.CBZ_returnToHome === 'function') window.CBZ_returnToHome();
  });
  if (tourMenuPb) tourMenuPb.addEventListener('click', selectTourScene);
  if (tourMenuPa) tourMenuPa.addEventListener('click', selectTourScene);

  function selectTourScene(event) {
    var item = event.target.closest('[data-tour-scene]');
    if (!item) return;
    closeTourMenu();
    CBZ_switchScene(item.dataset.tourScene);
  }

  document.addEventListener('click', function (event) {
    if (tourMenu && tourMenu.classList.contains('is-open') &&
        !tourMenu.contains(event.target) && event.target !== tourMenuToggle) {
      closeTourMenu();
    }
  });

  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-screen-target]');
    if (target) setScreen(target.getAttribute('data-screen-target'));
    if (event.target.closest('[data-action="close-experience"]')) closeExperience();
    if (event.target.closest('[data-action="start-tour"]')) {
      if (typeof CBZ_switchScene === 'function') {
        CBZ_switchScene('CBZ_360_01_ACCESO');
      }
      closeExperience();
    }
  });

  if (document.getElementById('cbz-lightbox-close')) {
    document.getElementById('cbz-lightbox-close').addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('is-open')) closeLightbox();
      else if (tourMenu && tourMenu.classList.contains('is-open')) closeTourMenu();
      else closeExperience();
    }
  });

  buildTourMenu();
})();
