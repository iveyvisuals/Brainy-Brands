(function () {
  'use strict';

  var subs = Array.prototype.slice.call(document.querySelectorAll('.has-submenu'));

  function closeAll() {
    subs.forEach(function (li) {
      li.classList.remove('is-open');
      var btn = li.querySelector('.submenu-toggle');
      if (btn) { btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  if (subs.length) {
    subs.forEach(function (li) {
      var btn = li.querySelector('.submenu-toggle');
      if (!btn) { return; }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !li.classList.contains('is-open');
        closeAll();
        if (willOpen) {
          li.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (e) {
      var insideOpenMenu = subs.some(function (li) { return li.contains(e.target); });
      if (!insideOpenMenu) { closeAll(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); }
    });
  }

  // Mobile hamburger menu -- toggles the nav+CTA panel that sits under the
  // header on narrow screens. On desktop .dt-nav-panel is `display:contents`
  // so this button stays hidden and never fires.
  var navToggle = document.querySelector('.dt-nav-toggle');
  var navPanel = document.getElementById('nav-panel');
  if (navToggle && navPanel) {
    var closePanel = function () {
      navPanel.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      closeAll();
    };
    navToggle.addEventListener('click', function () {
      var willOpen = !navPanel.classList.contains('is-open');
      if (willOpen) {
        navPanel.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
      } else {
        closePanel();
      }
    });
    document.addEventListener('click', function (e) {
      if (!navPanel.classList.contains('is-open')) { return; }
      if (navPanel.contains(e.target) || navToggle.contains(e.target)) { return; }
      closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePanel(); }
    });
  }

  // Masthead sits transparent over the hero below it; once the page scrolls
  // past that hero, it needs a solid ground to stay readable over light
  // content, so it picks one up here instead of carrying it all the time.
  var masthead = document.querySelector('.masthead');
  if (masthead) {
    var THRESHOLD = 24;
    var update = function () {
      masthead.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
})();
