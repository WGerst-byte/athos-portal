/* ==========================================================================
   Athos Subpage Bar Injector & Universal Monastery Switcher
   ========================================================================== */

(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
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
          max-width: 280px;
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
          <option value="">Kloster / Skete wechseln...</option>
          
          <optgroup label="Die 20 Hauptklöster (Rangfolge)">
            <option value="megisti-lavra.html">#1 Megisti Lavra (Große Lavra)</option>
            <option value="vatopedi.html">#2 Vatopedi</option>
            <option value="iviron.html">#3 Iviron</option>
            <option value="hilandar.html">#4 Hilandar (Serbisch)</option>
            <option value="dionysiou.html">#5 Dionysiou</option>
            <option value="koutloumousiou.html">#6 Koutloumousiou</option>
            <option value="pantokratoros.html">#7 Pantokratoros</option>
            <option value="xiropotamou.html">#8 Xiropotamou</option>
            <option value="zografou.html">#9 Zografou (Bulgarisch)</option>
            <option value="dochiariou.html">#10 Dochiariou</option>
            <option value="karakallou.html">#11 Karakallou</option>
            <option value="philotheou.html">#12 Philotheou</option>
            <option value="simonos-petras.html">#13 Simonos Petras</option>
            <option value="agios-pavlos.html">#14 Agios Pavlos</option>
            <option value="stavronikita.html">#15 Stavronikita</option>
            <option value="xenophontos.html">#16 Xenophontos</option>
            <option value="grigoriu.html">#17 Grigoriu</option>
            <option value="esphigmenou.html">#18 Esphigmenou</option>
            <option value="rossikon.html">#19 St. Panteleimon (Rossikon)</option>
            <option value="konstamonitou.html">#20 Konstamonitou</option>
          </optgroup>

          <optgroup label="Berühmte Sketen">
            <option value="skete-agia-anna.html">Skete Agia Anna (Große Skete)</option>
            <option value="skete-andreas.html">Skete des Hl. Andreas (Serai)</option>
            <option value="skete-prodromou.html">Skete Timiou Prodromou (Rumänisch)</option>
            <option value="skete-kapsokalyvia.html">Skete Kapsokalyvia (Hesychasten)</option>
            <option value="nea-skiti.html">Nea Skiti (Hl. Joseph d. Hesychast)</option>
          </optgroup>

          <optgroup label="Leitfäden & Kultur">
            <option value="kloester-kompendium.html">Das Klöster-Kompendium (20 Klöster)</option>
            <option value="athos-halbinsel.html">Geografie & Landschaft</option>
            <option value="interaktiver-leitfaden.html">Pilgerführer & Diamonitirion</option>
            <option value="byzanz-griechischer-einfluss.html">Byzantinisches Erbe</option>
            <option value="rossikon-russischer-einfluss.html">Russischer Einfluss</option>
            <option value="zografou-bulgarisch-moldawisch.html">Bulgarien & Moldawien</option>
            <option value="podcast-athos.html">Podcast & Meditation</option>
          </optgroup>
        </select>
        <span class="pwa-indicator">● Offline-gesichert</span>
      </div>
    `;

    document.body.insertBefore(nav, document.body.firstChild);
  });
})();
