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
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIconLight = document.getElementById('theme-icon-light');
  const themeIconDark = document.getElementById('theme-icon-dark');

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
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

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
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
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


  /* ─────────────────────────────────────────
     6. CONTACT FORM (EmailJS)
  ───────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const founderBtn = document.getElementById('founder-inquiry-btn');
    const inquiryTypeInput = contactForm.querySelector('[name="inquiry_type"]');
    const submitBtn = contactForm.querySelector('.btn-contact-primary');
    const defaultSubmitLabel = submitBtn.textContent.trim();
    const defaultFounderLabel = founderBtn.textContent.trim();
    let activeSubmitBtn = submitBtn;
    const modal = document.getElementById('contact-modal');
    const modalIcon = document.getElementById('contact-modal-icon');
    const modalTitle = document.getElementById('contact-modal-title');
    const modalDesc = document.getElementById('contact-modal-desc');
    const modalCloseBtn = modal?.querySelector('.contact-modal-close');
    const modalBackdrop = modal?.querySelector('[data-modal-close]');
    const CONTACT_EMAIL = 'info@alturapartners.ai';
    let lastFocusedElement = null;

    const config = window.ALTURA_EMAILJS || {};
    const isConfigured =
      config.publicKey &&
      config.serviceId &&
      config.templateId &&
      !String(config.publicKey).includes('YOUR_') &&
      !String(config.publicKey).includes('your_');

    if (typeof emailjs !== 'undefined' && isConfigured) {
      emailjs.init({ publicKey: config.publicKey });
    }

    const modalContent = {
      success: {
        icon: 'assets/success.svg',
        iconAlt: 'Success',
        title: 'Thank you',
        description: "Your message has been sent. We'll be in contact soon.",
      },
      error: {
        icon: 'assets/failed.svg',
        iconAlt: 'Failed',
        title: 'Failed',
        description: `Failed to send your message. You can contact us directly at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`,
      },
    };

    function showModal(type) {
      if (!modal) return;

      const content = modalContent[type] || modalContent.error;
      lastFocusedElement = document.activeElement;

      modalIcon.src = content.icon;
      modalIcon.alt = content.iconAlt;
      modalTitle.textContent = content.title;
      modalDesc.innerHTML = content.description;

      modal.removeAttribute('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalCloseBtn?.focus();
    }

    function closeModal() {
      if (!modal || modal.hasAttribute('hidden')) return;

      modal.setAttribute('hidden', '');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      modalDesc.textContent = '';

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    modalCloseBtn?.addEventListener('click', closeModal);
    modalBackdrop?.addEventListener('click', closeModal);

    modal?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    function setInquiryType(type) {
      inquiryTypeInput.value = type;
    }

    function setLoading(loading) {
      submitBtn.disabled = loading;
      founderBtn.disabled = loading;
      submitBtn.textContent =
        loading && activeSubmitBtn === submitBtn ? 'Sending…' : defaultSubmitLabel;
      founderBtn.textContent =
        loading && activeSubmitBtn === founderBtn ? 'Sending…' : defaultFounderLabel;
    }

    document.querySelectorAll('[data-inquiry-type]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        setInquiryType(trigger.dataset.inquiryType);
      });
    });

    submitBtn.addEventListener('click', () => {
      activeSubmitBtn = submitBtn;
      setInquiryType('Partners With Us');
    });

    founderBtn.addEventListener('click', () => {
      activeSubmitBtn = founderBtn;
      setInquiryType('Founder Inquiry');
      contactForm.requestSubmit();
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (typeof emailjs === 'undefined' || !isConfigured) {
        showModal('error');
        return;
      }

      setLoading(true);

      try {
        await emailjs.sendForm(config.serviceId, config.templateId, contactForm);
        contactForm.reset();
        activeSubmitBtn = submitBtn;
        setInquiryType('Partners With Us');
        showModal('success');
      } catch (error) {
        console.error('EmailJS error:', error);
        showModal('error');
      } finally {
        setLoading(false);
      }
    });
  }

})();