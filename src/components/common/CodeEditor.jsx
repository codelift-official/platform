/**
 * CodeEditor.jsx — CodeMirror 6 Powered Smart Code Editor
 *
 * Features:
 *  - Real Python syntax highlighting (keywords, strings, comments, numbers,
 *    decorators, type names) via @codemirror/lang-python
 *  - Inbuilt function detection & coloring (print, len, range, max, ...)
 *  - Standard IDE behaviors: line numbers, bracket matching, Tab/Shift+Tab
 *    indentation, autocompletion, undo/redo history
 *  - Controlled component faithful to React value/onChange semantics
 *  - Copy-to-clipboard toolbar button
 *  - Theme-aware: follows the active app theme — dark palette by default,
 *    light palette when data-theme-mode='light' (handled via CSS overrides)
 */

import React, { useCallback, useEffect, useRef, useState, useImperativeHandle } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { indentUnit, syntaxTree } from '@codemirror/language';
import { Decoration, ViewPlugin, keymap } from '@codemirror/view';

const INDENT_UNIT = '    '; // 4 spaces — matches platform convention

// Python builtin functions that should be colored as inbuilt (call sites only)
const PY_BUILTINS = new Set([
  'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes', 'callable',
  'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod',
  'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset',
  'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
  'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
  'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
  'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice',
  'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars',
  'zip', '__import__'
]);
const BUILTIN_RE = new RegExp(`\\b(${[...PY_BUILTINS].join('|')})\\s*\\(`, 'g');

/** Collect absolute ranges belonging to comments/strings so we skip them. */
function collectMaskedRanges(state) {
  const masked = [];
  const visit = (node) => {
    const t = node.type.name;
    if (t === 'Comment' || t === 'LineComment' || t === 'BlockComment' ||
        t === 'String' || t === 'Quoted' || t === 'Docstring') {
      masked.push([node.from, node.to]);
    }
    for (let c = node.firstChild; c; c = c.nextSibling) visit(c);
  };
  const tree = syntaxTree(state);
  if (tree && tree.topNode) visit(tree.topNode);
  return masked;
}

function isMasked(pos, masked) {
  for (let i = 0; i < masked.length; i++) {
    if (pos >= masked[i][0] && pos < masked[i][1]) return true;
  }
  return false;
}

/** Compute CodeMirror decorations coloring builtin function call names. */
function computeBuiltinDecorations(view) {
  const decorations = [];
  const state = view.state;
  const doc = state.doc;
  const masked = collectMaskedRanges(state);

  for (const { from, to } of view.visibleRanges) {
    const text = doc.sliceString(from, to);
    let m;
    BUILTIN_RE.lastIndex = 0;
    while ((m = BUILTIN_RE.exec(text)) !== null) {
      const absStart = from + m.index;
      const absNameEnd = absStart + m[1].length;
      if (isMasked(absStart, masked)) continue;
      decorations.push(
        Decoration.mark({ class: 'cm-builtin' }).range(absStart, absNameEnd)
      );
    }
  }
  return Decoration.set(decorations, true);
}

// View plugin keeps builtin coloring live as the document or viewport changes
const builtinHighlightPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = computeBuiltinDecorations(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = computeBuiltinDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

// Static shared extensions (attached to each instance)
function buildExtensions(language, onChangeRef, wrap) {
  const extensions = [
    basicSetup,
    keymap.of([indentWithTab]),
    python(),
    indentUnit.of(INDENT_UNIT),
    builtinHighlightPlugin,
  ];
  if (wrap) extensions.push(EditorView.lineWrapping);
  extensions.push(buildErrorUnderlinePlugin());
  if (language === 'python' || !language) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          onChangeRef.current(update.state.doc.toString());
        }
      })
    );
  }
  return extensions;
}

