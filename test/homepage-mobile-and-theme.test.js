import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, THEME_ALIASES } from '../src/utils/themeUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export async function runHomepageMobileAndThemeTests() {
  console.log('🔵 RUNNING SUITE: Homepage Mobile Fixes & Public Theme Selector');
  let passedCount = 0;
  const tests = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  // 1. Fix 1: Hero CTAs hidden on mobile
  test('Home.jsx wraps hero CTAs in d-none d-lg-flex', () => {
    const homeJsx = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Home.jsx'), 'utf8');
    assert(
      homeJsx.includes('d-none d-lg-flex flex-wrap gap-3 cl-hero-cta-group'),
      'Hero CTA container must use d-none d-lg-flex to hide on mobile'
    );
    assert(homeJsx.includes('btn-explore'), 'Hero CTA must preserve Explore Courses button');
    assert(homeJsx.includes('Code Arena') || homeJsx.includes('Problem Arena'), 'Hero CTA must preserve Code Arena button');
  });

  // 2. Fix 2: Reduce mobile gap below radar
  test('HomeElevated.css and index.css reduce mobile radar spacing to 24px', () => {
    const homeCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'HomeElevated.css'), 'utf8');
    const indexCss = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf8');

    assert(homeCss.includes('.cl-mobile-radar-card'), 'HomeElevated.css must target mobile radar card');
    assert(homeCss.includes('padding-bottom: 24px !important'), 'Hero section must have 24px padding-bottom on mobile');
    assert(homeCss.includes('padding-top: 24px !important'), 'Courses section must have 24px padding-top on mobile');
    assert(indexCss.includes('padding: 24px 0 24px !important'), 'index.css hero-section must be 24px padding on mobile');
  });

  // 3. Fix 3: Center tagline on mobile
  test('Home.jsx and HomeElevated.css center Learn Build Grow on mobile', () => {
    const homeJsx = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Home.jsx'), 'utf8');
    const homeCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'HomeElevated.css'), 'utf8');

    assert(homeJsx.includes('learn-build-grow'), 'Home.jsx h1 must have learn-build-grow class');
    assert(homeCss.includes('.learn-build-grow'), 'HomeElevated.css must style learn-build-grow');
    assert(homeCss.includes('text-align: center !important'), 'Tagline must be center aligned on mobile');
  });

  // 4. Fix 4: Public Theme Selector component
  test('PublicThemeSelector.jsx defines 10 light and 3 dark themes', () => {
    const selectorJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'PublicThemeSelector.jsx'), 'utf8');
    const expectedLight = [
      'forest-green', 'emerald', 'ocean-blue', 'royal-indigo', 'sunset-orange',
      'rose-pink', 'amethyst-purple', 'teal-wave', 'crimson-red', 'graphite-grey'
    ];
    const expectedDark = ['midnight-emerald', 'nebula-night', 'carbon-black'];

    expectedLight.forEach(id => {
      assert(selectorJsx.includes(`'${id}'`), `Selector must include light theme ${id}`);
    });
    expectedDark.forEach(id => {
      assert(selectorJsx.includes(`'${id}'`), `Selector must include dark theme ${id}`);
    });
  });

  // 5. Fix 4: Theme ID compatibility with themeUtils
  test('All PublicThemeSelector IDs map to recognized canonical themes or aliases', () => {
    const selectorJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'PublicThemeSelector.jsx'), 'utf8');
    const allIds = [
      'forest-green', 'emerald', 'ocean-blue', 'royal-indigo', 'sunset-orange',
      'rose-pink', 'amethyst-purple', 'teal-wave', 'crimson-red', 'graphite-grey',
      'midnight-emerald', 'nebula-night', 'carbon-black'
    ];

    allIds.forEach(id => {
      const isCanonical = THEMES.some(t => t.id === id);
      const isAlias = Boolean(THEME_ALIASES[id]);
      assert(isCanonical || isAlias, `Theme ID ${id} must be recognized as canonical or an alias`);
    });
  });

  // 6. Fix 4: PublicThemeSelector.css styling and mobile bottom sheet
  test('PublicThemeSelector.css includes mobile bottom-sheet and min-height 44px tap target', () => {
    const selectorCss = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'PublicThemeSelector.css'), 'utf8');
    assert(selectorCss.includes('@media (max-width: 575px)') || selectorCss.includes('@media (max-width: 991px)'), 'Must include mobile media query for bottom sheet');
    assert(selectorCss.includes('border-radius: 16px 16px 0 0') || selectorCss.includes('border-radius: 20px 20px 0 0'), 'Bottom sheet must have rounded top corners');
    assert(selectorCss.includes('min-height: 44px'), 'Trigger must have >= 44px tap target on mobile');
    assert(selectorCss.includes('min-height: 48px'), 'Options must have >= 44px tap target on mobile');
    assert(selectorCss.includes('pointer-events: auto'), 'Backdrop must capture pointer events to close');
  });

  // 7. Fix 4: Navbar gating
  test('Navbar.jsx gates PublicThemeSelector strictly to unauthenticated public pages', () => {
    const navJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'Navbar.jsx'), 'utf8');
    assert(navJsx.includes('import PublicThemeSelector'), 'Navbar must import PublicThemeSelector');
    assert(navJsx.includes('!isLoggedIn && isPublicPage'), 'Must conditionally render only when not logged in on public pages');
    assert(navJsx.includes("['/', '/courses', '/problems']"), 'Public pages must be restricted to home, courses, problems');
  });

  // 8. Problem Solving Arena centered on mobile
  test('Problem Solving Arena headline, stats, and CTA are centered on mobile', () => {
    const homeElevatedCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'HomeElevated.css'), 'utf8');
    const homeJsx = fs.readFileSync(path.join(rootDir, 'src', 'pages', 'Home.jsx'), 'utf8');

    assert(homeElevatedCss.includes('.cl-arena-spotlight-section .col-lg-6:first-child'), 'HomeElevated.css must target arena column');
    assert(homeElevatedCss.includes('justify-content: center !important'), 'Stats row must be centered on mobile');
    assert(homeJsx.includes('text-center text-lg-start'), 'Home.jsx must include text-center on arena header');
    assert(homeJsx.includes('align-self-center align-self-lg-start'), 'Arena CTA must have align-self-center on mobile');
  });

  // 9. Navbar FaCode import integrity
  test('Navbar.jsx imports FaCode for Code Arena navigation item', () => {
    const navJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'Navbar.jsx'), 'utf8');
    assert(navJsx.includes('FaCode'), 'Navbar.jsx must import FaCode');
    assert(/import\s*\{[^}]*FaCode[^}]*\}\s*from\s*['"]react-icons\/fa['"]/.test(navJsx), 'FaCode must be explicitly imported from react-icons/fa');
  });

  // 10. RadarRings center nucleus logo uniformity
  test('RadarRings.jsx renders uniform CodeLift text in center nucleus', () => {
    const radarJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'RadarRings.jsx'), 'utf8');
    assert(radarJsx.includes('<span className="rr-nucleus-logo">CodeLift</span>'), 'Radar nucleus logo must be uniform CodeLift without split colored Li');
    assert(!radarJsx.includes('<span className="rr-nucleus-logo">\n            <span>Code</span>'), 'Radar nucleus must not contain split spans for Code/Li/ft');
  });

  // 11. Favicon links and circular asset presence
  test('index.html references root favicon and public icons exist', () => {
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    assert(indexHtml.includes('brand.png') || indexHtml.includes('favicon.png'), 'index.html must reference brand.png or favicon.png');
    assert(fs.existsSync(path.join(rootDir, 'public', 'favicon.ico')), 'public/favicon.ico must exist');
    assert(fs.existsSync(path.join(rootDir, 'public', 'brand.png')) || fs.existsSync(path.join(rootDir, 'public', 'favicon.png')), 'public brand/favicon icon must exist');
  });

  // 12. Brand logo synchronization and cache-busting integrity
  test('public logos match root assets and navbars include cache busters', () => {
    const pubJpg = path.join(rootDir, 'public', 'logo.jpg');
    const pubPng = path.join(rootDir, 'public', 'logo.png');
    assert(fs.existsSync(pubJpg), 'public/logo.jpg must exist');
    assert(fs.existsSync(pubPng), 'public/logo.png must exist');
    if (fs.existsSync(path.join(rootDir, 'logo.jpg'))) {
      assert.strictEqual(fs.statSync(pubJpg).size, fs.statSync(path.join(rootDir, 'logo.jpg')).size, 'public/logo.jpg must match root logo.jpg');
    }
    if (fs.existsSync(path.join(rootDir, 'logo.png'))) {
      assert.strictEqual(fs.statSync(pubPng).size, fs.statSync(path.join(rootDir, 'logo.png')).size, 'public/logo.png must match root logo.png');
    }
    const navJsx = fs.readFileSync(path.join(rootDir, 'src', 'components', 'common', 'Navbar.jsx'), 'utf8');
    assert(navJsx.includes('logo.jpg?v='), 'Navbar.jsx must include cache buster on logo.jpg');
  });

  for (const { name, fn } of tests) {
    try {
      fn();
      passedCount++;
      console.log(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      throw err;
    }
  }

  console.log(`✨ All ${passedCount}/${tests.length} Homepage Mobile & Theme tests PASSED!`);
  return { passedCount, totalCount: tests.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runHomepageMobileAndThemeTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
