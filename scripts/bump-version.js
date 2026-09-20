import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.resolve(__dirname, '../src/config/version.js');
const pkgPath = path.resolve(__dirname, '../package.json');

try {
  let currentNum = 1.0;
  let isInitialRelease = false;

  if (fs.existsSync(versionFilePath)) {
    const content = fs.readFileSync(versionFilePath, 'utf8');
    if (content.includes('// INITIAL_RELEASE') || process.env.INITIAL_BUILD) {
      isInitialRelease = true;
    }
    const match = content.match(/PLATFORM_VERSION_NUMBER\s*=\s*([0-9.]+)/);
    if (match && match[1]) {
      currentNum = parseFloat(match[1]);
    }
  }

  // If in CI environment without explicit FORCE_BUMP, preserve committed version
  if (process.env.CI && !process.env.FORCE_BUMP) {
    console.log(`\nℹ️ [CodeLift CI Build] Preserving committed version: CodeLift Platform ${currentNum.toFixed(1)}`);
    process.exit(0);
  }

  let nextNum = currentNum;
  if (isInitialRelease) {
    nextNum = 1.0;
    console.log(`\n🚀 [CodeLift Build] Initializing baseline version: CodeLift Platform 1.0`);
  } else if (process.env.FORCE_BUMP || process.env.BUMP_VERSION) {
    // Increment by 0.1 on explicit bump requests
    nextNum = Math.round((currentNum + 0.1) * 10) / 10;
    console.log(`\n🚀 [CodeLift Build] Bumped version from ${currentNum.toFixed(1)} -> ${nextNum.toFixed(1)}`);
  } else {
    console.log(`\n🚀 [CodeLift Build] Building CodeLift Platform ${nextNum.toFixed(1)}`);
  }

  const nextVersionStr = `CodeLift Platform ${nextNum.toFixed(1)}`;
  const timestamp = new Date().toISOString();

  const newFileContent = `// CodeLift Platform Version Configuration
// Auto-incremented on production releases
export const PLATFORM_VERSION_NAME = "CodeLift Platform";
export const PLATFORM_VERSION_NUMBER = ${nextNum.toFixed(1)};
export const PLATFORM_VERSION = "${nextVersionStr}";
export const BUILD_TIMESTAMP = "${timestamp}";
`;

  fs.writeFileSync(versionFilePath, newFileContent, 'utf8');

  // Also update package.json version string
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.version = `${nextNum.toFixed(1)}.0`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }

  // Automatically sync root logos to public and regenerate favicon
  try {
    const { syncLogos } = await import('./sync-logos.js');
    syncLogos();
  } catch (syncErr) {
    console.warn('[CodeLift Build] Logo sync note:', syncErr.message);
  }
} catch (err) {
  console.error('[CodeLift Build] Warning: Failed to bump version:', err.message);
}
