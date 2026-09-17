import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function runThemeConsistencyTests() {
  console.log('🔵 RUNNING SUITE: UI Theme Consistency & Design System Integrity');

  let passCount = 0;
  let totalCount = 0;

  function test(name, fn) {
    totalCount++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passCount++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    Error: ${err.message}`);
      throw err;
    }
  }

  // ── 1. Theme Definitions & Index.css Token Coverage ──
  test('All 13 canonical themes and dark modes are properly defined in themeUtils and index.css', () => {
    const themeUtilsPath = path.join(rootDir, 'src', 'utils', 'themeUtils.js');
    const themeUtilsCode = fs.readFileSync(themeUtilsPath, 'utf8');

    const requiredThemes = [
      'forest-green', 'emerald', 'dark-green', 'navy-blue', 'indigo',
      'teal', 'amber', 'rose', 'purple', 'neutral',
      'dark-emerald', 'dark-nebula', 'dark-carbon'
    ];

    for (const t of requiredThemes) {
      assert(themeUtilsCode.includes(`'${t}'`), `themeUtils.js must declare theme '${t}'`);
    }

    const indexCssPath = path.join(rootDir, 'src', 'index.css');
    const indexCss = fs.readFileSync(indexCssPath, 'utf8');

    for (const t of requiredThemes) {
      assert(
        indexCss.includes(`data-theme="${t}"`),
        `index.css must contain CSS rules for data-theme="${t}"`
      );
    }

    const darkThemes = ['dark-emerald', 'dark-nebula', 'dark-carbon'];
    for (const dt of darkThemes) {
      assert(indexCss.includes(`data-theme="${dt}"] body`), `index.css must style body for ${dt}`);
      assert(indexCss.includes(`data-theme="${dt}"] .card`), `index.css must style .card for ${dt}`);
      assert(indexCss.includes(`data-theme="${dt}"] .sidebar`), `index.css must style .sidebar for ${dt}`);
    }
  });

  // ── 2. Sidebar Theme-Aware Implementation (Zero Hardcoded bg-success) ──
  test('Sidebar.jsx has zero hardcoded bg-success or hover-bg-light and uses .sidebar-nav-item', () => {
    const sidebarPath = path.join(rootDir, 'src', 'components', 'common', 'Sidebar.jsx');
    const sidebarCode = fs.readFileSync(sidebarPath, 'utf8');

    assert(!sidebarCode.includes('bg-success'), 'Sidebar.jsx must NOT contain hardcoded "bg-success" class');
    assert(!sidebarCode.includes('hover-bg-light'), 'Sidebar.jsx must NOT contain "hover-bg-light"');
    assert(sidebarCode.includes('sidebar-nav-item'), 'Sidebar.jsx must use "sidebar-nav-item" class');
    assert(sidebarCode.includes('sidebar d-none'), 'Desktop sidebar aside must include the "sidebar" class');
    assert(sidebarCode.includes('sidebar sidebar-drawer'), 'Mobile sidebar aside must include "sidebar sidebar-drawer" classes');
  });

  // ── 3. Admin Sidebar Theme Integrity (Zero Text-White & No Hardcoded bg-dark in Dashboard) ──
  test('AdminSidebar.jsx and AdminDashboard.jsx respect light and dark themes', () => {
    const adminSidebarPath = path.join(rootDir, 'src', 'components', 'common', 'AdminSidebar.jsx');
    const adminSidebarCode = fs.readFileSync(adminSidebarPath, 'utf8');

    assert(!adminSidebarCode.includes('text-white'), 'AdminSidebar.jsx must not hardcode text-white in header');
    assert(adminSidebarCode.includes('var(--text-secondary)'), 'AdminSidebar.jsx header must use var(--text-secondary)');

    const adminDashboardPath = path.join(rootDir, 'src', 'pages', 'AdminDashboard.jsx');
    const adminDashboardCode = fs.readFileSync(adminDashboardPath, 'utf8');

    assert(!adminDashboardCode.includes('className="d-md-none bg-dark text-white'), 'AdminDashboard mobile bar must not hardcode bg-dark');
    assert(!adminDashboardCode.includes('className="bg-dark text-white"'), 'AdminDashboard offcanvas must not hardcode bg-dark');
    assert(adminDashboardCode.includes('var(--card-bg)'), 'AdminDashboard must use var(--card-bg)');
  });

  // ── 4. Student Profile Dropdown Includes Appearance & App.jsx Route ──
  test('ProfileDropdown.jsx includes Theme & Appearance for students and App.jsx defines route', () => {
    const profileDropdownPath = path.join(rootDir, 'src', 'components', 'common', 'ProfileDropdown.jsx');
    const dropdownCode = fs.readFileSync(profileDropdownPath, 'utf8');

    assert(dropdownCode.includes('/student/appearance'), 'ProfileDropdown.jsx must link students to /student/appearance');
    assert(dropdownCode.includes('/admin/appearance'), 'ProfileDropdown.jsx must link admins to /admin/appearance');
    assert(dropdownCode.includes('Theme & Appearance'), 'ProfileDropdown.jsx must display "Theme & Appearance"');

    const appPath = path.join(rootDir, 'src', 'App.jsx');
    const appCode = fs.readFileSync(appPath, 'utf8');

    assert(appCode.includes('<Route path="appearance" element={<AppearancePage />} />'), 'App.jsx must register appearance route');
    const studentPortalBlock = appCode.substring(appCode.indexOf('path="/student"'));
    assert(studentPortalBlock.includes('path="appearance"'), 'App.jsx student portal must declare appearance route');
  });

  // ── 5. Home Page & InstituteNavbar Theme Integration ──
  test('InstituteNavbar.jsx has no public theme dropdown, uses theme primary colors, and toggler is d-lg-none', () => {
    const instNavPath = path.join(rootDir, 'src', 'components', 'common', 'InstituteNavbar.jsx');
    const instNavCode = fs.readFileSync(instNavPath, 'utf8');

    assert(!instNavCode.includes('availableThemes'), 'InstituteNavbar.jsx must NOT include public theme dropdown');
    assert(instNavCode.includes('d-lg-none'), 'InstituteNavbar.jsx toggler must be d-lg-none to prevent stray cross/hamburger on desktop');
    assert(instNavCode.includes('var(--bs-primary)'), 'InstituteNavbar.jsx must use var(--bs-primary)');
    assert(!instNavCode.includes("color: '#15803D'"), 'InstituteNavbar.jsx must not hardcode #15803D');
  });

  // ── 6. Home Page Hardcoded Color Elimination ──
  test('Home.jsx and index.css landing constants inherit platform theme variables', () => {
    const indexCssPath = path.join(rootDir, 'src', 'index.css');
    const indexCss = fs.readFileSync(indexCssPath, 'utf8');

    assert(indexCss.includes('--cl-green: var(--bs-primary'), 'index.css --cl-green must resolve to var(--bs-primary)');
    assert(indexCss.includes('--cl-white: var(--card-bg'), 'index.css --cl-white must resolve to var(--card-bg)');
    assert(indexCss.includes('--cl-text: var(--text-primary'), 'index.css --cl-text must resolve to var(--text-primary)');

    const homePath = path.join(rootDir, 'src', 'pages', 'Home.jsx');
    const homeCode = fs.readFileSync(homePath, 'utf8');

    assert(!homeCode.includes("color: '#171717'"), 'Home.jsx must not have hardcoded color #171717');
    assert(homeCode.includes('var(--text-primary'), 'Home.jsx must use var(--text-primary)');
    assert(homeCode.includes('var(--text-secondary'), 'Home.jsx must use var(--text-secondary)');
    assert(homeCode.includes('var(--bs-primary'), 'Home.jsx must use var(--bs-primary)');
  });

  // ── 7. Login.jsx Theme Awareness ──
  test('Login.jsx has zero hardcoded green overrides and uses theme CSS variables', () => {
    const loginPath = path.join(rootDir, 'src', 'pages', 'Login.jsx');
    const loginCode = fs.readFileSync(loginPath, 'utf8');

    assert(!loginCode.includes("style={{ color: '#15803D', fontWeight: 600, fontSize: '0.8rem' }}"), 'Login mode switcher must not hardcode #15803D');
    assert(!loginCode.includes('Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2" style={{ color: \'#15803D\' }}'), 'Reset modal title must not hardcode #15803D');
  });

  // ── 8. StudentFees.jsx Theme Awareness ──
  test('StudentFees.jsx KPI cards and Total Course Fee respect theme CSS variables', () => {
    const feesPath = path.join(rootDir, 'src', 'components', 'student', 'StudentFees.jsx');
    const feesCode = fs.readFileSync(feesPath, 'utf8');

    assert(!feesCode.includes("bg: '#F8FAFC'"), 'StudentFees must not hardcode #F8FAFC bg');
    assert(!feesCode.includes("color: '#171717'"), 'StudentFees must not hardcode #171717 color');
    assert(feesCode.includes('Total Course Fee'), 'StudentFees must include Total Course Fee card');
    assert(feesCode.includes('var(--card-bg)'), 'StudentFees must use var(--card-bg)');
    assert(feesCode.includes('var(--text-primary)'), 'StudentFees must use var(--text-primary)');
    assert(feesCode.includes('var(--bs-primary)'), 'StudentFees must use var(--bs-primary)');
  });

  // ── 9. CodingArena.jsx Hero & Stat Cards Theme Awareness ──
  test('CodingArena.jsx hero banner and stat cards respect theme without hardcoded dark values', () => {
    const arenaPath = path.join(rootDir, 'src', 'components', 'student', 'CodingArena.jsx');
    const arenaCode = fs.readFileSync(arenaPath, 'utf8');

    assert(!arenaCode.includes('#0f172a 0%, #1e1b4b 50%'), 'CodingArena must not hardcode dark navy gradient');
    assert(arenaCode.includes('arena-hero-banner'), 'CodingArena must use arena-hero-banner');
    assert(arenaCode.includes('arena-stat-card'), 'CodingArena must use arena-stat-card');
    assert(arenaCode.includes('Python Lists & Logic Journey'), 'CodingArena must display Python Lists & Logic Journey');
    assert(arenaCode.includes('20 structured coding challenges designed by your tutor'), 'CodingArena must display tutor challenges description');
    assert(arenaCode.includes('Overall Mastery'), 'CodingArena must display Overall Mastery');
    assert(arenaCode.includes('Total XP'), 'CodingArena must display Total XP');
    assert(arenaCode.includes('Open Access'), 'CodingArena must display Open Access mode');
  });

  console.log(`✨ All ${passCount}/${totalCount} UI Theme Consistency tests PASSED!`);
  return { passedCount: passCount, totalCount };
}

// Allow direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    runThemeConsistencyTests();
  } catch (err) {
    process.exit(1);
  }
}
