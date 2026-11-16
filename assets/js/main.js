/* ==========================================================================
   Willian Dias — interações do portfólio
   Tema, navegação, animações de entrada, contadores, copiar e-mail e impressão.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var toastEl = document.getElementById('toast');
  var toastTimer;

  var isEnglish = (root.lang || 'pt').toLowerCase().indexOf('en') === 0;
  var STRINGS = isEnglish
    ? {
        switchToLight: 'Switch to light theme',
        switchToDark: 'Switch to dark theme',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        copied: 'Email copied! 🎉',
        copyManual: 'Copy manually: '
      }
    : {
        switchToLight: 'Ativar tema claro',
        switchToDark: 'Ativar tema escuro',
        openMenu: 'Abrir menu',
        closeMenu: 'Fechar menu',
        copied: 'E-mail copiado! 🎉',
        copyManual: 'Copie manualmente: '
      };

  /* ---------- Tema claro/escuro ---------- */
  var themeToggle = document.getElementById('theme-toggle');

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;

    if (persist) {
      try { localStorage.setItem('wd-theme', theme); } catch (e) { /* sem storage */ }
    }

    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#060a11' : '#eef3fa');
    }

    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? STRINGS.switchToLight : STRINGS.switchToDark);
      themeToggle.setAttribute('title', theme === 'dark' ? STRINGS.switchToLight : STRINGS.switchToDark);
    }
  }

  applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------- Menu mobile ---------- */
  var nav = document.getElementById('nav');
  var menuToggle = document.getElementById('menu-toggle');

  function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', STRINGS.openMenu);
  }

  if (nav && menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? STRINGS.closeMenu : STRINGS.openMenu);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 940) closeMenu();
    });
  }

  /* ---------- Link ativo conforme a rolagem ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    var offset = window.scrollY + 140;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section;
    });

    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 80) {
      current = sections[sections.length - 1];
    }

    navLinks.forEach(function (link) {
      var isActive = current && link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('is-active', Boolean(isActive));
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if (sections.length) {
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink);
    updateActiveLink();
  }

  /* ---------- Revelação ao rolar ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }
  /* ---------- Barras de skill ---------- */
  var bars = Array.prototype.slice.call(document.querySelectorAll('.skill__bar'));
  var langCards = Array.prototype.slice.call(document.querySelectorAll('.lang'));

  function fillSkills() {
    bars.forEach(function (bar) {
      var level = bar.getAttribute('data-level') || '0';
      bar.style.width = level + '%';
    });
    langCards.forEach(function (lang) {
      var card = lang.closest('.card');
      if (card) card.classList.add('is-animated');
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    fillSkills();
  } else {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains('skill__bar')) {
          entry.target.style.width = (entry.target.getAttribute('data-level') || '0') + '%';
        } else {
          var card = entry.target.closest('.card');
          if (card) card.classList.add('is-animated');
          langCards = langCards.filter(function (item) { return item !== entry.target; });
        }
        skillObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    bars.forEach(function (bar) { skillObserver.observe(bar); });
    langCards.forEach(function (lang) { skillObserver.observe(lang); });
  }

  /* ---------- Contadores do hero ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1300;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });

      counters.forEach(function (counter) { counterObserver.observe(counter); });
    }
  }

  /* Rede de segurança: se o IntersectionObserver não disparar
     (navegadores antigos, impressão ou ambiente sem renderização),
     o conteúdo continua visível em vez de ficar com opacidade zero. */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    window.setTimeout(function () {
      if (document.querySelector('.reveal.in-view')) return;
      revealAll();
      fillSkills();
      counters.forEach(animateCounter);
    }, 1600);
  }

  /* ---------- Rotador de área de atuação ---------- */
  var rotator = document.querySelector('.role-rotator');

  if (rotator && !reduceMotion) {
    var roles = [];
    try { roles = JSON.parse(rotator.getAttribute('data-roles') || '[]'); } catch (e) { roles = []; }

    if (roles.length > 1) {
      var roleIndex = 0;

      window.setInterval(function () {
        rotator.classList.add('is-swapping');

        window.setTimeout(function () {
          roleIndex = (roleIndex + 1) % roles.length;
          rotator.textContent = roles[roleIndex];
          rotator.classList.remove('is-swapping');
        }, 240);
      }, 3200);
    }
  }

  /* ---------- Toast + copiar e-mail ---------- */
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
    document.body.removeChild(field);
    return copied;
  }

  function copyEmail() {
    var email = 'willian.fer.dias01@gmail.com';

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(function () {
        showToast(STRINGS.copied);
      }).catch(function () {
        showToast(fallbackCopy(email) ? STRINGS.copied : STRINGS.copyManual + email);
      });
      return;
    }

    showToast(fallbackCopy(email) ? STRINGS.copied : STRINGS.copyManual + email);
  }

  document.querySelectorAll('[data-copy-email]').forEach(function (button) {
    button.addEventListener('click', copyEmail);
  });

  /* ---------- Impressão / PDF ---------- */
  var printButtons = document.querySelectorAll('[data-print]');

  function preparePrint() {
    fillSkills();
    revealAll();
  }

  printButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      preparePrint();
      window.setTimeout(function () { window.print(); }, 60);
    });
  });

  window.addEventListener('beforeprint', preparePrint);

  /* ---------- Voltar ao topo ---------- */
  var toTop = document.getElementById('to-top');

  function updateToTop() {
    if (!toTop) return;
    toTop.classList.toggle('is-visible', window.scrollY > 600);
  }

  if (toTop) {
    window.addEventListener('scroll', updateToTop, { passive: true });
    window.addEventListener('resize', updateToTop);

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    updateToTop();
  }

  /* ---------- Ano do rodapé ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
