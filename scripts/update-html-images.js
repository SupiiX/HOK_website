const fs = require('fs');
const path = require('path');

// HTML fájlok
const htmlFiles = [
  path.join(__dirname, '../index.html'),
  path.join(__dirname, '../index_en.html')
];

// Kép útvonal frissítés + WebP support + lazy loading
function updateHTML(filePath) {
  console.log(`\n🔄 Feldolgozás: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Egyszerű <img> tagek cseréje <picture> elemre (WebP + fallback)
  const imgRegex = /<img\s+([^>]*src=["']assets\/img\/((?:(?!["']).)+)["'][^>]*)>/gi;

  content = content.replace(imgRegex, (match, attributes, imagePath) => {
    // Ha már picture tagben van, vagy loading="lazy" létezik, ne csináljunk semmit
    if (match.includes('loading=') && match.includes('lazy')) {
      return match;
    }

    const ext = path.extname(imagePath);
    const imagePathWithoutExt = imagePath.replace(ext, '');

    // WebP path és eredeti optimalizált path
    const webpPath = `assets/img-optimized/${imagePathWithoutExt}.webp`;
    const fallbackPath = `assets/img-optimized/${imagePath}`;

    // Lazy loading hozzáadása ha nincs
    let updatedAttributes = attributes;
    if (!updatedAttributes.includes('loading=')) {
      updatedAttributes += ' loading="lazy"';
    }

    // Picture elem létrehozása
    changes++;
    return `<picture>
      <source srcset="${webpPath}" type="image/webp">
      <img ${updatedAttributes.replace(`assets/img/${imagePath}`, fallbackPath)}>
    </picture>`;
  });

  // 2. Background image-ek CSS-ben (inline style attribútumokban)
  const styleRegex = /style=["']([^"']*background-image:\s*url\(['"]?assets\/img\/([^'")\s]+)['"]?\)[^"']*)["']/gi;

  content = content.replace(styleRegex, (match, styleContent, imagePath) => {
    const ext = path.extname(imagePath);
    const imagePathWithoutExt = imagePath.replace(ext, '');
    const webpPath = `assets/img-optimized/${imagePathWithoutExt}.webp`;
    const fallbackPath = `assets/img-optimized/${imagePath}`;

    // CSS változó használata fallback-kel
    const updatedStyle = styleContent.replace(
      `assets/img/${imagePath}`,
      `assets/img-optimized/${imagePath}` // Egyszerűsített, WebP CSS-ben background-image-ként komplexebb
    );

    changes++;
    return `style="${updatedStyle}"`;
  });

  // 3. Lazy loading hozzáadása minden img-hez ami még nem rendelkezik vele
  content = content.replace(
    /<img\s+(?![^>]*loading=)([^>]*)>/gi,
    (match, attributes) => {
      // Skip ha ez egy data: URI vagy külső URL
      if (attributes.includes('data:') || attributes.includes('http')) {
        return match;
      }
      changes++;
      return `<img ${attributes} loading="lazy">`;
    }
  );

  // Fájl mentése
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${changes} módosítás végrehajtva`);

  return changes;
}

// Fő logika
console.log('🚀 HTML fájlok frissítése...\n');
console.log('⚙️  Módosítások:');
console.log('   - assets/img → assets/img-optimized');
console.log('   - <img> → <picture> (WebP + fallback)');
console.log('   - loading="lazy" hozzáadása');
console.log('═'.repeat(60));

let totalChanges = 0;

htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    totalChanges += updateHTML(file);
  } else {
    console.log(`⚠️  Nem található: ${file}`);
  }
});

console.log('\n' + '═'.repeat(60));
console.log(`\n✨ Kész! Összesen ${totalChanges} módosítás.\n`);
console.log('📝 Következő lépés: Teszteld a weboldalt helyi szerverrel:');
console.log('   npm run serve\n');
