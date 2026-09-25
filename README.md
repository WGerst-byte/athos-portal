# ☦️ Berg Athos – Klöster & Pilgerportal (PWA)

Eine moderne, autarke und offline-fähige Progressive Web App (PWA) über die autonome Mönchsrepublik des Heiligen Berges Athos (*Ἅγιον Ὄρος*), ihre 20 Klöster, Kunst, Theologie und Geschichte.

Umgesetzt mit **Antigravity** als native Web-App (HTML5, Modern CSS, Vanilla JavaScript, Service Worker & Web Manifest) – ganz ohne Framework-Ballast oder Build-Pipelines.

---

## 🌟 Highlights der Web-App

* **Echtzeit-Suche & Filterung:** Schnelles Durchsuchen aller Klöster und Abhandlungen nach Namen, Rang (1–20), Region (Südwestküste, Binnenland), Stiftern oder Jahrhunderten.
* **Progressive Web App (PWA):**
  * Auf Smartphone (iOS & Android) oder Desktop als vollwertige App installierbar.
  * Vollständig **offline-fähig** via Service Worker (`sw.js`) – ideal für Pilgerwanderungen auf Athos ohne Mobilfunkempfang.
* **Thematisches Byzantinisches Design:**
  * Farbwelt in *Sacred Gold* (`#c5a059`), Nachtblau und Pergament.
  * Vektorbasiertes Athos-Gipfelwappen mit byzantinischem Doppelkreuz als Favicon und App-Icon.
  * Universelle Schnellnavigation auf allen Unterseiten (`← Zurück zum Portal` und Dropdown-Menü).
* **Automatisches GitHub Pages Deployment:** Sofortige Veröffentlichung über GitHub Actions bei jedem `git push`.

---

## 📁 Projektstruktur

```text
athos-portal/
├── index.html                   # Zentrales Eingangsportal & Dashboard
├── manifest.json                # PWA-Konfiguration (Icons, Theme-Farbe)
├── sw.js                        # Service Worker (Offline-Caching-Strategie)
├── favicon.svg                  # Athos-Kreuz & Berg-Vektoricon
├── css/
│   └── portal.css               # Byzantinisches Designsystem & Responsive Grid
├── js/
│   ├── portal.js                # Echtzeit-Filter, Suche & PWA-Install-Prompt
│   └── nav-injector.js          # Sticky Topbar & Offline-Status für Unterseiten
├── assets/
│   ├── icons/                   # Vektor- & PWA-Icons (192, 512, Apple Touch)
│   └── images/                  # Infografiken & Bildmaterial
├── pages/                       # Die einzelnen Klöster-Dossiers & Themen
│   ├── simonos-petras.html      # Kloster Simonos Petras (#13)
│   ├── dionysiou.html           # Kloster Dionysiou (#5)
│   ├── grigoriu.html            # Kloster Grigoriu (#17)
│   ├── hilandar.html            # Serbischer Einfluss & Kloster Hilandar (#4)
│   ├── rossikon.html            # St. Panteleimon / Rossikon (#19)
│   ├── agios-pavlos.html        # Kloster Agios Pavlos (#18)
│   ├── skete-andreas.html       # Skete des Hl. Andreas (Karyes)
│   ├── kloester-kompendium.html # Die 20 Klöster im Überblick
│   ├── byzanz-griechischer-einfluss.html
│   ├── rossikon-russischer-einfluss.html
│   ├── zografou-bulgarisch-moldawisch.html
│   ├── athos-halbinsel.html     # Geografie, Routen & Natur
│   ├── interaktiver-leitfaden.html # Pilger-Vorbereitung (Diamonitirion)
│   └── podcast-athos.html       # Glockengeläut & Audio-Episoden
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions Pages Deployment
```

---

## 🚀 Live-Deployment auf GitHub Pages

Da das Projekt nativ gebaut ist, wird **keine Node.js-Build-Pipeline** benötigt.

### Schritt 1: GitHub Repository anlegen
1. Erstelle auf [GitHub.com](https://github.com/new) ein neues Repository (z. B. `athos-portal`).

### Schritt 2: Code hochladen
Führe im Terminal im Ordner `athos-portal` folgende Befehle aus:

```bash
cd c:\Users\wgers\Antigravity\athos-portal
git init
git add .
git commit -m "feat: Berg Athos PWA Portal & Klöster-Dossiers"
git branch -M main
git remote add origin https://github.com/<DEIN-GITHUB-BENUTZERNAME>/athos-portal.git
git push -u origin main
```

### Schritt 3: GitHub Pages aktivieren
1. Gehe im Repository auf **Settings** → **Pages**.
2. Wähle unter **Build and deployment** bei **Source** die Option:  
   👉 **`GitHub Actions`**
3. Der Workflow `.github/workflows/deploy.yml` baut und deployt die Seite automatisch in ca. 20 Sekunden.
4. Deine Web-App ist nun weltweit erreichbar unter:  
   `https://<DEIN-GITHUB-BENUTZERNAME>.github.io/athos-portal/`
