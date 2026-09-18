// src/services/pythonRunner.js
// Singleton Pyodide loader and multi-paradigm execution engine for CodeLift Python IDE & Judging

let pyodideInstance = null;
let loadPromise = null;

export async function getPyodide(onProgress) {
  if (pyodideInstance) {
    return pyodideInstance;
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise(async (resolve, reject) => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Pyodide can only run in a browser environment.');
      }

      // Check if pyodide script is already present in document
      if (!window.loadPyodide) {
        if (onProgress) onProgress('Fetching Python runtime...');
        await new Promise((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          script.async = true;
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load Pyodide script from CDN. Please check your internet connection.'));
          document.head.appendChild(script);
        });
      }

      if (onProgress) onProgress('Initializing WebAssembly Python engine...');
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });

      if (onProgress) onProgress('Python engine ready!');
      pyodideInstance = pyodide;
      resolve(pyodideInstance);
    } catch (err) {
      loadPromise = null;
      reject(err);
    }
  });

  return loadPromise;
}

/**
 * Execute Python code and capture stdout, stderr and return values.
 * Supports standard input (stdin) and suppresses prompt leakage into stdout.
 * 
 * @param {string} code - Python code to run
 * @param {Object} options - Optional execution settings ({ stdin: string })
 */
export async function executePython(code, options = {}) {
  const pyodide = await getPyodide();
  const startTime = performance.now();

  const rawStdin = options.stdin !== undefined ? String(options.stdin) : '';
  const escapedStdin = JSON.stringify(rawStdin);

  // Indent student code for safe execution block
  const indentedCode = (code || '')
    .split('\n')
    .map(line => (line.trim().length > 0 ? '    ' + line : ''))
    .join('\n');

  // Python execution wrapper with stdin streaming, stdout capture, and input() prompt suppression
  const pythonWrapper = `
import sys, io, builtins

_stdin_data = ${escapedStdin}
_stdout_buf = io.StringIO()
_stderr_buf = io.StringIO()
_stdin_buf  = io.StringIO(_stdin_data)

_orig_stdout = sys.stdout
_orig_stderr = sys.stderr
_orig_stdin  = sys.stdin
_orig_input  = builtins.input

sys.stdout = _stdout_buf
sys.stderr = _stderr_buf
sys.stdin  = _stdin_buf

# Clean input override: reads lines without polluting stdout with prompt string, safe EOF
def _clean_input(prompt=''):
    line = _stdin_buf.readline()
    if line == '':
        return ''
    return line.rstrip('\\r\\n')

builtins.input = _clean_input

_exec_error = None

try:
${indentedCode}
except Exception as _e:
    _exec_error = str(_e)
    import traceback
    traceback.print_exc(file=_stderr_buf)
finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr
    sys.stdin  = _orig_stdin
    builtins.input = _orig_input

_out = _stdout_buf.getvalue()
_err = _stderr_buf.getvalue()
`.trim();

  try {
    await pyodide.runPythonAsync(pythonWrapper);
    const stdout = pyodide.globals.get('_out') || '';
    const stderr = pyodide.globals.get('_err') || '';
    const execError = pyodide.globals.get('_exec_error');
    const executionTime = Math.round(performance.now() - startTime);

    return {
      success: !execError,
      stdout: String(stdout),
      stderr: String(stderr),
      error: execError ? String(execError) : null,
      executionTime
    };
  } catch (err) {
    const executionTime = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: '',
      stderr: err.message || String(err),
      error: err.message || String(err),
      executionTime
    };
  }
}

/**
 * Prepare student code and inputs for judging.
 * Seamlessly handles:
 *  1. stdin inputs for input() problems (e.g. "12\\n18", "madam")
 *  2. Explicit inject strings (e.g. "numbers = [0,0...]", "s = ''")
 *  3. In-line variable assignments in tc.input (e.g. "numbers = [5]")
 *  4. Raw array/literal inputs (e.g. "[45, 78, 12]") mapped to target variable
 *  5. Function calls (e.g. "say_hello('Alice')")
 */
export function prepareCodeForExecution(studentCode, tc, starterCode = '') {
  let stdin = '';
  let inject = tc.inject ? String(tc.inject).trim() : '';
  const inputStr = tc.input !== undefined && tc.input !== null ? String(tc.input).trim() : '';

  // 1. Explicit or implicit injection from tc.input
  if (!inject && /^\s*([a-zA-Z_]\w*)\s*=/m.test(inputStr)) {
    inject = inputStr;
  }

  // 2. Raw array or literal input mapped to first assignment in starterCode or studentCode
  if (!inject && (inputStr.startsWith('[') || inputStr.startsWith('{') || (/^[-0-9]/.test(inputStr) && !inputStr.includes('\n')))) {
    const match = (starterCode || studentCode).match(/^\s*([a-zA-Z_]\w*)\s*=/m);
    if (match && !starterCode.includes('input(')) {
      inject = `${match[1]} = ${inputStr}`;
    }
  }

  // 3. Pipe raw input string to stdin for input() calls
  if (inputStr) {
    stdin = inputStr;
  }

  let codeToRun = studentCode;

  // 4. If variable injection is required, override top-level variable declarations
  if (inject) {
    const varNames = [];
    const lines = inject.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (match && !varNames.includes(match[1])) {
        varNames.push(match[1]);
      }
    }

    for (const v of varNames) {
      const regex = new RegExp('^(\\s*)' + v + '\\s*=[^\\r\\n]*', 'gm');
      codeToRun = codeToRun.replace(regex, `# [Injected: ${v}]`);
    }

    codeToRun = `${inject}\n${codeToRun}`;
  }

  // 5. Function-based test invocation: if tc.input looks like a function call
  if (inputStr && /^[a-zA-Z_]\w*\s*\(/.test(inputStr)) {
    codeToRun += `\n\n# Auto-eval test function\ntry:\n    _res = ${inputStr}\n    if _res is not None:\n        print(repr(_res) if isinstance(_res, str) else _res)\nexcept Exception:\n    pass\n`;
  }

  return { codeToRun, stdin };
}

