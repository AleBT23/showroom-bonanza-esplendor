/**
 * hero.js — Controlador de la pantalla HERO de CASA ESPLENDOR
 */

(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var hero = document.getElementById('cbz-hero');
  
  if (!hero) return;

  // Si el modo editor está activo, ocultar la HERO inmediatamente para no estorbar
  // y entrar directo al entorno 360 de trabajo
  if (params.get('edit') === '1') {
    hero.style.display = 'none';
    return;
  }

  // Elementos de la animación
  var title   = document.getElementById('cbz-hero-title');
  var overlay = document.getElementById('cbz-hero-overlay');
  var content = document.getElementById('cbz-hero-content');
  var btn     = document.getElementById('cbz-hero-btn');
  var video   = document.getElementById('cbz-hero-video');

  // Esperar a que exista contenido reproducible antes de llamar a play().
  function playVideoWhenReady() {
    if (!video) return;
    if (video.readyState < 3) {
      video.addEventListener('canplay', playVideoWhenReady, { once: true });
      return;
    }
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function(e) {
        console.warn('[CBZ·Hero] Autoplay fue prevenido. Se requerirá interacción.', e);
      });
    }
  }

  if (video) {
    video.addEventListener('error', function () {
      console.error('[CBZ·Hero] Error de carga del video MP4:', video.currentSrc || video.src);
    });
    playVideoWhenReady();
  }

  function runHeroIntro() {
    // Secuencia de entrada cinematográfica
    setTimeout(function() {

      // 1. Mostrar título en el centro de la pantalla
      if (title) title.classList.add('cbz-title-phase1');

      // 2. Mantenerlo unos instantes, luego elevarlo físicamente y revelar video
      setTimeout(function() {

        // El título no desaparece, cambia de clase para transicionar hacia arriba
        if (title) {
          title.classList.remove('cbz-title-phase1');
          title.classList.add('cbz-title-phase2');
        }

        // Desvanecer la capa negra (revelando el video)
        if (overlay) overlay.classList.add('cbz-hero-overlay-hide');

        // 3. Mostrar el botón CTA solo cuando el título ya va en camino hacia arriba
        setTimeout(function() {
          if (content) content.classList.add('cbz-hero-content-show');
        }, 1000); // 1s después de empezar a subir el título

      }, 2200); // Se queda 2.2s contemplativo en el centro

    }, 400); // Retraso sutil inicial
  }

  runHeroIntro();

  // Permite volver al Hero inicial desde el menú del recorrido.
  window.CBZ_returnToHome = function () {
    hero.style.display = 'block';
    hero.style.opacity = '1';
    hero.style.transition = '';
    hero.setAttribute('aria-hidden', 'false');

    if (title) {
      title.className = '';
      title.style.opacity = '';
      title.style.transform = '';
      title.style.transition = '';
    }
    if (overlay) {
      overlay.className = '';
      overlay.style.opacity = '';
      overlay.style.backgroundColor = '';
      overlay.style.transition = '';
    }
    if (content) {
      content.className = '';
      content.style.opacity = '';
      content.style.transform = '';
      content.style.transition = '';
    }
    if (btn) btn.style.transform = '';
    if (video) {
      try { video.currentTime = 0; } catch (e) {}
      playVideoWhenReady();
    }
    runHeroIntro();
  };

  // Secuencia de salida (Transición hacia Showroom al hacer click)
  if (btn) {
    btn.addEventListener('click', function() {

      // El recorrido siempre comienza en el acceso principal.
      if (typeof CBZ_switchScene === 'function') {
        CBZ_switchScene('CBZ_360_01_ACCESO');
      }
      
      // Feedback sutil al pulsar
      btn.style.transform = 'scale(0.98)';
      
      // A. Fade to black (capa negra vuelve a 100% de opacidad)
      if (overlay) {
        overlay.style.transition = 'background-color 1.2s ease, opacity 1.2s ease';
        overlay.style.backgroundColor = '#000';
        overlay.style.opacity = '1';
        overlay.classList.remove('cbz-hero-overlay-hide');
      }
      
      // B. Ocultar los elementos de UI para que no interrumpan el fade
      if (content) {
        content.style.transition = 'opacity 0.6s ease';
        content.style.opacity = '0';
      }
      if (title) {
        title.style.transition = 'opacity 0.6s ease';
        title.style.opacity = '0';
      }

      // C. Tras fundir a negro completamente, desvanecer toda la pantalla HERO
      // para revelar el entorno 360 debajo sin cortes bruscos.
      setTimeout(function() {
        hero.style.transition = 'opacity 1.5s ease';
        hero.style.opacity = '0';
        
        // D. Limpiar del DOM y apagar video
        setTimeout(function() {
          hero.style.display = 'none';
          if (video) video.pause();
        }, 1500);

      }, 1200); // esperar a que el fade to black A se complete
    });
  }

})();
