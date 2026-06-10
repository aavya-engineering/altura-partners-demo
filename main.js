/* ──────────────────────────────────────────────
   Altura Partners — main.js
   Handles: theme toggle, mobile menu,
   scroll-reveal and navbar scroll state.
────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. THEME MANAGEMENT
  ───────────────────────────────────────── */
  const html           = document.documentElement;
  const themeToggle    = document.getElementById('theme-toggle');
  const themeIconLight = document.getElementById('theme-icon-light');
  const themeIconDark  = document.getElementById('theme-icon-dark');

  function applyTheme(isDark) {
    html.classList.toggle('dark', isDark);
    themeIconLight.classList.toggle('hidden', !isDark);
    themeIconDark.classList.toggle('hidden', isDark);
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function initTheme() {
    const stored = localStorage.getItem('altura-theme');
    if (stored) {
      applyTheme(stored === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    applyTheme(!isDark);
    localStorage.setItem('altura-theme', isDark ? 'light' : 'dark');
  });

  // Listen for OS-level preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('altura-theme')) {
      applyTheme(e.matches);
    }
  });

  initTheme();


  /* ─────────────────────────────────────────
     2. MOBILE MENU
  ───────────────────────────────────────── */
  const menuToggle  = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.classList.add('menu-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close mobile menu');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open mobile menu');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  }

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });


  /* ─────────────────────────────────────────
     3. NAVBAR SCROLL STATE
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function updateNavbarScrollState() {
    navbar.classList.toggle('scrolled', window.scrollY > 0);
  }

  updateNavbarScrollState();
  window.addEventListener('scroll', updateNavbarScrollState, { passive: true });


  /* ─────────────────────────────────────────
     4. SCROLL-REVEAL (IntersectionObserver)
  ───────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────
     5. SMOOTH ANCHOR SCROLLING
     (fallback for browsers without native)
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 4;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────────────
     7. FOCUS-CARD SUBTLE HOVER TILT
     (micro-interaction, pointer only)
  ───────────────────────────────────────── */
  const cards = document.querySelectorAll('.focus-card');

  if (window.matchMedia('(pointer: fine)').matches) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(600px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) scale(1.02)`;
        card.style.transition = 'transform 0.08s linear';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
      });
    });
  }

})();