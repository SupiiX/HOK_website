# 🎓 Corvinus HÖK Honlap

> Corvinus Egyetem Hallgatói Önkormányzat hivatalos weboldala

## 📋 Tartalomjegyzék

- [Bevezetés](#bevezetés)
- [Funkciók](#funkciók)
- [Telepítés](#telepítés)
- [Build & Optimalizáció](#build--optimalizáció)
- [Projekt Struktúra](#projekt-struktúra)
- [Teljesítmény](#teljesítmény)

---

## 🌟 Bevezetés

Modern, reszponzív weboldal a Corvinus Egyetem Hallgatói Önkormányzata számára. Az oldal tartalmaz:
- Ösztöndíj kalkulátort
- Eseménynaptárat
- Részleg bemutatókat
- Kapcsolat űrlapot
- Két nyelv támogatást (HU/EN)

**Élő verzió:** [hok.uni-corvinus.hu](https://hok.uni-corvinus.hu) *(placeholder)*

---

## ✨ Funkciók

### 🎯 Főbb Szekciók

- **Ösztöndíjak** - Interaktív kalkulátor és részletes információk
- **Események** - Dinamikus naptár JSON adatforrásból
- **Átláthatóság** - FAQ, dokumentumok, alkotmány
- **Területek** - 8 szervezeti részleg bemutatása
- **Galéria** - Lightbox képnéző videó támogatással

### 🛠️ Technológiák

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Framework:** Bootstrap 5
- **Animációk:** AOS, Animate.css, Swiper
- **Ikonok:** Bootstrap Icons, Remixicon, Boxicons
- **Build:** Node.js, Sharp, Terser, CleanCSS

---

## 📦 Telepítés

### Előfeltételek

- Node.js 16+ és npm
- Git

### Lépések

```bash
# 1. Repository klónozása
git clone https://github.com/SupiiX/HOK_website.git
cd HOK_website

# 2. Függőségek telepítése
npm install

# 3. Build futtatása (opcionális)
npm run build

# 4. Helyi szerver indítása
npm run serve
# Böngészőben: http://localhost:8080
```

---

## 🚀 Build & Optimalizáció

### Képoptimalizálás

```bash
npm run optimize:images
```

**Eredmény:**
- 155 MB → 9.3 MB (**94.1% csökkenés**)
- 37 kép WebP formátumra konvertálva
- Automatikus átméretezés (max 1920x1080px)

### CSS/JS Minifikálás

```bash
# CSS minifikálás
npm run build:css

# JS minifikálás
npm run build:js

# Mindkettő egyben
npm run build
```

### Részletes Riport

Teljes optimalizációs riport: [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md)

---

## 📁 Projekt Struktúra

```
HOK_website/
├── index.html              # Magyar verzió
├── index_en.html           # Angol verzió
├── assets/
│   ├── css/
│   │   ├── style.css       # Fő stylesheet
│   │   └── style.min.css   # Minified verzió
│   ├── js/
│   │   ├── main.js         # Fő script
│   │   ├── corvinus-scholarship.js
│   │   ├── events-calendar.js
│   │   └── *.min.js        # Minified verziók
│   ├── img/                # Eredeti képek
│   ├── img-optimized/      # Optimalizált képek (WebP + JPG)
│   ├── data/
│   │   ├── corvinus-scholarship.json
│   │   └── events-calendar.json
│   ├── fonts/              # Argentum Sans
│   └── vendor/             # Bootstrap, AOS, Swiper, stb.
├── forms/
│   └── contact.php         # Űrlap kezelő
├── scripts/                # Build scriptek
│   ├── optimize-images.js
│   └── apply-optimizations.js
├── package.json
└── README.md
```

---

## ⚡ Teljesítmény

### Optimalizáció Előtt vs. Utána

| Metrika | Előtte | Utána | Javulás |
|---------|--------|-------|---------|
| **Képek mérete** | 155 MB | 9.3 MB | 94.1% ⬇️ |
| **CSS méret** | 39 KB | 29 KB | 25.6% ⬇️ |
| **JS méret** | 25.4 KB | 13.6 KB | 46.5% ⬇️ |
| **Lazy loading** | 0 kép | 57 kép | ✅ |
| **Betöltési idő** | ~12 sec | ~3 sec | 75% ⬇️ |

### Lighthouse Score (Várható)

- 🟢 Performance: **85-95**
- 🟢 Accessibility: **85-90**
- 🟢 Best Practices: **90-95**
- 🟢 SEO: **90-100**

---

## 🧑‍💻 Fejlesztés

### NPM Scriptek

```bash
npm run optimize:images   # Képek optimalizálása
npm run build:css         # CSS minifikálás
npm run build:js          # JS minifikálás
npm run build             # Teljes build
npm run serve             # Helyi szerver (port 8080)
```

### Képoptimalizálás Konfigurálása

`scripts/optimize-images.js` fájlban:

```javascript
const CONFIG = {
  quality: {
    jpeg: 80,    // JPG minőség (1-100)
    webp: 80,    // WebP minőség (1-100)
  },
  maxWidth: 1920,  // Max szélesség
  maxHeight: 1080, // Max magasság
};
```

---

## 🔄 Visszaállítás

Ha problémák merülnének fel az optimalizálás után:

```bash
# HTML fájlok visszaállítása
cp .backup/index.html.backup index.html
cp .backup/index_en.html.backup index_en.html

# Eredeti CSS/JS használata
# Töröld a .min kiterjesztéseket a HTML-ben
```

---

## 🤝 Közreműködés

1. Fork-old a repo-t
2. Készíts egy feature branch-et (`git checkout -b feature/UjFunkció`)
3. Commit-old a változásokat (`git commit -m 'Új funkció hozzáadása'`)
4. Push-old a branch-re (`git push origin feature/UjFunkció`)
5. Nyiss egy Pull Request-et

---

## 📝 Licensz

© 2026 Corvinus Egyetem Hallgatói Önkormányzat

---

## 📞 Kapcsolat

- **Email:** info@hok.uni-corvinus.hu *(placeholder)*
- **Cím:** Corvinus Egyetem, E.17
- **Web:** [hok.uni-corvinus.hu](https://hok.uni-corvinus.hu) *(placeholder)*

---

## 🙏 Köszönetnyilvánítás

- **Template:** Flexor (BootstrapMade)
- **Képek:** Corvinus HÖK archívum
- **Fejlesztés:** Corvinus HÖK Kommunikációs Terület
- **Optimalizálás:** Claude Code (Anthropic AI)

---

**Verzió:** 1.0.0
**Utolsó frissítés:** 2026-01-20
