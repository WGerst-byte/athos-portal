/* ==========================================================================
   Athos Subpage Bar Injector & PWA Connector
   ========================================================================== */

(function () {
  // 1. Register Service Worker on subpages as well
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {});
  }

  // 2. Inject Top Navigation Bar when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Avoid double injection
    if (document.getElementById('athosPortalBar')) return;

    const nav = document.createElement('aside');
    nav.id = 'athosPortalBar';
    nav.innerHTML = `
      <style>
        #athosPortalBar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99999;
          background: rgba(9, 13, 20, 0.96);
          backdrop-filter: blur(10px);
          border-bottom: 2px solid #c5a059;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          font-family: 'Cinzel', Georgia, serif;
          color: #f5efe1;
          padding: 0.6rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.8rem;
        }
        #athosPortalBar a.back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #d4af37;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: color 0.2s, transform 0.2s;
        }
        #athosPortalBar a.back-btn:hover {
          color: #fff;
          transform: translateX(-3px);
        }
        #athosPortalBar .nav-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        #athosPortalBar select.monastery-selector {
          background: #141e2e;
          color: #f5efe1;
          border: 1px solid rgba(197, 160, 89, 0.4);
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-family: inherit;
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }
        #athosPortalBar .pwa-indicator {
          font-size: 0.75rem;
          color: #4ade80;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        @media (max-width: 640px) {
          #athosPortalBar {
            padding: 0.5rem 0.8rem;
          }
          #athosPortalBar .pwa-indicator {
            display: none;
          }
        }
      </style>
      <a href="../index.html" class="back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Athos Portal
      </a>
      <div class="nav-controls">
        <select class="monastery-selector" id="monasteryQuickNav" onchange="if(this.value) window.location.href=this.value;">
          <option value="">Schnellnavigation Klöster...</option>
          <option value="simonos-petras.html">Kloster Simonos Petras (#13)</option>
          <option value="dionysiou.html">Kloster Dionysiou (#5)</option>
          <option value="grigoriu.html">Kloster Grigoriu (#17)</option>
          <option value="hilandar.html">Kloster Hilandar (#4)</option>
          <option value="rossikon.html">Kloster Rossikon / St. Panteleimon (#19)</option>
          <option value="agios-pavlos.html">Kloster Agios Pavlos (#18)</option>
          <option value="skete-andreas.html">Skete des Hl. Andreas</option>
          <option value="kloester-kompendium.html">Großes Kompendium aller Klöster</option>
          <option value="athos-halbinsel.html">Geografie & Landschaft</option>
          <option value="interaktiver-leitfaden.html">Interaktiver Pilgerleitfaden</option>
          <option value="byzanz-griechischer-einfluss.html">Byzanz & Griechischer Einfluss</option>
          <option value="rossikon-russischer-einfluss.html">Russischer Einfluss</option>
          <option value="zografou-bulgarisch-moldawisch.html">Bulgarischer & Moldawischer Einfluss</option>
          <option value="podcast-athos.html">Pilger-Podcast & Meditation</option>
        </select>
        <span class="pwa-indicator">● Offline-gesichert</span>
      </div>
    `;

    document.body.insertBefore(nav, document.body.firstChild);
  });
})();
