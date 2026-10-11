/* Lead-magnet popup: free "what a PPC audit looks like" video for an email.
   Stays OFF until ghlFormUrl is filled in below, or ?popup=preview is added
   to a page's URL (shows quickly, sends nothing, ignores dismissal memory). */
(function () {
  'use strict';

  var CONFIG = {
    ghlFormUrl: '',           // TODO: GoHighLevel endpoint that receives the email (confirm with client)
    videoUrl: '',             // TODO: optional "Watch it now" link; the GHL workflow does the emailing
    resource: 'ppc-audit-demo-video',
    scrollDepth: 0.5,         // show after this much of the page has been scrolled...
    minSecondsWithScroll: 5,  // ...and the visitor has been here at least this long
    secondsOnPage: 30,        // or after this long regardless of scrolling
    dismissDays: 30,          // quiet period after "No thanks" / close
    subscribedDays: 365       // quiet period after signing up
  };
  var override = window.BB_LEAD_MAGNET_CONFIG || {};
  Object.keys(override).forEach(function (k) { CONFIG[k] = override[k]; });

  var params = new URLSearchParams(window.location.search);
  var preview = params.get('popup') === 'preview';
  if (!CONFIG.ghlFormUrl && !preview) { return; }

  var KEY_DISMISSED = 'bb_lm_dismissed';
  var KEY_SUBSCRIBED = 'bb_lm_subscribed';
  var KEY_SESSION = 'bb_lm_shown';

  function read(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function write(store, key, val) { try { store.setItem(key, val); } catch (e) { /* private mode */ } }
  function within(key, days) {
    var t = parseInt(read(window.localStorage, key), 10);
    return !isNaN(t) && Date.now() - t < days * 86400000;
  }

  if (!preview) {
    if (within(KEY_DISMISSED, CONFIG.dismissDays) || within(KEY_SUBSCRIBED, CONFIG.subscribedDays)) { return; }
    if (read(window.sessionStorage, KEY_SESSION)) { return; }
  }

  var root, card, lastFocus, shown = false;

  function build() {
    root = document.createElement('div');
    root.className = 'dt-lm';
    root.hidden = true;
    root.innerHTML =
      '<div class="dt-lm-backdrop" data-lm-close></div>' +
      '<div class="dt-lm-card" role="dialog" aria-modal="true" aria-labelledby="dt-lm-title" aria-describedby="dt-lm-desc" tabindex="-1">' +
        '<button type="button" class="dt-lm-x" data-lm-close aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<div class="dt-lm-state" data-lm-form>' +
          '<span class="dt-lm-badge"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>Free video &middot; about 5 min</span>' +
          '<h2 class="dt-lm-title" id="dt-lm-title">See what a Brainy Brands PPC audit looks like</h2>' +
          '<p class="dt-lm-desc" id="dt-lm-desc">A free, five-minute video walking through what a Brainy Brands PPC audit looks like, so you know what to expect before you ever book a call.</p>' +
          '<form class="dt-lm-form" novalidate>' +
            '<div class="dt-field">' +
              '<label for="dt-lm-email" class="dt-lm-sr">Email address</label>' +
              '<input id="dt-lm-email" type="email" name="email" autocomplete="email" inputmode="email" placeholder="you@yourbrand.com" required>' +
            '</div>' +
            '<input type="text" name="company" class="dt-lm-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<p class="dt-lm-error" role="alert" hidden></p>' +
            '<button type="submit" class="dt-btn dt-btn--primary dt-lm-submit">Send me the video</button>' +
          '</form>' +
          '<p class="dt-lm-fine">We&rsquo;ll email you the video. <a href="privacy.html">Privacy Policy</a></p>' +
          '<button type="button" class="dt-lm-skip" data-lm-close>No thanks</button>' +
        '</div>' +
        '<div class="dt-lm-state dt-lm-state--done" data-lm-done hidden aria-live="polite">' +
          '<span class="dt-lm-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
          '<h2 class="dt-lm-title" tabindex="-1" data-lm-done-title>Check your inbox</h2>' +
          '<p class="dt-lm-desc">Your free audit video is on its way.</p>' +
          '<a class="dt-btn dt-btn--primary dt-lm-submit" data-lm-watch hidden target="_blank" rel="noopener">Watch it now</a>' +
          '<p class="dt-lm-preview" data-lm-preview hidden>Preview only: GoHighLevel isn&rsquo;t connected yet, so nothing was sent.</p>' +
          '<button type="button" class="dt-lm-skip" data-lm-close>Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    card = root.querySelector('.dt-lm-card');

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-lm-close]')) { close(true); }
    });
    root.querySelector('form').addEventListener('submit', onSubmit);
    root.addEventListener('keydown', onKey);
  }

  function focusables() {
    return Array.prototype.slice.call(card.querySelectorAll('a[href], button, input:not(.dt-lm-hp)'))
      .filter(function (el) { return !el.closest('[hidden]') && !el.hidden; });
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
    if (e.key !== 'Tab') { return; }
    var items = focusables();
    if (!items.length) { return; }
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === card)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function show() {
    if (shown) { return; }
    shown = true;
    if (!root) { build(); }
    lastFocus = document.activeElement;
    root.hidden = false;
    document.documentElement.classList.add('dt-lm-open');
    requestAnimationFrame(function () {
      root.classList.add('is-in');
      var input = root.querySelector('#dt-lm-email');
      (input || card).focus({ preventScroll: true });
    });
    if (!preview) { write(window.sessionStorage, KEY_SESSION, '1'); }
  }

  function close(remember) {
    if (!root || root.hidden) { return; }
    root.classList.remove('is-in');
    document.documentElement.classList.remove('dt-lm-open');
    setTimeout(function () { root.hidden = true; }, 200);
    if (remember && !preview && !within(KEY_SUBSCRIBED, CONFIG.subscribedDays)) {
      write(window.localStorage, KEY_DISMISSED, String(Date.now()));
    }
    if (lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); }
  }

  function showError(msg) {
    var el = root.querySelector('.dt-lm-error');
    el.textContent = msg;
    el.hidden = !msg;
  }

  function done() {
    root.querySelector('[data-lm-form]').hidden = true;
    var doneEl = root.querySelector('[data-lm-done]');
    doneEl.hidden = false;
    if (CONFIG.videoUrl) {
      var watch = doneEl.querySelector('[data-lm-watch]');
      watch.href = CONFIG.videoUrl;
      watch.hidden = false;
    }
    if (!CONFIG.ghlFormUrl) { doneEl.querySelector('[data-lm-preview]').hidden = false; }
    doneEl.querySelector('[data-lm-done-title]').focus();
    if (!preview) { write(window.localStorage, KEY_SUBSCRIBED, String(Date.now())); }
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var email = form.elements.email.value.trim();
    if (form.elements.company.value) { done(); return; }   // honeypot: bots see a fake success
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showError('Please enter a valid email address.');
      form.elements.email.focus();
      return;
    }
    showError('');
    var btn = form.querySelector('button[type="submit"]');

    if (!CONFIG.ghlFormUrl) { done(); return; }            // preview: send nothing

    btn.disabled = true;
    btn.textContent = 'Sending…';
    fetch(CONFIG.ghlFormUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        resource: CONFIG.resource,
        source_page: window.location.pathname,
        submitted_at: new Date().toISOString()
      })
    }).then(function (res) {
      if (!res.ok) { throw new Error('bad status'); }
      done();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = 'Send me the video';
      showError('Something went wrong. Please try again in a moment.');
    });
  }

  // ---- when to show --------------------------------------------------------
  if (preview) {
    setTimeout(show, 1500);
    return;
  }

  var seconds = 0;
  function depth() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    return h > 0 ? window.scrollY / h : 0;
  }
  function busy() {
    var a = document.activeElement;
    var typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
    var navOpen = document.querySelector('.dt-nav-panel.is-open');
    return typing || navOpen;
  }
  var timer = setInterval(function () {
    if (document.hidden) { return; }
    seconds += 1;
    var ready = seconds >= CONFIG.secondsOnPage ||
      (seconds >= CONFIG.minSecondsWithScroll && depth() >= CONFIG.scrollDepth);
    if (ready && !busy()) {
      clearInterval(timer);
      show();
    }
  }, 1000);
})();
