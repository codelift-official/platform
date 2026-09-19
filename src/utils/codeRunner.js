/**
 * codeRunner.js — Real Code Execution Engine for CodeLift Problem Arena
 *
 * Strategy:
 *  - Python problems  → Pyodide (CPython compiled to WebAssembly)
 *  - SQL problems     → custom SQL-pattern evaluator
 *  - Other categories → structural heuristic (labelled as "Conceptual Check")
 *
 * Pyodide is loaded lazily and cached — first load is ~10–12 MB (browser caches after).
 */

// ─── Pyodide Singleton ─────────────────────────────────────────────────────

let pyodideInstance = null;
let pyodideLoadPromise = null;

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadPromise) return pyodideLoadPromise;

  pyodideLoadPromise = (async () => {
    // Dynamically load Pyodide from CDN
    if (!window.loadPyodide) {
      await loadScript('https://cdn.jsdelivr.net/pyodide/v0.27.6/full/pyodide.js');
    }
    const py = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.6/full/',
      stdout: () => {},  // suppress stdout
      stderr: () => {},
    });
    pyodideInstance = py;
    return py;
  })();

  return pyodideLoadPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── Python Category Detection ──────────────────────────────────────────────

function isPythonCategory(category) {
  // All CodeLift arena problems are pure Python (including 'Data Structures' and 'Algorithms')
  const pyCategories = ['Python', 'Data Structures', 'Algorithms'];
  return pyCategories.includes(category) || true;
}

function isSQLCategory(category) {
  return category === 'SQL';
}

// ─── Main Entry Point ──────────────────────────────────────────────────────

/**
 * Run student code against all test cases.
 * Returns: Promise<{ results: TestResult[], executionMode: string, pyodideReady: boolean }>
 *
 * TestResult: { input, expected, actual, passed, errorMsg? }
 */
export async function runCode(code, testCases, category) {
  return runPython(code, testCases);
}

// ─── Python Runner via Pyodide ─────────────────────────────────────────────

async function runPython(code, testCases) {
  let py;
  let pyodideReady = true;

  try {
    py = await getPyodide();
  } catch (err) {
    // Pyodide failed to load — fall back to heuristic with warning
    pyodideReady = false;
    const results = testCases.map((tc) => ({
      input: tc.input,
      expected: tc.expected,
      actual: 'Pyodide unavailable',
      passed: false,
      errorMsg: 'Could not load Python runtime. Check internet connection.',
    }));
    return { results, executionMode: 'error', pyodideReady: false };
  }

  const results = [];

  for (const tc of testCases) {
    try {
      // Safe execution wrapper:
      // 1. Defines student functions
      // 2. Calls the test expression
      // 3. Returns both repr and stdout capture
      const indentedCode = code
        .split('\n')
        .map((line) => (line.trim().length > 0 ? '    ' + line : ''))
        .join('\n');

      const runScript = `
import sys, io, traceback as _tb

# Capture stdout (prints won't pollute the result)
_buf = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _buf

try:
    # ── Student Code ──
${indentedCode}

    # ── Test Invocation ──
    _result = ${tc.input}
    _repr   = repr(_result)
    _stdout_out = _buf.getvalue()
finally:
    sys.stdout = _old_stdout

(_repr, _stdout_out)
`.trim();

      const pyResult = await py.runPythonAsync(runScript);
      // pyResult is a Python tuple; convert to JS array
      const [reprStr, stdoutStr] = pyResult.toJs
        ? pyResult.toJs()
        : [String(pyResult), ''];

      const actual = String(reprStr ?? '');

      // displayActual strips outer repr quotes so user sees the value cleanly
      // e.g. "'Hello, Alice!'" → "Hello, Alice!"  |  "9" → "9"
      const displayActual = stripOuterReprQuotes(actual);

      const expected = normalizeExpected(tc.expected);
      const passed   = normalizeOutput(actual) === normalizeOutput(expected);

      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: displayActual,
        rawActual: actual,
        stdout: stdoutStr || null,
        passed,
      });
    } catch (err) {
      // Python runtime error (syntax error, name error, etc.)
      const errorLine = extractPythonError(err.message || String(err));
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: 'Error',
        passed: false,
        errorMsg: errorLine,
      });
    }
  }

  return { results, executionMode: 'pyodide', pyodideReady: true };
}

// ─── SQL Pattern Evaluator ─────────────────────────────────────────────────

function runSQL(code, testCases) {
  const upperCode = code.trim().toUpperCase();
  const results = testCases.map((tc) => {
    // Check structural patterns for SQL queries
    const expectedKeywords = extractSQLKeywords(tc.expected || '');
    const hasSelect = upperCode.includes('SELECT');
    const hasFrom = upperCode.includes('FROM');
    const hasCorrectTable = expectedKeywords.tables.every((t) =>
      upperCode.includes(t.toUpperCase())
    );
    const hasCorrectColumns = expectedKeywords.columns.every((c) =>
      upperCode.includes(c.toUpperCase()) || upperCode.includes('*')
    );

    const passed = hasSelect && hasFrom && hasCorrectTable && hasCorrectColumns;
    return {
      input: tc.input,
      expected: tc.expected,
      actual: passed ? 'Query matches expected pattern ✓' : 'Query does not match expected structure',
      passed,
    };
  });

  return { results, executionMode: 'sql-pattern', pyodideReady: true };
}

