(function () {
  'use strict';

  var selector = document.getElementById('cbz-property-selector');
  if (!selector || !window.CBZ_SHOW_PROPERTY_SELECTOR) return;

  var slides = Array.prototype.slice.call(selector.querySelectorAll('[data-property]'));
  var title = document.getElementById('cbz-property-selector-title');
  var progress = Array.prototype.slice.call(selector.querySelectorAll('.cbz-property-selector__progress span'));
  var current = 0;
  var touchStartX = null;
  var names = { ESPLENDOR: 'CASA ESPLENDOR', BONANZA: 'CASA BONANZA' };

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      var active = slideIndex === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    progress.forEach(function (item, itemIndex) {
      item.classList.toggle('is-active', itemIndex === current);
    });
    if (title) title.textContent = names[slides[current].dataset.property];
  }

  function selectCurrent() {
    var nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete('edit');
    nextUrl.searchParams.set('property', slides[current].dataset.property.toLowerCase());
    selector.classList.add('is-leaving');
    window.setTimeout(function () {
      window.location.href = nextUrl.pathname + '?' + nextUrl.searchParams.toString();
    }, 360);
  }

  slides.forEach(function (slide, index) {
    slide.addEventListener('click', function () {
      if (index !== current) show(index);
      else selectCurrent();
    });
  });

  document.getElementById('cbz-property-selector-prev').addEventListener('click', function () {
    show(current - 1);
  });
  document.getElementById('cbz-property-selector-next').addEventListener('click', function () {
    show(current + 1);
  });

  selector.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'Enter' || event.key === ' ') selectCurrent();
  });
  selector.addEventListener('pointerdown', function (event) { touchStartX = event.clientX; });
  selector.addEventListener('pointerup', function (event) {
    if (touchStartX === null) return;
    var delta = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) < 45) return;
    show(delta < 0 ? current + 1 : current - 1);
  });

  show(0);
  selector.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(function () { selector.classList.add('is-visible'); });
})();