// Detect Python syntax errors synchronously via the Lezer grammar
function detectSyntaxErrors(view) {
  const errors = [];
  const tree = syntaxTree(view.state);
  if (!tree || tree.length === 0) return errors;
  tree.cursor().iterate((node) => {
    if (node.type.isError && node.to > node.from) {
      errors.push({ from: node.from, to: node.to });
    }
  });
  return errors;
}

// Red squiggle under the offending line while the student types
const syntaxErrorDecoration = Decoration.mark({
  class: 'cl-cm-syntax-error',
  attributes: { title: 'Syntax Error' },
});

function buildErrorUnderlinePlugin() {
  return ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = Decoration.none;
        this.recompute(view);
      }

      recompute(view) {
        const errs = detectSyntaxErrors(view);
        if (errs.length === 0) {
          this.decorations = Decoration.none;
          return;
        }
        const lineNumbers = Array.from(
          new Set(errs.map((e) => view.state.doc.lineAt(e.from).number))
        );
        const ranges = lineNumbers.map((lineNo) => {
          const line = view.state.doc.line(lineNo);
          return syntaxErrorDecoration.range(line.from, line.to);
        });
        this.decorations = Decoration.set(ranges, true);
      }

      update(update) {
        if (update.docChanged) this.recompute(update.view);
      }
    },
    { decorations: (v) => v.decorations }
  );
}

export default function CodeEditor({
  value = '',
  onChange,
  language = 'python',
  minRows = 15,
  fontSize = 14,
  wrap = false,
  editorRef = null,
}) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [copied, setCopied] = useState(false);
  const [hasCompiledErrors, setHasCompiledErrors] = useState(false);

  // Expose an imperative insert API (used by the mobile quick-symbol bar)
  useImperativeHandle(editorRef, () => ({
    insert(text) {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length, head: from + text.length },
        scrollIntoView: true,
      });
      view.focus();
    },
  }), []);

  // Compile Python on every edit to surface syntax errors with red underlines
  const handleCodeChange = useCallback((newCode) => {
    onChange(newCode);
    try {
      const view = viewRef.current;
      setHasCompiledErrors(view ? detectSyntaxErrors(view).length > 0 : false);
    } catch (err) {
      console.error('Inline syntax check failed:', err);
      setHasCompiledErrors(false);
    }
  }, [onChange]);

  // Keep the latest change handler available to the editor listener
  useEffect(() => {
    onChangeRef.current = handleCodeChange;
  }, [handleCodeChange]);

  // Create / tear down the CodeMirror instance (rebuilt when language changes)
  useEffect(() => {
    if (!hostRef.current) return undefined;
    const view = new EditorView({
      doc: value || '',
      parent: hostRef.current,
      extensions: buildExtensions(language.toLowerCase(), onChangeRef, wrap),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, wrap]);

  // Keep the controlled value in sync with external updates (reset/problem switch)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== (value || '')) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value || '' },
      });
    }
    try {
      setHasCompiledErrors(detectSyntaxErrors(view).length > 0);
    } catch {
      setHasCompiledErrors(false);
    }
  }, [value, language]);

  // Copy code to clipboard
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(value || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [value]);

  // Click anywhere on the editor surface to focus it
  const focusEditor = useCallback(() => {
    if (viewRef.current) viewRef.current.focus();
  }, []);

  return (
    <div
      className="cl-code-editor-wrap"
      style={{ '--editor-font-size': `${fontSize}px` }}
    >
      {/* ── Toolbar ── */}
      <div className="cl-code-editor-toolbar">
        <span className="cl-code-lang-badge">{language}</span>
        {hasCompiledErrors && (
          <span className="cl-code-compile-error">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Syntax Error
          </span>
        )}
        <button
          type="button"
          className="cl-code-copy-btn"
          onClick={copyCode}
          title="Copy code"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* ── Editor Surface ── */}
      <div className="cl-code-editor-body">
        <div
          ref={hostRef}
          id="cl-code-editor-host"
          className="cl-code-cm-host"
          onClick={focusEditor}
          style={{ minHeight: `${Math.max(minRows, 3) * 24}px` }}
        />
      </div>
    </div>
  );
}