function extractSQLKeywords(expectedStr) {
  const tables = [];
  const columns = [];
  // Very basic: extract words that look like table/column names
  const fromMatch = expectedStr.match(/FROM\s+(\w+)/i);
  if (fromMatch) tables.push(fromMatch[1]);
  const selectMatch = expectedStr.match(/SELECT\s+([\w,\s*]+)\s+FROM/i);
  if (selectMatch) {
    const cols = selectMatch[1].split(',').map((c) => c.trim()).filter(Boolean);
    columns.push(...cols.filter((c) => c !== '*'));
  }
  return { tables, columns };
}

// ─── Heuristic Evaluator (Web Dev / Flask / Other) ─────────────────────────

function runHeuristic(code, testCases, category) {
  const results = testCases.map((tc) => {
    // Check for non-trivial implementation signals
    const hasReturn = /\breturn\b/.test(code);
    const hasFunction = /\bdef\b|\bfunction\b/.test(code);
    const hasOnlyPass = /^\s*def\s+\w+[^:]*:\s*\n\s*pass\s*$/m.test(code);
    const hasOnlyStub = code.trim().split('\n').every((l) =>
      /^\s*(def\s|#|pass|"""|\s*$)/.test(l)
    );

    // DO NOT pass stubs — this was the original bug
    const passed = hasReturn && hasFunction && !hasOnlyPass && !hasOnlyStub;

    return {
      input: tc.input,
      expected: tc.expected,
      actual: passed
        ? 'Implementation structure matches ✓'
        : 'No valid implementation detected',
      passed,
      isConceptualCheck: true,
    };
  });

  return { results, executionMode: `heuristic-${category}`, pyodideReady: true };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Strip outer repr-style quotes for clean display to the user.
 * Used on the "actual" value shown in the UI (not for comparison).
 *
 * "'Hello, Alice!'" → "Hello, Alice!"
 * "9"               → "9"         (no change — no outer quotes)
 * "[1, 2, 3]"       → "[1, 2, 3]" (no change — container)
 */
function stripOuterReprQuotes(s) {
  if (typeof s !== 'string') return String(s);
  const v = s.trim();
  if (
    ((v.startsWith("'") && v.endsWith("'")) ||
     (v.startsWith('"') && v.endsWith('"'))) &&
    v.length >= 2
  ) {
    const inner = v.slice(1, -1);
    // Don't strip if it's a container or looks like it contains nested quotes
    if (!/^[\[{(]/.test(inner) && !inner.includes("\\'") && !inner.includes('\\"')) {
      return inner;
    }
  }
  return v;
}

/**
 * Smart output normalizer — compares semantics, not exact repr formatting.
 *
 * Handles:
 *  - repr outer quotes: `'Hello'` → `Hello` for comparison
 *  - integer floats:    `9.0`    → `9`
 *  - list whitespace:  `[1,2,3]` ≡ `[1, 2, 3]`
 *  - quote style:      `"text"`  ≡ `'text'`
 *  - booleans:         `true`    ≡ `True`
 *  - trailing zeros:   `350.0`   ≡ `350`
 *  - extra spaces:     `  x  `   → `x`
 */
function normalizeOutput(s) {
  if (typeof s !== 'string') return String(s);

  // 1. Trim outer whitespace
  let v = s.trim();

  // 2. Unify quotes: replace all " with ' (Python prefers single quotes)
  v = v.replace(/"/g, "'");

  // 3. Strip outer repr quotes IF this looks like a quoted Python string
  //    e.g. "'Hello, Alice!'" → "Hello, Alice!"
  //    Only strip if the outer quotes wrap the entire value
  if (
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2) ||
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2)
  ) {
    const inner = v.slice(1, -1);
    // Only strip if inner doesn't look like a list/dict/tuple
    if (!/^[\[{(]/.test(inner)) {
      v = inner;
    }
  }

  // 4. Normalize Python boolean / None casing
  v = v.replace(/\btrue\b/gi, 'True')
       .replace(/\bfalse\b/gi, 'False')
       .replace(/\bnone\b/gi, 'None');

  // 5. Normalize floats that are whole numbers: 9.0 → 9, 350.0 → 350
  v = v.replace(/\b(\d+)\.0+\b/g, '$1');

  // 6. Normalize whitespace inside containers and after commas
  //    '[1, 2,3]' → '[1,2,3]' for comparison (we collapse all post-comma spaces)
  v = v.replace(/,\s*/g, ', ');       // normalize comma spacing uniformly
  v = v.replace(/\[\s*/g, '[');       // no space after [
  v = v.replace(/\s*\]/g, ']');       // no space before ]
  v = v.replace(/\{\s*/g, '{');
  v = v.replace(/\s*\}/g, '}');
  v = v.replace(/\(\s*/g, '(');
  v = v.replace(/\s*\)/g, ')');

  // 7. Collapse runs of whitespace (handles multi-space, tabs, newlines)
  v = v.replace(/\s+/g, ' ').trim();

  return v;
}

function normalizeExpected(expected) {
  return expected || '';
}

/**
 * Extract a clean, user-friendly error message from Pyodide's traceback.
 */
function extractPythonError(raw) {
  if (!raw) return 'Unknown error';
  // Find the last "XxxError: message" line
  const match = raw.match(/(\w+Error[:\s][^\n]+)/g);
  if (match && match.length > 0) return match[match.length - 1].trim();
  // Syntax errors
  const syntaxMatch = raw.match(/SyntaxError[^\n]*/);
  if (syntaxMatch) return syntaxMatch[0].trim();
  // Generic fallback — take last non-empty line
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] || 'Runtime error';
}

// ─── Pyodide Warm-up (optional prefetch) ──────────────────────────────────

/**
 * Call this early (e.g. when user navigates to /problems) to start
 * loading Pyodide in the background before they open a problem.
 */
export function warmupPyodide() {
  getPyodide().catch(() => {});
}

export { isPythonCategory, isSQLCategory };
