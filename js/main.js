/* ==========================================================================
   Imalka Lakshitha · Portfolio scripts
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------------------
     Content you may want to edit
     ---------------------------------------------------------------------- */
  var ROLES = ['IT Undergraduate', 'Network Engineer', 'Mobile App Developer', 'Full Stack Developer'];
  var CONTACT_EMAIL = 'imalkalakshitha485@gmail.com';


  /* ----------------------------------------------------------------------
     1. Theme toggle (saved in localStorage)
     ---------------------------------------------------------------------- */
  var THEME_KEY = 'theme';
  var themeBtn = document.querySelector('.theme-toggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f6f7fb' : '#0a0a0f');
    if (themeBtn) themeBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked */ }
    });
  }


  /* ----------------------------------------------------------------------
     2. Mobile menu
     ---------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var mainEl = document.getElementById('main');
  var footerEl = document.querySelector('.site-footer');

  function setMenu(open, opts) {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    mobileMenu.inert = !open;
    if (mainEl) mainEl.inert = open;
    if (footerEl) footerEl.inert = open;

    if (open) {
      var first = mobileMenu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    } else if (!opts || opts.returnFocus !== false) {
      navToggle.focus({ preventScroll: true });
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close when a link is tapped
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false, { returnFocus: false });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenu(false);
    });

    // Reset if the screen grows to desktop width while open
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
      if (mq.matches && mobileMenu.classList.contains('is-open')) setMenu(false, { returnFocus: false });
    });
  }

  // Placeholder links (e.g. LinkedIn "#") should not jump to the top
  document.querySelectorAll('a[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });


  /* ----------------------------------------------------------------------
     3. Header state + back-to-top button (one rAF-throttled scroll handler)
     ---------------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  }


  /* ----------------------------------------------------------------------
     4. Typing animation in the hero
     ---------------------------------------------------------------------- */
  var typedEl = document.querySelector('.typed');

  if (typedEl) {
    var roleIndex = 0;

    if (reducedMotion.matches) {
      // No typing effect: swap the whole word every few seconds
      setInterval(function () {
        roleIndex = (roleIndex + 1) % ROLES.length;
        typedEl.textContent = ROLES[roleIndex];
      }, 3000);
    } else {
      var charIndex = ROLES[0].length;
      var deleting = true;
      var typeTick = function () {
        var word = ROLES[roleIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIndex);

        var delay = deleting ? 40 : 80;
        if (!deleting && charIndex === word.length) {
          deleting = true;
          delay = 1800;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % ROLES.length;
          delay = 350;
        }
        setTimeout(typeTick, delay);
      };
      setTimeout(typeTick, 2200);
    }
  }


  /* ----------------------------------------------------------------------
     5. Scroll reveal (fade + slide up)
     ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  var canObserve = 'IntersectionObserver' in window;

  if (reducedMotion.matches || !canObserve) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }


  /* ----------------------------------------------------------------------
     6. Animated stat counters
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length && canObserve && !reducedMotion.matches) {
    counters.forEach(function (el) { el.textContent = '0'; });
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }


  /* ----------------------------------------------------------------------
     7. Active nav link while scrolling
     ---------------------------------------------------------------------- */
  var navLinks = document.querySelectorAll('[data-nav]');
  var sections = document.querySelectorAll('main section[id]');

  function setActive(id) {
    navLinks.forEach(function (link) {
      var on = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if (canObserve && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
  }


  /* ----------------------------------------------------------------------
     8. Decorative waveform bars in the featured project
     ---------------------------------------------------------------------- */
  var wave = document.querySelector('[data-wave]');
  if (wave) {
    var bars = window.innerWidth < 600 ? 40 : 64;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < bars; i++) {
      var bar = document.createElement('span');
      var h = 22 + Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.13)) * 70;
      bar.style.setProperty('--h', h.toFixed(0) + '%');
      bar.style.setProperty('--d', (-i * 0.08).toFixed(2) + 's');
      frag.appendChild(bar);
    }
    wave.appendChild(frag);
  }


  /* ----------------------------------------------------------------------
     9. Copy email to clipboard
     ---------------------------------------------------------------------- */
  var liveRegion = document.getElementById('live-region');

  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    setTimeout(function () { liveRegion.textContent = msg; }, 50);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    var resetTimer;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var done = function (ok) {
        if (!ok) { announce('Copy failed. Please copy the address manually.'); return; }
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Email address copied');
        announce('Email address copied to clipboard');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', 'Copy email address');
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });


  /* ----------------------------------------------------------------------
     10. Contact form → opens a pre-filled email (no backend)
     ---------------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();

      var subject = 'Portfolio enquiry from ' + name;
      var body = message + '\n\n— ' + name + '\n' + email;
      window.location.href = 'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (status) status.textContent = 'Opening your email app…';
    });
  }
})();
