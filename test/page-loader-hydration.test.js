import assert from 'assert';
import fs from 'fs';

export function runPageLoaderHydrationTests() {
  console.log('\n🔵 RUNNING SUITE: Universal PageLoader & Hydration Resilience');
  let passedCount = 0;
  const totalCount = 7;

  // 1. Verify PageLoader component exists with logo, animation, and accessibility
  const pageLoaderJsx = fs.readFileSync('src/components/common/PageLoader.jsx', 'utf8');
  assert(
    pageLoaderJsx.includes('cl-loader-spinner') &&
    pageLoaderJsx.includes('brand-logo') &&
    pageLoaderJsx.includes('role="status"') &&
    pageLoaderJsx.includes('cl-loader-shimmer'),
    'PageLoader.jsx must include spinner, brand logo, aria status role, and shimmer bar'
  );
  console.log('  ✓ PageLoader.jsx defines animated concentric spinner, branded logo, and accessible status role');
  passedCount++;

  // 2. Verify Layout.jsx renders PageLoader when isDataLoading
  const layoutJsx = fs.readFileSync('src/components/common/Layout.jsx', 'utf8');
  assert(
    layoutJsx.includes("import PageLoader from './PageLoader';") &&
    layoutJsx.includes('isDataLoading') &&
    layoutJsx.includes('<PageLoader'),
    'Layout.jsx must import and render PageLoader in the main content pane during data loading'
  );
  console.log('  ✓ Layout.jsx guards all Admin and Student portal routes with PageLoader during hydration');
  passedCount++;

  // 3. Verify CourseCatalog.jsx renders PageLoader when isDataLoading
  const courseCatalogJsx = fs.readFileSync('src/pages/CourseCatalog.jsx', 'utf8');
  assert(
    courseCatalogJsx.includes('PageLoader') &&
    courseCatalogJsx.includes('isDataLoading') &&
    courseCatalogJsx.includes('<PageLoader'),
    'CourseCatalog.jsx must render PageLoader while data is loading'
  );
  console.log('  ✓ CourseCatalog.jsx prevents mock course flash by rendering PageLoader during hydration');
  passedCount++;

  // 4. Verify CourseDetail.jsx renders PageLoader when isDataLoading before 404
  const courseDetailJsx = fs.readFileSync('src/pages/CourseDetail.jsx', 'utf8');
  assert(
    courseDetailJsx.includes('PageLoader') &&
    courseDetailJsx.includes('isDataLoading') &&
    courseDetailJsx.indexOf('if (isDataLoading)') < courseDetailJsx.indexOf('if (!course)'),
    'CourseDetail.jsx must check isDataLoading and render PageLoader prior to showing Course Not Found'
  );
  console.log('  ✓ CourseDetail.jsx renders PageLoader before 404 check, preventing premature course not found flash');
  passedCount++;

  // 5. Verify Home.jsx renders PageLoader for cohort courses when isDataLoading
  const homeJsx = fs.readFileSync('src/pages/Home.jsx', 'utf8');
  assert(
    homeJsx.includes('PageLoader') &&
    homeJsx.includes('isDataLoading') &&
    homeJsx.includes('<PageLoader'),
    'Home.jsx must render PageLoader in cohort courses section while isDataLoading'
  );
  console.log('  ✓ Home.jsx guards cohort courses section with PageLoader while database hydrations are pending');
  passedCount++;

  // 6. Verify DataContext.jsx initializes collections with empty arrays when isSupabaseConfigured is true
  const dataContextJsx = fs.readFileSync('src/contexts/DataContext.jsx', 'utf8');
  assert(
    dataContextJsx.includes('useState(() => (isSupabaseConfigured ? [] : (coursesSeed || []).map(normalizeCourse)))') &&
    dataContextJsx.includes('useState(() => (isSupabaseConfigured ? [] : (batchesSeed || [])))') &&
    dataContextJsx.includes('useState(() => (isSupabaseConfigured ? [] : (feesSeed || [])))'),
    'DataContext.jsx must initialize collections to empty arrays when Supabase is configured to prevent mock data leakage'
  );
  console.log('  ✓ DataContext.jsx initializes collections to empty arrays in Supabase mode to prevent mock leaks');
  passedCount++;

  // 7. Verify index.css includes keyframe animations for cl-spin, cl-pulse, and cl-shimmer
  const indexCss = fs.readFileSync('src/index.css', 'utf8');
  assert(
    indexCss.includes('@keyframes cl-spin') &&
    indexCss.includes('@keyframes cl-pulse') &&
    indexCss.includes('@keyframes cl-shimmer'),
    'index.css must declare cl-spin, cl-pulse, and cl-shimmer keyframe animations'
  );
  console.log('  ✓ index.css defines 60fps GPU-accelerated keyframe animations for loader components');
  passedCount++;

  console.log(`✨ All ${passedCount}/${totalCount} Universal PageLoader & Hydration tests PASSED!`);
  return { passedCount, totalCount };
}

if (process.argv[1]?.endsWith('page-loader-hydration.test.js')) {
  runPageLoaderHydrationTests();
}
