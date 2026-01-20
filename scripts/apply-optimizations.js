const fs = require('fs');
const path = require('path');

// Konfiguráció
const CONFIG = {
  htmlFiles: [
    path.join(__dirname, '../index.html'),
    path.join(__dirname, '../index_en.html')
  ],
  backupDir: path.join(__dirname, '../.backup'),
  dryRun: false // true = csak szimulál, false = végrehajtja
};

// Statisztika
let stats = {
  imagePathChanges: 0,
  lazyLoadingAdded: 0,
  cssMinified: 0,
  jsMinified: 0
};

// Biztonsági mentés
function createBackup(filePath) {
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  const backupPath = path.join(
    CONFIG.backupDir,
    path.basename(filePath) + '.backup'
  );

  fs.copyFileSync(filePath, backupPath);
  console.log(`   💾 Backup: ${path.basename(backupPath)}`);
}

// HTML fájl optimalizálása
function optimizeHTML(filePath) {
  console.log(`\n🔄 Feldolgozás: ${path.basename(filePath)}`);

  // Backup készítése
  createBackup(filePath);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Képútvonalak frissítése: assets/img → assets/img-optimized
  const originalContent = content;
  content = content.replace(
    /assets\/img\//g,
    'assets/img-optimized/'
  );

  const imageChanges = (originalContent.match(/assets\/img\//g) || []).length;
  if (imageChanges > 0) {
    stats.imagePathChanges += imageChanges;
    modified = true;
    console.log(`   ✅ Képútvonalak: ${imageChanges} db frissítve`);
  }

  // 2. Lazy loading hozzáadása minden <img> tag-hez
  let lazyCount = 0;
  content = content.replace(
    /<img\s+(?![^>]*loading=["']lazy["'])([^>]*)>/gi,
    (match, attributes) => {
      // Skip ha data: URI vagy már van loading attribútum
      if (attributes.includes('data:') || attributes.includes('loading=')) {
        return match;
      }
      lazyCount++;
      modified = true;
      // Szép formázás: loading attribútumot src után helyezzük
      if (attributes.includes('src=')) {
        return attributes.replace(
          /(\s+src=["'][^"']+["'])/i,
          '$1 loading="lazy"'
        ).replace(/^/, '<img ').replace(/$/, '>');
      }
      return `<img ${attributes} loading="lazy">`;
    }
  );

  if (lazyCount > 0) {
    stats.lazyLoadingAdded += lazyCount;
    console.log(`   ✅ Lazy loading: ${lazyCount} db hozzáadva`);
  }

  // 3. CSS minified verzió használata
  if (content.includes('assets/css/style.css')) {
    content = content.replace(
      /<link[^>]*href=["']assets\/css\/style\.css["'][^>]*>/gi,
      match => {
        stats.cssMinified++;
        modified = true;
        return match.replace('style.css', 'style.min.css');
      }
    );
    console.log(`   ✅ CSS: style.css → style.min.css`);
  }

  // 4. JS minified verzió használata
  if (content.includes('assets/js/main.js')) {
    content = content.replace(
      /<script[^>]*src=["']assets\/js\/main\.js["'][^>]*>/gi,
      match => {
        stats.jsMinified++;
        modified = true;
        return match.replace('main.js', 'main.min.js');
      }
    );
    console.log(`   ✅ JS: main.js → main.min.js`);
  }

  // 5. WebP támogatás hozzáadása (opcionális, kommentált)
  // Ezt manuálisan is megtehetjük később a legfontosabb képeknél
  /*
  content = content.replace(
    /<img\s+([^>]*src=["']assets\/img-optimized\/((?:(?!["']).)+\.(?:jpg|jpeg|png))["'][^>]*)>/gi,
    (match, attributes, imagePath) => {
      const ext = path.extname(imagePath);
      const webpPath = imagePath.replace(ext, '.webp');
      return `<picture>
        <source srcset="assets/img-optimized/${webpPath}" type="image/webp">
        <${match.slice(1)}
      </picture>`;
    }
  );
  */

  // Fájl mentése (ha nem dry run)
  if (modified) {
    if (CONFIG.dryRun) {
      console.log(`   ⚠️  DRY RUN - nem mentve`);
    } else {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`   💾 Fájl mentve`);
    }
  } else {
    console.log(`   ℹ️  Nincs módosítás`);
  }

  return modified;
}

// Fő logika
console.log('🚀 Optimalizálások alkalmazása...\n');
console.log('═'.repeat(60));
console.log('\n⚙️  Műveletek:');
console.log('   1. Képútvonalak: assets/img → assets/img-optimized');
console.log('   2. Lazy loading hozzáadása minden <img>-hez');
console.log('   3. CSS/JS minified verziók használata');
console.log('\n📂 Feldolgozandó fájlok:', CONFIG.htmlFiles.length);

if (CONFIG.dryRun) {
  console.log('\n⚠️  DRY RUN MODE - csak szimuláció!\n');
}

console.log('═'.repeat(60));

// Fájlok feldolgozása
CONFIG.htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    optimizeHTML(file);
  } else {
    console.log(`\n⚠️  Nem található: ${file}`);
  }
});

// Összesítés
console.log('\n' + '═'.repeat(60));
console.log('\n📈 ÖSSZESÍTÉS:\n');
console.log(`🖼️  Képútvonalak frissítve:     ${stats.imagePathChanges} db`);
console.log(`⚡ Lazy loading hozzáadva:     ${stats.lazyLoadingAdded} db`);
console.log(`🎨 CSS minified:               ${stats.cssMinified} fájl`);
console.log(`⚙️  JS minified:                ${stats.jsMinified} fájl`);

console.log('\n✨ Optimalizálás befejezve!\n');
console.log('📁 Backup fájlok helye:', CONFIG.backupDir);
console.log('\n📝 Következő lépések:');
console.log('   1. Teszteld a weboldalt: npm run serve');
console.log('   2. Ellenőrizd a DevTools Network tab-ot');
console.log('   3. Ha minden rendben, commitolhatod a változásokat\n');
console.log('🔄 Visszaállítás (ha szükséges):');
console.log('   cp .backup/*.backup index*.html\n');
