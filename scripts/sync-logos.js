import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

export function syncLogos() {
  const rootJpg = path.join(rootDir, 'logo.jpg');
  const rootPng = path.join(rootDir, 'logo.png');
  const pubJpg = path.join(publicDir, 'logo.jpg');
  const pubPng = path.join(publicDir, 'logo.png');

  let updated = false;

  const rootBrand = path.join(rootDir, 'brand.png');
  const pubBrand = path.join(publicDir, 'brand.png');

  if (fs.existsSync(rootBrand)) {
    const rootStat = fs.statSync(rootBrand);
    const pubStat = fs.existsSync(pubBrand) ? fs.statSync(pubBrand) : null;
    if (!pubStat || rootStat.size !== pubStat.size || rootStat.mtimeMs > pubStat.mtimeMs) {
      fs.copyFileSync(rootBrand, pubBrand);
      console.log('  ✓ Synchronized root brand.png -> public/brand.png');
      updated = true;
    }
  }

  if (fs.existsSync(rootJpg)) {
    const rootStat = fs.statSync(rootJpg);
    const pubStat = fs.existsSync(pubJpg) ? fs.statSync(pubJpg) : null;
    if (!pubStat || rootStat.size !== pubStat.size || rootStat.mtimeMs > pubStat.mtimeMs) {
      fs.copyFileSync(rootJpg, pubJpg);
      console.log('  ✓ Synchronized root logo.jpg -> public/logo.jpg');
      updated = true;
    }
  }

  if (fs.existsSync(rootPng)) {
    const rootStat = fs.statSync(rootPng);
    const pubStat = fs.existsSync(pubPng) ? fs.statSync(pubPng) : null;
    if (!pubStat || rootStat.size !== pubStat.size || rootStat.mtimeMs > pubStat.mtimeMs) {
      fs.copyFileSync(rootPng, pubPng);
      console.log('  ✓ Synchronized root logo.png -> public/logo.png');
      updated = true;
    }
  }

  // Regenerate circular favicon from the newest logo
  try {
    const pyScriptPath = path.join(__dirname, 'generate-favicon.py');
    execSync(`python "${pyScriptPath}"`, { cwd: rootDir, stdio: 'inherit' });
  } catch (err) {
    console.warn('  ⚠️ Note on favicon generation:', err.message);
  }

  return updated;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncLogos();
}
