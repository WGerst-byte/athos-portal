/* ==========================================================================
   Berg Athos Portal – Client Controller & PWA Manager
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.athos-card');
  const visibleCountEl = document.getElementById('visibleCount');
  const totalCountEl = document.getElementById('totalCount');
  const emptyState = document.getElementById('emptyState');
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const installBtn = document.getElementById('installBtn');

  let activeCategory = 'all';
  let deferredPrompt = null;

  // Set total count
  if (totalCountEl) totalCountEl.textContent = cards.length.toString();

  // 1. Service Worker Registration & Offline Detection
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[Athos PWA] Service Worker registriert mit Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Athos PWA] Service Worker Registrierungsfehler:', err);
        });
    });
  }

  function updateOnlineStatus() {
    if (!statusBadge || !statusText) return;
    if (navigator.onLine) {
      statusBadge.classList.remove('offline');
      statusText.textContent = 'Offline-bereit';
    } else {
      statusBadge.classList.add('offline');
      statusText.textContent = 'Offline-Modus aktiv';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // 2. PWA Install Prompt Event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[Athos PWA] Benutzer-Antwort auf Installation:', outcome);
      deferredPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[Athos PWA] Erfolgreich als App installiert.');
    if (installBtn) installBtn.style.display = 'none';
  });

  // 3. Search & Filter Engine
  function filterCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    // Toggle clear search button
    if (clearBtn) {
      clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    cards.forEach((card) => {
      const title = card.getAttribute('data-title') || '';
      const summary = card.getAttribute('data-summary') || '';
      const keywords = card.getAttribute('data-keywords') || '';
      const category = card.getAttribute('data-category') || '';
      const region = card.getAttribute('data-region') || '';

      const matchesQuery = query === '' ||
        title.toLowerCase().includes(query) ||
        summary.toLowerCase().includes(query) ||
        keywords.toLowerCase().includes(query) ||
        region.toLowerCase().includes(query);

      const matchesCategory =
        activeCategory === 'all' ||
        category === activeCategory ||
        region.toLowerCase().includes(activeCategory.toLowerCase());

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCountEl) visibleCountEl.textContent = visibleCount.toString();
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Event Listeners for Filters
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterCards();
      searchInput.focus();
    });
  }

  // Initial filter run
  filterCards();

  // 4. Share & QR-Code Modal Controller
  const shareBtn = document.getElementById('shareBtn');
  const shareModal = document.getElementById('shareModal');
  const modalClose = document.getElementById('modalClose');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const shareUrlInput = document.getElementById('shareUrlInput');
  const copyToast = document.getElementById('copyToast');
  const nativeShareBtn = document.getElementById('nativeShareBtn');

  const shareData = {
    title: 'Berg Athos – Die 20 Klöster & Pilgerportal (PWA)',
    text: 'Entdecke die kostenlose, offline-fähige Web-App zu allen 20 Klöstern des Heiligen Berges Athos:',
    url: 'https://wgerst-byte.github.io/athos-portal/'
  };

  if (shareBtn && shareModal) {
    shareBtn.addEventListener('click', () => {
      shareModal.classList.add('active');
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        shareModal.classList.remove('active');
      });
    }

    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        shareModal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareModal.classList.contains('active')) {
        shareModal.classList.remove('active');
      }
    });
  }

  // Copy URL with clipboard API & fallback
  if (copyUrlBtn && shareUrlInput) {
    copyUrlBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareUrlInput.value);
      } catch {
        shareUrlInput.select();
        document.execCommand('copy');
      }

      if (copyToast) {
        copyToast.style.display = 'block';
        setTimeout(() => {
          copyToast.style.display = 'none';
        }, 2500);
      }
    });
  }

  // Native Web Share / WhatsApp Fallback
  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('[Athos PWA] Share abgebrochen oder Fehler:', err);
        }
  // 5. Language Switcher & Instant Multilingual Controller
  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langOpts = document.querySelectorAll('.lang-opt');
  const currentLangFlag = document.getElementById('currentLangFlag');
  const currentLangLabel = document.getElementById('currentLangLabel');

  const langMap = {
    de: { flag: '🇩🇪', label: 'DE' },
    es: { flag: '🇪🇸', label: 'ES' },
    en: { flag: '🇬🇧', label: 'EN' },
    el: { flag: '🇬🇷', label: 'EL' },
    ro: { flag: '🇷🇴', label: 'RO' },
    sr: { flag: '🇷🇸', label: 'SR' },
    ru: { flag: '🇷🇺', label: 'RU' }
  };

  function updateLangUI(lang) {
    if (langMap[lang]) {
      if (currentLangFlag) currentLangFlag.textContent = langMap[lang].flag;
      if (currentLangLabel) currentLangLabel.textContent = langMap[lang].label;
    }
    langOpts.forEach((opt) => {
      if (opt.getAttribute('data-lang') === lang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  function applyLanguage(lang) {
    localStorage.setItem('athos_user_lang', lang);

    // Set cookie for Google Translate
    const domain = window.location.hostname;
    document.cookie = `googtrans=/de/${lang}; path=/;`;
    if (domain && domain !== 'localhost') {
      document.cookie = `googtrans=/de/${lang}; path=/; domain=${domain};`;
      document.cookie = `googtrans=/de/${lang}; path=/; domain=.${domain};`;
    }

    // Trigger select element if already loaded
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
    } else {
      // If translate widget not initialized yet, reload to apply cookie
      setTimeout(() => {
        location.reload();
      }, 100);
    }

    updateLangUI(lang);
  }

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
      langSwitcher.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
      if (langSwitcher) langSwitcher.classList.remove('open');
    });

    langOpts.forEach((opt) => {
      opt.addEventListener('click', () => {
        const lang = opt.getAttribute('data-lang') || 'de';
        applyLanguage(lang);
        langDropdown.classList.remove('active');
        if (langSwitcher) langSwitcher.classList.remove('open');
      });
    });
  }

  // Restore saved language on load
  const savedLang = localStorage.getItem('athos_user_lang');
  if (savedLang && savedLang !== 'de') {
    updateLangUI(savedLang);
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        clearInterval(interval);
        if (select.value !== savedLang) {
          select.value = savedLang;
          select.dispatchEvent(new Event('change'));
        }
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 200);
  }
});


