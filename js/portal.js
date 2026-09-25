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
});
