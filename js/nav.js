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

  // "Dismissed" hides a submenu even while it is hovered or holds focus
  // (Escape, or right after picking a link), until the pointer or focus
  // leaves and comes back.
  function dismiss(li) {
    li.classList.add('is-dismissed');
    li.classList.remove('is-open');
    var btn = li.querySelector('.submenu-toggle');
    if (btn) { btn.setAttribute('aria-expanded', 'false'); }
  }

  function openMenu(li) {
    closeAll();
    li.classList.remove('is-dismissed');
    li.classList.add('is-open');
    var btn = li.querySelector('.submenu-toggle');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); }
  }

  if (subs.length) {
    subs.forEach(function (li) {
      var btn = li.querySelector('.submenu-toggle');
      if (!btn) { return; }
      var parentLink = li.querySelector('a');
      var links = Array.prototype.slice.call(li.querySelectorAll('.submenu a'));

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (li.classList.contains('is-open')) {
          closeAll();
        } else {
          openMenu(li);
        }
      });

      function openAndFocusFirst(e) {
        if (e.key !== 'ArrowDown' || !links.length) { return; }
        e.preventDefault();
        openMenu(li);
        links[0].focus();
      }
      btn.addEventListener('keydown', openAndFocusFirst);
      if (parentLink) { parentLink.addEventListener('keydown', openAndFocusFirst); }

      links.forEach(function (a, i) {
        a.addEventListener('keydown', function (e) {
          var target = null;
          if (e.key === 'ArrowDown') { target = links[(i + 1) % links.length]; }
          else if (e.key === 'ArrowUp') { target = i === 0 ? btn : links[i - 1]; }
          else if (e.key === 'Home') { target = links[0]; }
          else if (e.key === 'End') { target = links[links.length - 1]; }
          if (target) { e.preventDefault(); target.focus(); }
        });
        a.addEventListener('click', function () { dismiss(li); });
      });

      li.addEventListener('mouseenter', function () { li.classList.remove('is-dismissed'); });
      li.addEventListener('mouseleave', function () { li.classList.remove('is-dismissed'); });
      li.addEventListener('focusout', function (e) {
        if (!e.relatedTarget || !li.contains(e.relatedTarget)) { li.classList.remove('is-dismissed'); }
      });
    });

    document.addEventListener('click', function (e) {
      var insideOpenMenu = subs.some(function (li) { return li.contains(e.target); });
      if (!insideOpenMenu) { closeAll(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { return; }
      var holder = subs.filter(function (li) { return li.contains(document.activeElement); })[0];
      closeAll();
      if (holder) {
        dismiss(holder);
        var toggle = holder.querySelector('.submenu-toggle');
        if (toggle) { toggle.focus(); }
      }
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
    navPanel.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) { closePanel(); }
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