/**
 * Backward-compatible helper for legacy test suites
 */
export function prepareCodeForInject(studentCode, inject) {
  return prepareCodeForExecution(studentCode, { inject }).codeToRun;
}

/**
 * Normalize output string for comparison:
 * - strip outer leading/trailing whitespace
 * - standardize line breaks to \n
 * - trim every line in multi-line outputs
 * - normalize list formatting e.g. [1, 2, 3] vs [1,2,3]
 * - normalize Python True/False casing
 */
export function normalizeOutput(str) {
  if (typeof str !== 'string') str = String(str ?? '');
  let val = str
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Multi-line trim
  const lines = val
    .split('\n')
    .map(l => l.trim())
    .filter((l, idx, arr) => !(l === '' && (idx === 0 || idx === arr.length - 1)));
  val = lines.join('\n');

  // Normalize list and container spacing: [1, 2, 3] -> [1, 2, 3]
  val = val.replace(/,\s*/g, ', ');
  val = val.replace(/\[\s*/g, '[').replace(/\s*\]/g, ']');
  val = val.replace(/\{\s*/g, '{').replace(/\s*\}/g, '}');
  val = val.replace(/\(\s*/g, '(').replace(/\s*\)/g, ')');

  // Normalize booleans
  val = val.replace(/\btrue\b/gi, 'True').replace(/\bfalse\b/gi, 'False');

  // Strip wrapping single or double quotes for single-line scalar strings if expected doesn't have them
  if (
    lines.length === 1 &&
    ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) &&
    val.length >= 2 &&
    !val.includes('\n')
  ) {
    const inner = val.slice(1, -1);
    if (!/^[\[{(]/.test(inner)) {
      val = inner;
    }
  }

  return val.trim();
}

/**
 * Run judging on visible and hidden test cases with full multi-paradigm support.
 *
 * @param {Object} params
 * @param {string} params.studentCode - Code authored by student
 * @param {Array} params.visibleTestCases - Visible test cases
 * @param {Array} params.hiddenTestCases - Hidden test cases
 * @param {string} params.starterCode - Optional starter template for variable detection
 */
export async function judgeProblem({
  studentCode,
  visibleTestCases = [],
  hiddenTestCases = [],
  starterCode = ''
}) {
  const visibleResults = [];
  let allVisiblePassed = true;

  // Run visible tests
  for (let i = 0; i < visibleTestCases.length; i++) {
    const tc = visibleTestCases[i];
    const { codeToRun, stdin } = prepareCodeForExecution(studentCode, tc, starterCode);
    const res = await executePython(codeToRun, { stdin });

    const actualNorm = normalizeOutput(res.stdout);
    const expectedNorm = normalizeOutput(tc.expected);
    const passed = res.success && actualNorm === expectedNorm;

    if (!passed) allVisiblePassed = false;

    visibleResults.push({
      testIndex: i + 1,
      input: tc.input || 'Default',
      expected: tc.expected,
      actual: res.stdout.trim(),
      passed,
      error: res.error,
      executionTime: res.executionTime
    });
  }

  // Run hidden tests
  const hiddenResults = [];
  let allHiddenPassed = true;

  for (let i = 0; i < hiddenTestCases.length; i++) {
    const tc = hiddenTestCases[i];
    const { codeToRun, stdin } = prepareCodeForExecution(studentCode, tc, starterCode);
    const res = await executePython(codeToRun, { stdin });

    const actualNorm = normalizeOutput(res.stdout);
    const expectedNorm = normalizeOutput(tc.expected);
    const passed = res.success && actualNorm === expectedNorm;

    if (!passed) allHiddenPassed = false;

    hiddenResults.push({
      testIndex: i + 1,
      passed,
      executionTime: res.executionTime
      // Intentionally omit expected and actual to keep hidden test cases secure
    });
  }

  const allPassed = (visibleTestCases.length === 0 || allVisiblePassed) &&
                    (hiddenTestCases.length === 0 || allHiddenPassed);

  return {
    allPassed,
    visibleResults,
    hiddenResults,
    visiblePassedCount: visibleResults.filter(r => r.passed).length,
    visibleTotalCount: visibleResults.length,
    hiddenPassedCount: hiddenResults.filter(r => r.passed).length,
    hiddenTotalCount: hiddenResults.length
  };
}
