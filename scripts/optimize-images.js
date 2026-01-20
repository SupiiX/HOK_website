const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Konfiguráció
const CONFIG = {
  imageDir: path.join(__dirname, '../assets/img'),
  outputDir: path.join(__dirname, '../assets/img-optimized'),
  quality: {
    jpeg: 80,    // JPG minőség (1-100)
    webp: 80,    // WebP minőség (1-100)
    png: 80      // PNG minőség (1-100)
  },
  maxWidth: 1920,  // Maximális szélesség
  maxHeight: 1080, // Maximális magasság
  preserveOriginal: true, // Eredeti fájlok megőrzése
  formats: ['webp', 'jpeg'] // Létrehozandó formátumok
};

// Statisztika
let stats = {
  processed: 0,
  errors: 0,
  originalSize: 0,
  optimizedSize: 0,
  files: []
};

// Rekurzív fájlkeresés
function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Kép optimalizálás
async function optimizeImage(inputPath) {
  try {
    const relativePath = path.relative(CONFIG.imageDir, inputPath);
    const outputPath = path.join(CONFIG.outputDir, relativePath);
    const outputDir = path.dirname(outputPath);

    // Output mappa létrehozása
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);
    const originalSize = fs.statSync(inputPath).size;

    console.log(`\n🔄 Feldolgozás: ${relativePath}`);
    console.log(`   Eredeti méret: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    let totalOptimizedSize = 0;
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Átméretezés, ha túl nagy
    let resizeOptions = null;
    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      resizeOptions = {
        width: CONFIG.maxWidth,
        height: CONFIG.maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      };
      console.log(`   ⚠️  Átméretezés: ${metadata.width}x${metadata.height} → max ${CONFIG.maxWidth}x${CONFIG.maxHeight}`);
    }

    // WebP létrehozása
    if (CONFIG.formats.includes('webp')) {
      const webpPath = path.join(outputDir, `${basename}.webp`);

      let pipeline = sharp(inputPath);
      if (resizeOptions) pipeline = pipeline.resize(resizeOptions);

      await pipeline
        .webp({ quality: CONFIG.quality.webp })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      totalOptimizedSize += webpSize;
      console.log(`   ✅ WebP: ${(webpSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // Optimalizált JPG/PNG létrehozása
    if (CONFIG.formats.includes('jpeg') || CONFIG.formats.includes('png')) {
      const optimizedPath = path.join(outputDir, path.basename(inputPath));

      let pipeline = sharp(inputPath);
      if (resizeOptions) pipeline = pipeline.resize(resizeOptions);

      if (ext === '.png' || ext === '.PNG') {
        await pipeline
          .png({ quality: CONFIG.quality.png, compressionLevel: 9 })
          .toFile(optimizedPath);
      } else {
        await pipeline
          .jpeg({ quality: CONFIG.quality.jpeg, progressive: true })
          .toFile(optimizedPath);
      }

      const optimizedSize = fs.statSync(optimizedPath).size;
      totalOptimizedSize += optimizedSize;
      console.log(`   ✅ Optimalizált ${ext.toUpperCase()}: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    }

    // Megtakarítás számítása
    const savings = ((1 - (totalOptimizedSize / originalSize)) * 100);
    console.log(`   💾 Megtakarítás: ${savings.toFixed(1)}%`);

    stats.processed++;
    stats.originalSize += originalSize;
    stats.optimizedSize += totalOptimizedSize;
    stats.files.push({
      path: relativePath,
      originalSize,
      optimizedSize: totalOptimizedSize,
      savings
    });

  } catch (error) {
    console.error(`   ❌ Hiba: ${error.message}`);
    stats.errors++;
  }
}

// Fő futási logika
async function main() {
  console.log('🚀 Képoptimalizálás indítása...\n');
  console.log('📁 Forrás mappa:', CONFIG.imageDir);
  console.log('📁 Cél mappa:', CONFIG.outputDir);
  console.log('⚙️  Beállítások:');
  console.log(`   - JPG minőség: ${CONFIG.quality.jpeg}%`);
  console.log(`   - WebP minőség: ${CONFIG.quality.webp}%`);
  console.log(`   - Max méret: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
  console.log(`   - Formátumok: ${CONFIG.formats.join(', ')}`);

  // Output mappa létrehozása
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Képek keresése
  const imageFiles = getAllImageFiles(CONFIG.imageDir);
  console.log(`\n📊 Talált képek: ${imageFiles.length} db\n`);
  console.log('═'.repeat(60));

  // Feldolgozás
  for (const file of imageFiles) {
    await optimizeImage(file);
  }

  // Végső statisztika
  console.log('\n' + '═'.repeat(60));
  console.log('\n📈 ÖSSZESÍTÉS:\n');
  console.log(`✅ Feldolgozott képek: ${stats.processed}`);
  console.log(`❌ Hibák: ${stats.errors}`);
  console.log(`📦 Eredeti méret: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 Optimalizált méret: ${(stats.optimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Összes megtakarítás: ${((1 - (stats.optimizedSize / stats.originalSize)) * 100).toFixed(1)}% (${((stats.originalSize - stats.optimizedSize) / 1024 / 1024).toFixed(2)} MB)`);

  // Top 10 legnagyobb megtakarítás
  const topSavings = stats.files
    .sort((a, b) => (b.originalSize - b.optimizedSize) - (a.originalSize - a.optimizedSize))
    .slice(0, 10);

  console.log('\n🏆 TOP 10 LEGNAGYOBB MÉRETCSÖKKENTÉS:\n');
  topSavings.forEach((file, index) => {
    const savedMB = (file.originalSize - file.optimizedSize) / 1024 / 1024;
    console.log(`${index + 1}. ${file.path}`);
    console.log(`   ${(file.originalSize / 1024 / 1024).toFixed(2)} MB → ${(file.optimizedSize / 1024 / 1024).toFixed(2)} MB (${file.savings.toFixed(1)}% csökkenés, -${savedMB.toFixed(2)} MB)`);
  });

  console.log('\n✨ Optimalizálás befejezve!\n');
  console.log('📝 Következő lépés: Frissítsd a HTML fájlokat, hogy az assets/img-optimized mappát használják.');
  console.log('💡 WebP támogatáshoz használj <picture> elemet JPG fallback-kel.\n');
}

// Script futtatása
main().catch(console.error);
