/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { CURRICULUM_MODULES } from './data/curriculumData';
import CurriculumPage from './components/CurriculumPage';
import { Language, UI_STRINGS, MODULE_URDULISH, TOPIC_URDULISH } from './data/translations';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('py_theme') as 'light' | 'dark') || 'light';
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('py_lang');
    if (saved === 'urdulish' || saved === 'hinglish') return 'urdulish';
    return 'en';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('py_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('py_lang', lang);
  }, [lang]);

  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  const [viewMode, setViewMode] = useState<'curriculum' | 'studio'>('curriculum');
  const loadCodeRef = useRef<(codeStr: string, autoRun?: boolean) => void>(() => {});
  const [activeTab, setActiveTab] = useState<'terminal' | 'trace' | 'turtle'>('terminal');
  const [autoTagCloser, setAutoTagCloser] = useState(true);
  const autoTagCloserRef = useRef(true);
  const [memHistoryOn, setMemHistoryOn] = useState(false);
  const memHistoryOnRef = useRef(false);
  const renderVesselsRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!containerRef.current) return;
    const exSelect = containerRef.current.querySelector<HTMLSelectElement>('#ex');
    if (!exSelect) return;
    const curVal = exSelect.value;
    exSelect.innerHTML = `<option value="">${t.chooseTopic}</option>`;
    CURRICULUM_MODULES.forEach((mod) => {
      const og = document.createElement('optgroup');
      const isUrdulish = lang === 'urdulish';
      const modTitle = isUrdulish && MODULE_URDULISH[mod.id]
        ? MODULE_URDULISH[mod.id].title
        : mod.title;
      og.label = `Module ${mod.moduleNumber}: ${modTitle}`;
      mod.topics.forEach((top) => {
        const o = document.createElement('option');
        o.value = top.id;
        const topTitle = isUrdulish && TOPIC_URDULISH[top.id]?.title
          ? TOPIC_URDULISH[top.id].title
          : top.title;
        o.textContent = `${top.topicNumber} ${topTitle}`;
        og.append(o);
      });
      exSelect.append(og);
    });
    if (curVal) exSelect.value = curVal;
  }, [lang, t.chooseTopic]);

  useEffect(() => {
    autoTagCloserRef.current = autoTagCloser;
  }, [autoTagCloser]);

  useEffect(() => {
    memHistoryOnRef.current = memHistoryOn;
  }, [memHistoryOn]);

  useEffect(() => {
    if (!containerRef.current) return;

    const root = containerRef.current;
    const $ = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s);
    const NS = 'http://www.w3.org/2000/svg';

    class F {
      v: number;
      constructor(v: number) {
        this.v = v;
      }
    }

    class PyErr {
      t: string;
      m: string;
      ln?: number;
      constructor(t: string, m: string, ln?: number) {
        this.t = t;
        this.m = m;
        this.ln = ln;
      }
    }

    const E = (t: string, m: string, ln?: number): never => {
      throw new PyErr(t, m, ln);
    };

    const CANCEL = Symbol('CANCEL');

    const isN = (x: any): boolean => typeof x === 'number' || x instanceof F;
    const isNb = (x: any): boolean => isN(x) || typeof x === 'boolean';
    const nv = (x: any): number => (x instanceof F ? x.v : typeof x === 'boolean' ? (x ? 1 : 0) : Number(x));

    const ty = (v: any): string =>
      v === null
        ? 'NoneType'
        : typeof v === 'string'
        ? 'str'
        : typeof v === 'boolean'
        ? 'bool'
        : typeof v === 'number'
        ? 'int'
        : v instanceof F
        ? 'float'
        : Array.isArray(v)
        ? 'list'
        : v && v.fn
        ? 'function'
        : v && v.cls
        ? 'type'
        : v && v.tur
        ? 'Turtle'
        : 'object';

    const str = (v: any): string =>
      v === null
        ? 'None'
        : typeof v === 'boolean'
        ? v
          ? 'True'
          : 'False'
        : v instanceof F
        ? Number.isInteger(v.v)
          ? v.v.toFixed(1)
          : '' + v.v
        : Array.isArray(v)
        ? '[' + v.map(rep).join(', ') + ']'
        : v && v.fn
        ? '<function ' + v.name + '>'
        : v && v.cls
        ? "<class '" + v.cls + "'>"
        : v && v.tur
        ? '<Turtle>'
        : String(v);

    const rep = (v: any): string => (typeof v === 'string' ? "'" + v + "'" : str(v));
    const truthy = (v: any): boolean =>
      v === null ? false : Array.isArray(v) || typeof v === 'string' ? v.length > 0 : isNb(v) ? nv(v) !== 0 : true;

    const eq = (a: any, b: any): boolean =>
      isNb(a) && isNb(b)
        ? nv(a) === nv(b)
        : Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length && a.every((x, i) => eq(x, b[i]))
        : a && a.cls && b && b.cls
        ? a.cls === b.cls
        : a === b;

    /* ---------- Tokenizer ---------- */
    function tokenize(s: string, ln: number) {
      const t: Array<{ k: string; v: any }> = [];
      let i = 0;
      let m: RegExpExecArray | null;

      while (i < s.length) {
        const c = s[i];
        const r = s.slice(i);
        if (c === ' ' || c === '\t') {
          i++;
          continue;
        }
        if (c === '#') break;
        if ((m = /^(\d+\.\d*|\.\d+|\d+)/.exec(r))) {
          t.push({ k: 'n', v: m[1].includes('.') ? new F(+m[1]) : +m[1] });
          i += m[1].length;
          continue;
        }
        if ((m = /^([fF]?)("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/.exec(r))) {
          const raw = m[2]
            .slice(1, -1)
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\(["'\\])/g, '$1');
          t.push({ k: m[1] ? 'f' : 's', v: raw });
          i += m[0].length;
          continue;
        }
        if ((m = /^[A-Za-z_]\w*/.exec(r))) {
          t.push({ k: 'i', v: m[0] });
          i += m[0].length;
          continue;
        }
        if ((m = /^(\*\*|\/\/=?|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|[-+*\/%()\[\]{},:.=<>])/.exec(r))) {
          t.push({ k: 'o', v: m[1] });
          i += m[1].length;
          continue;
        }
        E('SyntaxError', `line ${ln + 1}: unexpected character '${c}'`, ln);
      }
      return t;
    }

    /* ---------- Expression parser ---------- */
    function fparts(s: string, ln: number) {
      const out: any[] = [];
      let i = 0;
      let cur = '';
      while (i < s.length) {
        if (s[i] === '{') {
          if (cur) out.push(cur);
          cur = '';
          const j = s.indexOf('}', i);
          if (j < 0) E('SyntaxError', `line ${ln + 1}: missing } in f-string`, ln);
          const ex = s.slice(i + 1, j);
          const m = ex.match(/^(.*):\.(\d)f$/);
          out.push(m ? ['fmt', ast(tokenize(m[1], ln), ln), +m[2]] : ast(tokenize(ex, ln), ln));
          i = j + 1;
        } else {
          cur += s[i++];
        }
      }
      if (cur) out.push(cur);
      return out;
    }

    function ast(t: Array<{ k: string; v: any }>, ln: number): any {
      let p = 0;
      const pk = () => t[p];
      const ao = (v: string) => pk() && pk().k === 'o' && pk().v === v;
      const aw = (v: string) => pk() && pk().k === 'i' && pk().v === v;
      const eat = (v: string) => {
        if (!ao(v)) E('SyntaxError', `line ${ln + 1}: expected '${v}'`, ln);
        p++;
      };

      const or_ = (): any => {
        let a = and_();
        while (aw('or')) {
          p++;
          a = ['or', a, and_()];
        }
        return a;
      };

      const and_ = (): any => {
        let a = not_();
        while (aw('and')) {
          p++;
          a = ['and', a, not_()];
        }
        return a;
      };

      const not_ = (): any => {
        if (aw('not')) {
          p++;
          return ['not', not_()];
        }
        return cmp();
      };

      const cmp = (): any => {
        let a = add();
        const ops = ['==', '!=', '<', '>', '<=', '>='];
        while (true) {
          let o: string;
          if (pk() && pk().k === 'o' && ops.includes(pk().v)) o = t[p++].v;
          else if (aw('in')) {
            p++;
            o = 'in';
          } else if (aw('not') && t[p + 1] && t[p + 1].v === 'in') {
            p += 2;
            o = 'not in';
          } else break;
          a = ['cmp', o, a, add()];
        }
        return a;
      };

      const add = (): any => {
        let a = mul();
        while (ao('+') || ao('-')) {
          const o = t[p++].v;
          a = ['bin', o, a, mul()];
        }
        return a;
      };

      const mul = (): any => {
        let a = un();
        while (ao('*') || ao('/') || ao('//') || ao('%')) {
          const o = t[p++].v;
          a = ['bin', o, a, un()];
        }
        return a;
      };

      const un = (): any => {
        if (ao('-')) {
          p++;
          return ['neg', un()];
        }
        if (ao('+')) {
          p++;
          return un();
        }
        return pw();
      };

      const pw = (): any => {
        const a = post();
        if (ao('**')) {
          p++;
          return ['bin', '**', a, un()];
        }
        return a;
      };

      const post = (): any => {
        let a = atom();
        while (true) {
          if (ao('(')) {
            p++;
            const args: any[] = [];
            while (!ao(')')) {
              if (pk() && pk().k === 'i' && t[p + 1] && t[p + 1].k === 'o' && t[p + 1].v === '=') {
                const n = t[p].v;
                p += 2;
                args.push(['kw', n, or_()]);
              } else args.push(or_());
              if (ao(',')) p++;
              else break;
            }
            eat(')');
            a = ['call', a, args];
          } else if (ao('[')) {
            p++;
            let i: any = null;
            let j: any = null;
            let sl = false;
            if (!ao(':')) i = or_();
            if (ao(':')) {
              sl = true;
              p++;
              if (!ao(']')) j = or_();
            }
            eat(']');
            a = sl ? ['slice', a, i, j] : ['idx', a, i];
          } else if (ao('.')) {
            p++;
            const n = t[p++];
            if (!n || n.k !== 'i') E('SyntaxError', `line ${ln + 1}: a name must follow the dot`, ln);
            a = ['attr', a, n.v];
          } else break;
        }
        return a;
      };

      const atom = (): any => {
        const x = t[p++];
        if (!x) E('SyntaxError', `line ${ln + 1}: the line ends too soon`, ln);
        if (x.k === 'n' || x.k === 's') return ['lit', x.v];
        if (x.k === 'f') return ['f', fparts(x.v, ln)];
        if (x.k === 'i') {
          if (x.v === 'True') return ['lit', true];
          if (x.v === 'False') return ['lit', false];
          if (x.v === 'None') return ['lit', null];
          return ['name', x.v];
        }
        if (x.v === '(') {
          if (ao(')')) {
            p++;
            return ['lit', []];
          }
          const e = or_();
          if (ao(',')) {
            const items = [e];
            while (ao(',')) {
              p++;
              if (ao(')')) break;
              items.push(or_());
            }
            eat(')');
            return ['list', items];
          }
          eat(')');
          return e;
        }
        if (x.v === '[') {
          const a: any[] = [];
          while (!ao(']')) {
            a.push(or_());
            if (ao(',')) p++;
            else break;
          }
          eat(']');
          return ['list', a];
        }
        if (x.v === '{') {
          if (ao('}')) {
            p++;
            return ['dict', []];
          }
          const pairs: any[] = [];
          while (!ao('}')) {
            const k = or_();
            if (ao(':')) {
              p++;
              const v = or_();
              pairs.push([k, v]);
            } else {
              pairs.push([k, k]);
            }
            if (ao(',')) p++;
            else break;
          }
          eat('}');
          return ['dict', pairs];
        }
        E('SyntaxError', `line ${ln + 1}: I did not expect '${x.v}'`, ln);
      };

      if (!t.length) E('SyntaxError', `line ${ln + 1}: something is missing here`, ln);
      const e = or_();
      if (p < t.length) E('SyntaxError', `line ${ln + 1}: I did not expect '${t[p].v}'`, ln);
      return e;
    }

    /* ---------- Statement parser ---------- */
    function parseProgram(src: string): any[] {
      const L: Array<{ ind: number; toks: Array<{ k: string; v: any }>; ln: number }> = [];
      src.split('\n').forEach((l, i) => {
        const toks = tokenize(l, i);
        if (toks.length) {
          L.push({
            ind: (l.match(/^[ \t]*/) || [''])[0].replace(/\t/g, '    ').length,
            toks,
            ln: i,
          });
        }
      });

      const head = (k: number) => {
        const t = L[k].toks;
        const z = t[t.length - 1];
        if (!(z.k === 'o' && z.v === ':')) E('SyntaxError', `line ${L[k].ln + 1} must end with a colon  :`, L[k].ln);
        return t.slice(1, -1);
      };

      const body = (k: number) => {
        const n = L[k + 1];
        if (!n || n.ind <= L[k].ind) E('IndentationError', `line ${L[k].ln + 1}: the next line must be indented (press Tab)`, L[k].ln);
        return block(k + 1, n.ind);
      };

      function block(i: number, ind: number): [any[], number] {
        const b: any[] = [];
        while (i < L.length && L[i].ind >= ind) {
          if (L[i].ind > ind) E('IndentationError', `line ${L[i].ln + 1}: unexpected indent`, L[i].ln);
          const r = stmt(i);
          b.push(r[0]);
          i = r[1];
        }
        return [b, i];
      }

      function stmt(i: number): [any, number] {
        const { toks: t, ln, ind } = L[i];
        const w = t[0].k === 'i' ? t[0].v : '';
        if (w === 'if') {
          const [b, j] = body(i);
          let currentJ = j;
          const br = [{ c: ast(head(i), ln), b, ln }];
          let els: any = null;
          let eln = 0;
          while (currentJ < L.length && L[currentJ].ind === ind && L[currentJ].toks[0].k === 'i') {
            const kw = L[currentJ].toks[0].v;
            if (kw === 'elif') {
              const r = body(currentJ);
              br.push({ c: ast(head(currentJ), L[currentJ].ln), b: r[0], ln: L[currentJ].ln });
              currentJ = r[1];
            } else if (kw === 'else') {
              if (L[currentJ].toks.length !== 2) E('SyntaxError', `line ${L[currentJ].ln + 1}: write just  else:`, L[currentJ].ln);
              const r = body(currentJ);
              els = r[0];
              eln = L[currentJ].ln;
              currentJ = r[1];
              break;
            } else break;
          }
          return [{ t: 'if', ln, br, els, eln }, currentJ];
        }
        if (w === 'while') {
          const h = head(i);
          const r = body(i);
          return [{ t: 'while', ln, c: ast(h, ln), b: r[0] }, r[1]];
        }
        if (w === 'for') {
          const h = head(i);
          const r = body(i);
          const inIdx = h.findIndex((tok) => tok.k === 'i' && tok.v === 'in');
          if (inIdx < 1) {
            E('SyntaxError', `line ${ln + 1}: write  for name in something:`, ln);
          }
          const loopVars = h.slice(0, inIdx).filter((x) => x.k === 'i').map((x) => x.v);
          const iterToks = h.slice(inIdx + 1);
          return [{ t: 'for', ln, vars: loopVars, v: loopVars[0], it: ast(iterToks, ln), b: r[0] }, r[1]];
        }
        if (w === 'def') {
          const h = head(i);
          const r = body(i);
          if (!h[0] || h[0].k !== 'i' || !h[1] || h[1].v !== '(') {
            E('SyntaxError', `line ${ln + 1}: write  def name(parameters):`, ln);
          }
          const paramToks = h.slice(2, -1);
          const params: string[] = [];
          for (let pIdx = 0; pIdx < paramToks.length; pIdx++) {
            const pt = paramToks[pIdx];
            if (pt.k === 'i' && (pIdx === 0 || paramToks[pIdx - 1].v === ',')) {
              params.push(pt.v);
            }
          }
          return [{ t: 'def', ln, n: h[0].v, ps: params.length ? params : h.slice(2, -1).filter((x) => x.k === 'i').map((x) => x.v), b: r[0] }, r[1]];
        }
        if (w === 'try') {
          const [tryBody, nextJ] = body(i);
          let currentJ = nextJ;
          const exceptBlocks: any[] = [];
          let finallyBody: any = null;

          while (currentJ < L.length && L[currentJ].ind === ind && L[currentJ].toks[0].k === 'i') {
            const kw = L[currentJ].toks[0].v;
            if (kw === 'except') {
              const h = head(currentJ);
              let excType = '';
              let excAs = '';
              if (h.length >= 1 && h[0].k === 'i') excType = h[0].v;
              if (h.length >= 3 && h[1].v === 'as' && h[2].k === 'i') excAs = h[2].v;
              const r = body(currentJ);
              exceptBlocks.push({ excType, excAs, b: r[0], ln: L[currentJ].ln });
              currentJ = r[1];
            } else if (kw === 'finally') {
              const r = body(currentJ);
              finallyBody = r[0];
              currentJ = r[1];
              break;
            } else break;
          }
          return [{ t: 'try', ln, tryBody, exceptBlocks, finallyBody }, currentJ];
        }
        if (w === 'class') {
          const h = head(i);
          const className = h[0]?.v || 'Class';
          const r = body(i);
          return [{ t: 'class', ln, n: className, b: r[0] }, r[1]];
        }
        if (w === 'return') {
          const rhs = t.slice(1);
          if (!rhs.length) return [{ t: 'ret', ln, e: null }, i + 1];
          if (rhs.some((x) => x.v === ',')) {
            const rhsParts: any[] = [];
            let curRhs: any[] = [];
            for (const tok of rhs) {
              if (tok.v === ',') {
                if (curRhs.length) rhsParts.push(ast(curRhs, ln));
                curRhs = [];
              } else curRhs.push(tok);
            }
            if (curRhs.length) rhsParts.push(ast(curRhs, ln));
            return [{ t: 'ret', ln, e: ['list', rhsParts] }, i + 1];
          }
          return [{ t: 'ret', ln, e: ast(rhs, ln) }, i + 1];
        }
        if (w === 'break' || w === 'continue' || w === 'pass') return [{ t: w, ln }, i + 1];
        if (w === 'import' || w === 'from') return [{ t: 'pass', ln, imp: 1 }, i + 1];
        let d = 0;
        let k = -1;
        for (let q = 0; q < t.length; q++) {
          const x = t[q];
          if (x.k !== 'o') continue;
          if ('(['.includes(x.v)) d++;
          else if (')]'.includes(x.v)) d--;
          else if (!d && ['=', '+=', '-=', '*=', '/=', '//=', '%='].includes(x.v)) {
            k = q;
            break;
          }
        }
        if (k > 0) {
          const lhs = t.slice(0, k);
          const rhs = t.slice(k + 1);
          const hasComma = lhs.some((x) => x.v === ',');
          if (hasComma) {
            const varNames = lhs.filter((x) => x.k === 'i').map((x) => x.v);
            const rhsHasCommas = rhs.some((x) => x.v === ',');
            let exprNode;
            if (rhsHasCommas) {
              const rhsParts: any[] = [];
              let curRhs: any[] = [];
              for (const tok of rhs) {
                if (tok.v === ',') {
                  if (curRhs.length) rhsParts.push(ast(curRhs, ln));
                  curRhs = [];
                } else curRhs.push(tok);
              }
              if (curRhs.length) rhsParts.push(ast(curRhs, ln));
              exprNode = ['list', rhsParts];
            } else {
              exprNode = ast(rhs, ln);
            }
            return [{ t: 'multi_asg', ln, vars: varNames, e: exprNode }, i + 1];
          }
          const tg = ast(lhs, ln);
          if (tg[0] !== 'name' && tg[0] !== 'idx' && tg[0] !== 'attr') {
            E('SyntaxError', `line ${ln + 1}: you can only store a value in a variable, list/dict item, or attribute`, ln);
          }
          const o = t[k].v;
          return [{ t: 'asg', ln, tg, op: o === '=' ? null : o.slice(0, -1), e: ast(rhs, ln) }, i + 1];
        }
        return [{ t: 'expr', ln, e: ast(t, ln) }, i + 1];
      }

      const r = block(0, L.length ? L[0].ind : 0);
      return r[0];
    }

    /* ---------- Math & Comparison Ops ---------- */
    const num = (r: number, f: boolean) => (f ? new F(r) : r);
    function binop(o: string, a: any, b: any): any {
      const A = isNb(a);
      const B = isNb(b);
      const fl = a instanceof F || b instanceof F;
      const x = A ? nv(a) : 0;
      const y = B ? nv(b) : 0;

      if (o === '+') {
        if (A && B) return num(x + y, fl);
        if (typeof a === 'string' && typeof b === 'string') return a + b;
        if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
        E('TypeError', `cannot add a ${ty(a)} and a ${ty(b)}. Both sides must be the same kind (use int() or str() to convert).`);
      }
      if (o === '*') {
        if (A && B) return num(x * y, fl);
        if (typeof a === 'string' && Number.isInteger(b)) return a.repeat(Math.max(0, b));
        if (typeof b === 'string' && Number.isInteger(a)) return b.repeat(Math.max(0, a));
        if (Array.isArray(a) && Number.isInteger(b)) {
          let r: any[] = [];
          for (let i = 0; i < b; i++) r = r.concat(a);
          return r;
        }
        E('TypeError', `cannot multiply a ${ty(a)} by a ${ty(b)}`);
      }
      if (!A || !B) E('TypeError', `'${o}' is not supported between a ${ty(a)} and a ${ty(b)}`);
      if (o === '-') return num(x - y, fl);
      if (o === '**') {
        if (!fl && y >= 0) return Math.pow(x, y);
        return new F(Math.pow(x, y));
      }
      if (y === 0) E('ZeroDivisionError', o === '/' ? 'you cannot divide by zero' : 'integer division or modulo by zero');
      if (o === '/') return new F(x / y);
      if (o === '//') return num(Math.floor(x / y), fl);
      if (o === '%') return num(((x % y) + y) % y, fl);
    }

    function cmpop(o: string, a: any, b: any): boolean {
      if (o === '==') return eq(a, b);
      if (o === '!=') return !eq(a, b);
      if (o === 'in' || o === 'not in') {
        let r = false;
        if (typeof b === 'string' && typeof a === 'string') r = b.includes(a);
        else if (Array.isArray(b)) r = b.some((x) => eq(x, a));
        else E('TypeError', `'in' needs a string or a list on the right side`);
        return o === 'in' ? r : !r;
      }
      let c = 0;
      if (isNb(a) && isNb(b)) c = nv(a) - nv(b);
      else if (typeof a === 'string' && typeof b === 'string') c = a < b ? -1 : a > b ? 1 : 0;
      else E('TypeError', `'${o}' cannot compare a ${ty(a)} with a ${ty(b)}. Convert one side first, for example with int().`);
      return o === '<' ? c < 0 : o === '>' ? c > 0 : o === '<=' ? c <= 0 : c >= 0;
    }

    function idx(o: any, i: any): number {
      if (!Array.isArray(o) && typeof o !== 'string') E('TypeError', `a ${ty(o)} cannot be indexed with []`);
      if (typeof i !== 'number') E('TypeError', `index must be a whole number, not ${ty(i)}`);
      const n = o.length;
      const k = i < 0 ? i + n : i;
      if (k < 0 || k >= n) E('IndexError', `index ${i} is outside the ${ty(o)} (valid: ${-n} to ${n - 1})`);
      return k;
    }

    function slice(o: any, a: any, b: any): any {
      const n = o.length;
      const f = (v: any, d: number) => (v === null ? d : Math.min(n, Math.max(0, v < 0 ? v + n : v)));
      return typeof o === 'string' ? o.slice(f(a, 0), f(b, n)) : o.slice(f(a, 0), f(b, n));
    }

    /* ---------- Methods & Builtins ---------- */
    const cmpv = (a: any, b: any) =>
      isNb(a) && isNb(b)
        ? nv(a) - nv(b)
        : typeof a === 'string' && typeof b === 'string'
        ? a < b
          ? -1
          : a > b
          ? 1
          : 0
        : E('TypeError', `cannot sort a ${ty(a)} with a ${ty(b)}`);

    const S1 = (a: any[], k: number) => {
      if (typeof a[k] !== 'string') E('TypeError', 'this method needs a string');
      return a[k];
    };

    const SM: Record<string, (s: string, a: any[]) => any> = {
      upper: (s) => s.toUpperCase(),
      lower: (s) => s.toLowerCase(),
      title: (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()),
      capitalize: (s) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s),
      strip: (s) => s.trim(),
      lstrip: (s) => s.trimStart(),
      rstrip: (s) => s.trimEnd(),
      swapcase: (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''),
      replace: (s, a) => s.split(S1(a, 0)).join(S1(a, 1)),
      split: (s, a) => (a.length ? s.split(a[0]) : s.trim() ? s.trim().split(/\s+/) : []),
      join: (s, a) => {
        if (!Array.isArray(a[0]) || a[0].some((x) => typeof x !== 'string')) E('TypeError', 'join() needs a list of strings');
        return a[0].join(s);
      },
      find: (s, a) => s.indexOf(S1(a, 0)),
      count: (s, a) => (S1(a, 0) ? s.split(a[0]).length - 1 : 0),
      startswith: (s, a) => s.startsWith(S1(a, 0)),
      startwith: (s, a) => s.startsWith(S1(a, 0)),
      endswith: (s, a) => s.endsWith(S1(a, 0)),
      isdigit: (s) => /^\d+$/.test(s),
      isalpha: (s) => /^[A-Za-z]+$/.test(s),
      isupper: (s) => s !== s.toLowerCase() && s === s.toUpperCase(),
      islower: (s) => s !== s.toUpperCase() && s === s.toLowerCase(),
    };

    const LM: Record<string, (l: any[], a: any[]) => any> = {
      append: (l, a) => {
        l.push(a[0]);
        return null;
      },
      extend: (l, a) => {
        l.push(...a[0]);
        return null;
      },
      insert: (l, a) => {
        l.splice(Math.max(0, a[0] < 0 ? a[0] + l.length : a[0]), 0, a[1]);
        return null;
      },
      pop: (l, a) => {
        if (!l.length) E('IndexError', 'pop from empty list');
        return l.splice(a.length ? idx(l, a[0]) : l.length - 1, 1)[0];
      },
      remove: (l, a) => {
        const i = l.findIndex((x) => eq(x, a[0]));
        if (i < 0) E('ValueError', 'the value is not in the list');
        l.splice(i, 1);
        return null;
      },
      sort: (l) => {
        l.sort(cmpv);
        return null;
      },
      reverse: (l) => {
        l.reverse();
        return null;
      },
      clear: (l) => {
        l.length = 0;
        return null;
      },
      index: (l, a) => {
        const i = l.findIndex((x) => eq(x, a[0]));
        if (i < 0) E('ValueError', 'the value is not in the list');
        return i;
      },
      count: (l, a) => l.filter((x) => eq(x, a[0])).length,
    };

    const bi = (name: string, f: (a: any[], k?: any) => any) => ({ bi: true, name, f });
    const toInt = (a: any) => {
      if (typeof a === 'string') {
        const s = a.trim();
        if (!/^[+-]?\d+$/.test(s)) E('ValueError', `invalid literal for int(): '${a}'. Only whole digit text can become int.`);
        return +s;
      }
      if (isNb(a)) return Math.trunc(nv(a));
      E('TypeError', `int() cannot convert a ${ty(a)}`);
    };

    const toFloat = (a: any) => {
      if (typeof a === 'string') {
        const s = a.trim();
        if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) E('ValueError', `could not convert string to float: '${a}'`);
        return new F(+s);
      }
      if (isNb(a)) return new F(nv(a));
      E('TypeError', `float() cannot convert a ${ty(a)}`);
    };

    const virtualFiles: Record<string, string> = {
      'data.txt': 'Python 3.12 Standard Data\nKhyber Pakhtunkhwa BT&CE DIT Curriculum\nInteractive Visualizer Lab',
      'students.csv': 'id,name,score\n1,Amina,92\n2,Bilal,85\n3,Cyrus,96',
    };

    const lst = (a: any[]) => (a.length === 1 && Array.isArray(a[0]) ? a[0] : a);
    const BI: Record<string, (a: any[], k?: any) => any> = {
      print: async (a, k = {}) => {
        const text = a.map(str).join(k.sep !== undefined ? str(k.sep) : ' ');
        const end = k.end !== undefined ? str(k.end) : '\n';
        setMeta({
          type: 'broadcast',
          text,
        });
        await flyToTerminal(text, end);
        return null;
      },
      input: async (a) => ask(a.length ? str(a[0]) : ''),
      len: (a) => {
        if (typeof a[0] === 'string' || Array.isArray(a[0])) return a[0].length;
        if (a[0] && typeof a[0] === 'object') return Object.keys(a[0]).length;
        E('TypeError', `a ${ty(a[0])} has no len()`);
      },
      int: (a) => toInt(a[0]),
      float: (a) => toFloat(a[0]),
      str: (a) => (a.length ? str(a[0]) : ''),
      bool: (a) => truthy(a[0]),
      list: (a) => (typeof a[0] === 'string' ? [...a[0]] : Array.isArray(a[0]) ? a[0].slice() : a.length && typeof a[0] === 'object' ? Object.keys(a[0]) : a.length ? E('TypeError', 'list() needs an iterable') : []),
      dict: (a) => {
        if (!a.length) return {};
        if (Array.isArray(a[0])) {
          const d: Record<string, any> = {};
          for (const pair of a[0]) {
            if (Array.isArray(pair) && pair.length >= 2) d[String(pair[0])] = pair[1];
          }
          return d;
        }
        if (typeof a[0] === 'object' && a[0]) return { ...a[0] };
        return {};
      },
      range: (a) => {
        const validated = a.map((x) => {
          if (typeof x !== 'number') E('TypeError', `range() needs whole numbers, not ${ty(x)}`);
          return x;
        });
        const s = validated.length > 1 ? validated[0] : 0;
        const e = validated.length > 1 ? validated[1] : validated[0];
        const st = validated[2] || 1;
        if (!st) E('ValueError', 'range() step cannot be 0');
        const r: number[] = [];
        if (Math.abs((e - s) / st) > 5000) E('ValueError', 'range() is too big for this lab');
        for (let i = s; st > 0 ? i < e : i > e; i += st) r.push(i);
        return r;
      },
      enumerate: (a) => {
        const arr = typeof a[0] === 'string' ? [...a[0]] : Array.isArray(a[0]) ? a[0] : a[0] && typeof a[0] === 'object' ? Object.keys(a[0]) : [];
        const start = a[1] !== undefined ? a[1] : 0;
        return arr.map((item: any, idx: number) => [idx + start, item]);
      },
      zip: (a) => {
        const lists = a.map((x: any) => (typeof x === 'string' ? [...x] : Array.isArray(x) ? x : []));
        const minLen = lists.length ? Math.min(...lists.map((l: any[]) => l.length)) : 0;
        const res = [];
        for (let i = 0; i < minLen; i++) res.push(lists.map((l: any[]) => l[i]));
        return res;
      },
      all: (a) => (Array.isArray(a[0]) ? a[0] : [a[0]]).every(truthy),
      any: (a) => (Array.isArray(a[0]) ? a[0] : [a[0]]).some(truthy),
      ord: (a) => (typeof a[0] === 'string' && a[0].length === 1 ? a[0].charCodeAt(0) : E('TypeError', 'ord() expected a character')),
      chr: (a) => String.fromCharCode(Number(a[0])),
      pow: (a) => binop('**', a[0], a[1]),
      open: (a) => {
        const filename = str(a[0]);
        const mode = a[1] !== undefined ? str(a[1]) : 'r';
        if (!virtualFiles[filename]) {
          virtualFiles[filename] = 'Sample file content created for lab demonstration.';
        }
        return {
          mod: true,
          filename,
          mode,
          read: () => virtualFiles[filename] || '',
          readline: () => (virtualFiles[filename] || '').split('\n')[0] || '',
          readlines: () => (virtualFiles[filename] || '').split('\n').map((l) => l + '\n'),
          write: (text: any[]) => {
            virtualFiles[filename] = str(text[0]);
            return (text[0] || '').length;
          },
          close: () => null,
        };
      },
      exit: () => { throw CANCEL; },
      quit: () => { throw CANCEL; },
      type: (a) => ({ cls: ty(a[0]) }),
      abs: (a) => num(Math.abs(nv(a[0])), a[0] instanceof F),
      round: (a) => (a.length > 1 ? new F(+nv(a[0]).toFixed(a[1])) : Math.round(nv(a[0]))),
      max: (a) => {
        const l = lst(a);
        if (!l.length) E('ValueError', 'max() arg is an empty sequence');
        return l.reduce((x: any, y: any) => (cmpv(y, x) > 0 ? y : x));
      },
      min: (a) => {
        const l = lst(a);
        if (!l.length) E('ValueError', 'min() arg is an empty sequence');
        return l.reduce((x: any, y: any) => (cmpv(y, x) < 0 ? y : x));
      },
      sum: (a) => (Array.isArray(a[0]) ? a[0] : [a[0]]).reduce((x: any, y: any) => binop('+', x, y), 0),
      sorted: (a) => a[0].slice().sort(cmpv),
    };

    const NOOP = ['done', 'mainloop', 'exitonclick', 'Screen', 'title', 'setup', 'tracer', 'update', 'speed', 'delay', 'show', 'init', 'plot'];
    function attr(o: any, n: string) {
      if (typeof o === 'string' && SM[n]) return bi(n, (a) => SM[n](o, a));
      if (Array.isArray(o) && LM[n]) return bi(n, (a) => LM[n](o, a));
      if (o && typeof o === 'object') {
        if (n === 'keys') return bi(n, () => Object.keys(o));
        if (n === 'values') return bi(n, () => Object.values(o));
        if (n === 'items') return bi(n, () => Object.entries(o));
        if (n === 'get') return bi(n, (a) => (a[0] in o ? o[a[0]] : a[1] !== undefined ? a[1] : null));
        if (o.fields && n in o.fields) return o.fields[n];
        if (n in o) {
          const val = o[n];
          if (typeof val === 'function') {
            return bi(n, (a: any[], k: any = {}) => val(a, k));
          }
          return val;
        }
      }
      if (o && o.cls && G.vars[o.cls] && G.vars[o.cls].methods && G.vars[o.cls].methods[n]) {
        const methodFn = G.vars[o.cls].methods[n];
        return bi(n, async (a: any[], k: any = {}) => call(methodFn, [o, ...a], k));
      }
      if (o && o.mod) {
        if (n === 'Turtle') return bi(n, () => ({ tur: true }));
        if (n === 'Screen') return bi(n, () => ({ scr: true }));
        if (TF[n]) return bi(n, TF[n]);
        if (NOOP.includes(n)) return bi(n, () => null);
      }
      if (o && o.scr) {
        if (n === 'bgcolor')
          return bi(n, (a) => {
            const svg = $('#tsvg');
            if (svg) svg.style.background = str(a[0]);
            return null;
          });
        return bi(n, () => null);
      }
      if (o && o.tur) {
        if (TF[n]) return bi(n, TF[n]);
        if (NOOP.includes(n)) return bi(n, () => null);
      }
      E('AttributeError', `a ${ty(o)} has no method called '${n}'`);
    }

    /* ---------- Evaluator & Stack ---------- */
    const G: { vars: Record<string, any>; title: string; id: number } = { vars: {}, title: 'global', id: 0 };
    let stack = [G];
    let steps = 0;
    let cur = 0;
    let gen = 0;
    let envN = 0;

    function look(env: any, n: string): any {
      if (n in env.vars) return env.vars[n];
      if (n in G.vars) return G.vars[n];
      if (n === 'turtle') return { mod: true };
      if (n === 'pandas' || n === 'pd') {
        return {
          mod: true,
          read_excel: (a: any[]) => ({
            df: true,
            head: () => '   Name  Grade  Attendance\n0 Amina     92          98\n1 Bilal     85          90\n2 Cyrus     96         100',
            to_excel: (f: any[]) => `Data successfully exported to ${f && f.length ? str(f[0]) : 'output.xlsx'}`
          }),
        };
      }
      if (n === 'numpy' || n === 'np') {
        return {
          mod: true,
          array: (a: any[]) => (Array.isArray(a[0]) ? a[0] : a),
          mean: (a: any[]) => {
            const arr = Array.isArray(a[0]) ? a[0] : a;
            return arr.length ? arr.reduce((x: any, y: any) => x + y, 0) / arr.length : 0;
          },
          sum: (a: any[]) => {
            const arr = Array.isArray(a[0]) ? a[0] : a;
            return arr.reduce((x: any, y: any) => x + y, 0);
          },
          zeros: (a: any[]) => Array(a[0] || 0).fill(0),
        };
      }
      if (n === 'matplotlib' || n === 'plt') {
        return {
          mod: true,
          pyplot: {
            plot: () => 'Line plot rendered',
            show: () => 'Plot displayed',
          },
          plot: () => 'Line plot rendered',
          show: () => 'Plot window opened',
        };
      }
      if (n === 'tkinter' || n === 'tk') {
        return {
          mod: true,
          Tk: () => ({ win: true }),
          mainloop: () => null,
        };
      }
      if (n === 'pygame') {
        return {
          mod: true,
          init: () => 'PyGame initialized',
        };
      }
      if (n === 'sys') {
        return {
          mod: true,
          version: '3.12.0',
        };
      }
      if (n === 'math') {
        return {
          mod: true,
          pi: Math.PI,
          e: Math.E,
          sqrt: (a: any[]) => Math.sqrt(nv(a[0])),
          floor: (a: any[]) => Math.floor(nv(a[0])),
          ceil: (a: any[]) => Math.ceil(nv(a[0])),
          sin: (a: any[]) => Math.sin(nv(a[0])),
          cos: (a: any[]) => Math.cos(nv(a[0])),
          tan: (a: any[]) => Math.tan(nv(a[0])),
          pow: (a: any[]) => Math.pow(nv(a[0]), nv(a[1])),
          factorial: (a: any[]) => {
            const num = Math.round(nv(a[0]));
            let r = 1;
            for (let i = 2; i <= num; i++) r *= i;
            return r;
          },
          gcd: (a: any[]) => {
            let x = Math.abs(Math.round(nv(a[0])));
            let y = Math.abs(Math.round(nv(a[1])));
            while (y) { const t = y; y = x % y; x = t; }
            return x;
          },
        };
      }
      if (n === 'random') {
        return {
          mod: true,
          random: () => Math.random(),
          randint: (a: any[]) => {
            const min = Math.ceil(nv(a[0]));
            const max = Math.floor(nv(a[1]));
            return Math.floor(Math.random() * (max - min + 1)) + min;
          },
          choice: (a: any[]) => {
            const arr = Array.isArray(a[0]) ? a[0] : typeof a[0] === 'string' ? [...a[0]] : [];
            return arr[Math.floor(Math.random() * arr.length)];
          },
          shuffle: (a: any[]) => {
            if (Array.isArray(a[0])) a[0].sort(() => Math.random() - 0.5);
            return null;
          },
        };
      }
      if (n === 'time') {
        return {
          mod: true,
          time: () => Date.now() / 1000,
          sleep: async (a: any[]) => sleep(nv(a[0]) * 1000),
        };
      }
      if (BI[n]) return bi(n, BI[n]);
      if (TF[n]) return bi(n, TF[n]);
      E('NameError', `name '${n}' is not defined. Create it first, for example  ${n} = ...`);
    }

    async function ev(n: any, env: any): Promise<any> {
      switch (n[0]) {
        case 'lit':
          return n[1];
        case 'name':
          return look(env, n[1]);
        case 'list': {
          const r: any[] = [];
          for (const x of n[1]) r.push(await ev(x, env));
          return r;
        }
        case 'dict': {
          const obj: Record<string, any> = {};
          for (const [kNode, vNode] of n[1]) {
            const kVal = await ev(kNode, env);
            const vVal = await ev(vNode, env);
            obj[String(kVal)] = vVal;
          }
          return obj;
        }
        case 'f': {
          let s = '';
          for (const p of n[1]) s += typeof p === 'string' ? p : p[0] === 'fmt' ? nv(await ev(p[1], env)).toFixed(p[2]) : str(await ev(p, env));
          return s;
        }
        case 'neg': {
          const v = await ev(n[1], env);
          if (!isNb(v)) E('TypeError', `cannot put - before a ${ty(v)}`);
          return v instanceof F ? new F(-v.v) : -nv(v);
        }
        case 'not':
          return !truthy(await ev(n[1], env));
        case 'and': {
          const a = await ev(n[1], env);
          return truthy(a) ? ev(n[2], env) : a;
        }
        case 'or': {
          const a = await ev(n[1], env);
          return truthy(a) ? a : ev(n[2], env);
        }
        case 'bin':
          return binop(n[1], await ev(n[2], env), await ev(n[3], env));
        case 'cmp':
          return cmpop(n[1], await ev(n[2], env), await ev(n[3], env));
        case 'idx': {
          const o = await ev(n[1], env);
          const i = await ev(n[2], env);
          const k = idx(o, i);
          return o[k];
        }
        case 'slice': {
          const o = await ev(n[1], env);
          const a = n[2] && (await ev(n[2], env));
          const b = n[3] && (await ev(n[3], env));
          if (!Array.isArray(o) && typeof o !== 'string') E('TypeError', 'only strings and lists can be sliced');
          return slice(o, a, b);
        }
        case 'attr':
          return attr(await ev(n[1], env), n[2]);
        case 'call': {
          const f = await ev(n[1], env);
          const a: any[] = [];
          const k: Record<string, any> = {};
          for (const x of n[2]) {
            if (x[0] === 'kw') k[x[1]] = await ev(x[2], env);
            else a.push(await ev(x, env));
          }
          return call(f, a, k);
        }
      }
    }

    async function call(f: any, a: any[], k: any = {}): Promise<any> {
      if (f && f.bi) return await f.f(a, k);
      if (!f || !f.fn) E('TypeError', `${ty(f)} is not something you can call`);
      if (a.length !== f.ps.length) E('TypeError', `${f.name}() needs ${f.ps.length} argument(s) but got ${a.length}`);
      if (stack.length > 40) E('RecursionError', 'too many nested function calls (recursion depth reached)');

      const env = { vars: {}, id: ++envN, title: f.name + '(' + a.map(rep).join(', ') + ')' };
      stack.push(env);
      setMeta({
        type: 'call',
        fnName: f.name,
        args: a.map(rep).join(', '),
      });
      say_(`**Function Call:** **${esc(f.name)}** chamber started. Parameters: <code>${esc(a.map(rep).join(', '))}</code>`);
      renderVessels();
      await sleep(350);

      for (let i = 0; i < f.ps.length; i++) {
        await setVar(env, f.ps[i], a[i]);
      }

      const r = await run(f.body, env);
      await sleep(300);
      stack.pop();
      renderVessels();
      return r && r.ret !== undefined ? r.ret : null;
    }

    async function run(b: any[], env: any): Promise<any> {
      for (const s of b) {
        let r: any;
        try {
          r = await exec(s, env);
        } catch (e: any) {
          if (e instanceof PyErr && e.ln === undefined) e.ln = s.ln;
          throw e;
        }
        if (r) return r;
      }
    }

    const esc = (s: any) =>
      String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
    const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

    async function exec(s: any, env: any): Promise<any> {
      switch (s.t) {
        case 'asg': {
          await gate(s.ln);
          const v0 = await ev(s.e, env);
          let v = v0;
          let prevVal = null;
          if (s.op) {
            prevVal = await ev(s.tg, env);
            v = binop(s.op, prevVal, v0);
          }
          if (s.tg[0] === 'name') {
            const varName = s.tg[1];
            if (s.op && prevVal !== null) {
              setMeta({
                type: 'fusion',
                target: varName,
                op: s.op + '=',
                prevVal: rep(prevVal),
                delta: rep(v0),
                newVal: rep(v),
              });
              say_(
                `**Accumulator:** <b>${esc(varName)}</b> me purana <code>${esc(rep(prevVal))}</code> tha, naya <code>${esc(
                  rep(v0)
                )}</code> add hokar result bana <b>${esc(rep(v))}</b>.`
              );
            } else {
              setMeta({
                type: 'fusion',
                target: varName,
                op: '=',
                prevVal: '',
                delta: rep(v),
                newVal: rep(v),
              });
              say_(`**Variable Assignment:** <b>${esc(varName)}</b> ko value <b>${esc(rep(v))}</b> assign hui.`);
            }
            await setVar(env, varName, v);
          } else if (s.tg[0] === 'idx') {
            const o = await ev(s.tg[1], env);
            const i = await ev(s.tg[2], env);
            if (typeof o === 'string') E('TypeError', 'a string cannot be changed. Make a new string instead.');
            if (o && typeof o === 'object' && !Array.isArray(o)) {
              o[String(i)] = v;
              say_(`**Dict Updated:** Key <b>${esc(rep(i))}</b> par value <b>${esc(rep(v))}</b> set hui.`);
            } else {
              o[idx(o, i)] = v;
              say_(`**List Updated:** Index <b>${esc(i)}</b> par value <b>${esc(rep(v))}</b> set hui.`);
            }
            renderVessels();
          } else if (s.tg[0] === 'attr') {
            const o = await ev(s.tg[1], env);
            const attrName = s.tg[2];
            if (o && typeof o === 'object') {
              if (o.fields) o.fields[attrName] = v;
              else o[attrName] = v;
              say_(`**Attribute Set:** <code>${esc(attrName)}</code> = <b>${esc(rep(v))}</b>.`);
              renderVessels();
            }
          }
          return;
        }
        case 'multi_asg': {
          await gate(s.ln);
          let val = await ev(s.e, env);
          if (!Array.isArray(val) && typeof val === 'string') val = [...val];
          if (!Array.isArray(val)) val = [val];
          for (let vi = 0; vi < s.vars.length; vi++) {
            const v = vi < val.length ? val[vi] : null;
            await setVar(env, s.vars[vi], v);
          }
          say_(`**Variables Assigned:** <b>${esc(s.vars.join(', '))}</b>.`);
          return;
        }
        case 'expr': {
          await gate(s.ln);
          await ev(s.e, env);
          return;
        }
        case 'if': {
          for (const b of s.br) {
            await gate(b.ln);
            const rawCond = (code.value.split('\n')[b.ln] || '').trim().replace(/^elif\s+/, '').replace(/^if\s+/, '').replace(/:$/, '');
            const branchType = b.ln === s.ln ? 'if' : 'elif';

            // Step 1: Testing animation in Active Concept Animation theater
            setMeta({
              type: 'gate',
              branchType,
              condition: rawCond,
              phase: 'testing',
              evalStr: `Evaluating: ${rawCond}`,
            });
            say_(`**Decision Gate (${branchType.toUpperCase()}):** Evaluating condition <code>${esc(rawCond)}</code>...`);
            await sleep(220);

            // Step 2: Compute condition and substituted comparison values
            let subst = '';
            let v = false;
            if (b.c && b.c[0] === 'cmp') {
              const l = await ev(b.c[2], env);
              const r = await ev(b.c[3], env);
              v = cmpop(b.c[1], l, r);
              subst = `${rep(l)} ${b.c[1]} ${rep(r)}`;
            } else {
              v = truthy(await ev(b.c, env));
            }

            // Step 3: Resolved outcome locks in with active portal animation
            setMeta({
              type: 'gate',
              branchType,
              condition: rawCond,
              substCond: subst,
              phase: 'resolved',
              outcome: v,
              evalStr: subst ? `${subst} -> ${v ? 'True' : 'False'}` : `${rawCond} -> ${v ? 'True' : 'False'}`,
            });
            say_(
              `**Decision Gate (${branchType.toUpperCase()}):** Shart <code>${esc(rawCond)}</code>${
                subst ? ` [<code>${esc(subst)}</code>]` : ''
              } = <b style="color:var(--${v ? 'ok' : 'bad'})">${
                v ? 'True' : 'False'
              }</b>. ${v ? 'True Portal OPEN: executing inner block.' : 'Gate BLOCKED: diverting to next branch.'}`
            );
            await sleep(550);
            if (v) return run(b.b, env);
          }
          if (s.els) {
            await gate(s.eln);
            setMeta({
              type: 'gate',
              branchType: 'else',
              condition: 'else (fallback path)',
              substCond: 'Prior checks evaluated to False',
              phase: 'resolved',
              outcome: true,
              evalStr: 'Sabhi shartein False thi -> Default Path',
            });
            say_('**Else Corridor:** Sabhi shartein False thi — default fallback path execute ho raha hai.');
            await sleep(450);
            return run(s.els, env);
          }
          return;
        }
        case 'while': {
          let n = 0;
          while (true) {
            await gate(s.ln);
            const rawCond = (code.value.split('\n')[s.ln] || '').trim().replace(/^while\s+/, '').replace(/:$/, '');
            n++;

            // Step 1: Evaluating loop condition
            setMeta({
              type: 'gate',
              branchType: 'while',
              iteration: n,
              condition: rawCond,
              phase: 'testing',
              evalStr: `Round ${n}: evaluating ${rawCond}`,
            });
            say_(`**While Loop Gate (Round #${n}):** Testing <code>${esc(rawCond)}</code>...`);
            await sleep(200);

            // Step 2: Compute
            let subst = '';
            let v = false;
            if (s.c && s.c[0] === 'cmp') {
              const l = await ev(s.c[2], env);
              const r = await ev(s.c[3], env);
              v = cmpop(s.c[1], l, r);
              subst = `${rep(l)} ${s.c[1]} ${rep(r)}`;
            } else {
              v = truthy(await ev(s.c, env));
            }

            setMeta({
              type: 'gate',
              branchType: 'while',
              iteration: n,
              condition: rawCond,
              substCond: subst,
              phase: 'resolved',
              outcome: v,
              evalStr: `Round ${n}: ${subst || rawCond} -> ${v ? 'True' : 'False'}`,
            });
            say_(
              `**While Loop Gate (Round #${n}):** Shart <code>${esc(rawCond)}</code>${
                subst ? ` [<code>${esc(subst)}</code>]` : ''
              } = <b style="color:var(--${v ? 'ok' : 'bad'})">${v ? 'True' : 'False'}</b>. ${
                v ? 'True Portal OPEN: executing round.' : 'Gate CLOSED: loop finished.'
              }`
            );
            await sleep(500);
            if (!v) break;
            const r = await run(s.b, env);
            if (r) {
              if (r.brk) break;
              if (r.cont) continue;
              return r;
            }
          }
          return;
        }
        case 'for': {
          let it = await ev(s.it, env);
          if (typeof it === 'string') it = [...it];
          if (it && typeof it === 'object' && !Array.isArray(it)) {
            it = Object.keys(it);
          }
          if (!Array.isArray(it)) E('TypeError', `cannot loop over a ${ty(it)}`);
          const items = it.map(rep);
          let r: any;
          for (let k = 0; k < it.length; k++) {
            await gate(s.ln);
            const item = it[k];
            setMeta({
              type: 'loop',
              title: `for ${s.vars && s.vars.length ? s.vars.join(', ') : s.v} in items`,
              items: items.slice(0, 10).map((x: any) => String(x)),
              activeIdx: k,
              val: rep(item),
              round: `${k + 1}/${it.length}`,
            });
            say_(`**Loop Conveyor (Round ${k + 1}/${it.length}):** Item <b>${esc(rep(item))}</b>.`);
            if (s.vars && s.vars.length > 1 && Array.isArray(item)) {
              for (let vi = 0; vi < s.vars.length; vi++) {
                if (vi < item.length) await setVar(env, s.vars[vi], item[vi]);
              }
            } else {
              const varName = s.vars && s.vars.length ? s.vars[0] : s.v;
              await setVar(env, varName, item);
            }
            await sleep(450);
            r = await run(s.b, env);
            if (r) {
              if (r.brk) break;
              if (r.cont) continue;
              return r;
            }
          }
          if (!it.length) say_('Loop collection khali tha, loop aage badh gaya.');
          return;
        }
        case 'try': {
          await gate(s.ln);
          say_('**Try Block:** Protected code execution started.');
          try {
            const r = await run(s.tryBody, env);
            if (r) return r;
          } catch (e: any) {
            if (e === CANCEL) throw e;
            const errType = e instanceof PyErr ? e.t : (e.name || 'Exception');
            const errMsg = e instanceof PyErr ? e.m : (e.message || String(e));
            let handled = false;
            for (const eb of s.exceptBlocks) {
              if (!eb.excType || eb.excType === errType || eb.excType === 'Exception') {
                await gate(eb.ln);
                if (eb.excAs) {
                  await setVar(env, eb.excAs, `${errType}: ${errMsg}`);
                }
                say_(`**Exception Caught (${esc(errType)}):** Handled by except block.`);
                const er = await run(eb.b, env);
                handled = true;
                if (er) return er;
                break;
              }
            }
            if (!handled) throw e;
          } finally {
            if (s.finallyBody) {
              await run(s.finallyBody, env);
            }
          }
          return;
        }
        case 'class': {
          await gate(s.ln);
          const classEnv = { vars: {}, id: ++envN, title: s.n };
          await run(s.b, classEnv);
          const clsMethods: Record<string, any> = { ...classEnv.vars };
          const clsObj = {
            cls: s.n,
            methods: clsMethods,
            call: async (args: any[]) => {
              const instance: any = {
                cls: s.n,
                fields: {},
              };
              if (clsMethods['__init__']) {
                await call(clsMethods['__init__'], [instance, ...args]);
              }
              return instance;
            }
          };
          await setVar(env, s.n, {
            bi: true,
            name: s.n,
            cls: s.n,
            methods: clsMethods,
            f: async (a: any[]) => clsObj.call(a),
          });
          say_(`**Class Defined:** <code>class ${esc(s.n)}</code> registered with methods.`);
          return;
        }
        case 'def': {
          await gate(s.ln);
          setMeta({
            type: 'fusion',
            target: s.n,
            op: '=',
            prevVal: '',
            delta: `def ${s.n}(${s.ps.join(', ')})`,
            newVal: `<function>`,
          });
          say_(`**Function Stored:** Function <b>${esc(s.n)}</b> register hua.`);
          await setVar(env, s.n, { fn: true, name: s.n, ps: s.ps, body: s.b });
          return;
        }
        case 'ret': {
          await gate(s.ln);
          const v = s.e ? await ev(s.e, env) : null;
          setMeta({
            type: 'broadcast',
            text: `return ${rep(v)}`,
          });
          say_(`**Return:** Function sent back <b>${esc(rep(v))}</b>.`);
          await sleep(400);
          return { ret: v };
        }
        case 'break':
          await gate(s.ln);
          say_('**Break:** Loop stopped.');
          return { brk: 1 };
        case 'continue':
          await gate(s.ln);
          say_('**Continue:** Jumping to next iteration.');
          return { cont: 1 };
        case 'pass':
          if (s.imp) return;
          await gate(s.ln);
          return;
      }
    }

    /* ---------- UI References ---------- */
    const LH = 24;
    const edEl = $('.ed')!;
    const code = $('#code') as HTMLTextAreaElement;
    const mark = $('#mark')!;
    const gut = $('#gut')!;
    const screen = $('#screen')!;
    const sayEl = $('#say')!;
    const vesselsEl = $('#vessels')!;
    const stageViewEl = $('#meta-stage-view');

    let mode = 'run';
    let wait: (() => void) | null = null;
    let auto = false;
    let running = false;
    let curSpan: HTMLSpanElement | null = null;
    let curLn = 0;
    let OUTTXT = '';
    let pred: string | null = null;
    let activeSay = '';
    let activeMeta: any = { type: 'idle' };

    interface HistorySnapshot {
      ln: number;
      vars: Record<string, any>;
      stack: any[];
      meta: any;
      say: string;
      terminalHtml: string;
      traceRows: any[];
      traceCols: string[];
      turtleState?: {
        x: number;
        y: number;
        h: number;
        pen: boolean;
        col: string;
        fil: string;
        size: number;
        pts: [number, number][] | null;
        svgLines: string;
      };
      isErr?: boolean;
    }

    let historyFrames: HistorySnapshot[] = [];
    let historyIdx = -1;

    function cloneVal(v: any): any {
      if (v === null || v === undefined) return v;
      if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
      if (v instanceof F) return new F(v.v);
      if (Array.isArray(v)) return v.map(cloneVal);
      if (v && v.fn) return { ...v };
      if (v && v.cls) return { ...v };
      if (v && v.tur) return { ...v };
      if (typeof v === 'object') {
        const o: Record<string, any> = {};
        for (const k in v) o[k] = cloneVal(v[k]);
        return o;
      }
      return v;
    }

    function captureSnapshot(ln: number, isErr = false): HistorySnapshot {
      const varsClone: Record<string, any> = {};
      for (const k in G.vars) {
        varsClone[k] = cloneVal(G.vars[k]);
      }
      const stackClone = stack.map((st) => ({
        id: st.id,
        title: st.title,
        vars: Object.fromEntries(Object.entries(st.vars).map(([k, v]) => [k, cloneVal(v)])),
      }));

      return {
        ln,
        vars: varsClone,
        stack: stackClone,
        meta: activeMeta ? { ...activeMeta } : { type: 'idle' },
        say: activeSay || '',
        terminalHtml: screen.innerHTML,
        traceRows: TR.map((r) => ({ ln: r.ln, snap: { ...r.snap } })),
        traceCols: [...trCols],
        turtleState: {
          x: TS.x,
          y: TS.y,
          h: TS.h,
          pen: TS.pen,
          col: TS.col,
          fil: TS.fil,
          size: TS.size,
          pts: TS.pts ? TS.pts.map((p) => [p[0], p[1]] as [number, number]) : null,
          svgLines: tl.innerHTML,
        },
        isErr,
      };
    }

    function updateStepCounter() {
      const counterEl = $('#step-counter');
      const stepBackBtn = $('#step-back') as HTMLButtonElement | null;
      const stepBtn = $('#step') as HTMLButtonElement | null;
      const total = historyFrames.length;
      const curStep = historyIdx >= 0 ? historyIdx + 1 : 0;
      if (counterEl) {
        counterEl.textContent = `${t.stepCounterLabel} ${curStep} / ${total}`;
      }
      if (stepBackBtn) {
        stepBackBtn.disabled = historyIdx <= 0;
      }
      if (stepBtn) {
        stepBtn.disabled = !running && historyIdx >= total - 1 && total > 0;
      }
    }

    function restoreSnapshot(snap: HistorySnapshot) {
      curLn = snap.ln;
      mark.style.top = 6 + snap.ln * LH + 'px';
      mark.style.opacity = '1';
      if (snap.isErr) mark.classList.add('bad');
      else mark.classList.remove('bad');

      const tPos = 6 + snap.ln * LH;
      if (tPos < edEl.scrollTop) edEl.scrollTop = tPos - 6;
      else if (tPos + LH > edEl.scrollTop + edEl.clientHeight)
        edEl.scrollTop = tPos + LH - edEl.clientHeight + 6;

      G.vars = { ...snap.vars };
      stack = snap.stack.map((s) => ({ ...s, vars: { ...s.vars } }));
      renderVessels();

      screen.innerHTML = snap.terminalHtml;
      screen.scrollTop = screen.scrollHeight;

      TR = snap.traceRows.map((r) => ({ ln: r.ln, snap: { ...r.snap } }));
      trCols = [...snap.traceCols];
      renderTrace();

      if (snap.turtleState) {
        TS.x = snap.turtleState.x;
        TS.y = snap.turtleState.y;
        TS.h = snap.turtleState.h;
        TS.pen = snap.turtleState.pen;
        TS.col = snap.turtleState.col;
        TS.fil = snap.turtleState.fil;
        TS.size = snap.turtleState.size;
        TS.pts = snap.turtleState.pts
          ? snap.turtleState.pts.map((p) => [p[0], p[1]] as [number, number])
          : null;
        tl.innerHTML = snap.turtleState.svgLines;
        sp();
      }

      setMeta(snap.meta);
      activeSay = snap.say;
      if (sayEl) sayEl.innerHTML = snap.say;
    }

    const spd = () => +(($('#spd') as HTMLInputElement)?.value || 1.5);
    const sleep = (ms: number) =>
      (window as any).__fast ? Promise.resolve() : new Promise((r) => setTimeout(r, ms / spd()));

    const say_ = (h: string) => {
      activeSay = h;
      if (sayEl) sayEl.innerHTML = h;
    };

    /* Active Concept Animation (Decision Gates, Loop Orbits, Synthesis Reactors, Broadcasts) */
    function setMeta(data: any) {
      activeMeta = data;
      if (!stageViewEl) return;
      if (data.type === 'gate') {
        const isTrue = !!data.outcome;
        const isTesting = data.phase === 'testing';
        const branchTitle =
          data.branchType === 'elif'
            ? 'ELIF GATE'
            : data.branchType === 'else'
            ? 'ELSE CORRIDOR'
            : data.branchType === 'while'
            ? 'WHILE LOOP GATE'
            : 'DECISION GATE (IF)';

        stageViewEl.innerHTML = `
          <div class="decision-gate-chamber ${isTesting ? 'gate-evaluating' : ''}">
            <div class="gate-eval-header">
              <div class="gate-header-left">
                <span class="gate-badge-label">${branchTitle}</span>
                ${data.iteration ? `<span class="gate-iteration-badge">Round #${data.iteration}</span>` : ''}
              </div>
              <div class="gate-condition-box">
                <span class="gate-eval-expr" title="${esc(data.condition)}">${esc(data.condition)}</span>
                ${
                  data.substCond && data.substCond !== data.condition
                    ? `<span class="gate-eval-subst">[ ${esc(data.substCond)} ]</span>`
                    : ''
                }
                <span class="gate-eval-arrow">-&gt;</span>
                ${
                  isTesting
                    ? `<span class="gate-eval-result res-evaluating">EVALUATING</span>`
                    : `<span class="gate-eval-result ${isTrue ? 'res-true' : 'res-false'}">${
                        isTrue ? 'TRUE' : 'FALSE'
                      }</span>`
                }
              </div>
            </div>

            <div class="gate-visual-arena">
              <div class="gate-input-stream">
                <div class="gate-nexus ${isTesting ? 'nexus-testing' : isTrue ? 'nexus-true' : 'nexus-false'}">
                  <span class="indicator-dot ${isTesting ? 'dot-testing' : isTrue ? 'dot-true' : 'dot-false'}"></span>
                </div>
                <div class="nexus-pulse-label">
                  ${isTesting ? 'EVALUATING' : isTrue ? 'FLOW: TRUE' : 'DIVERT: FALSE'}
                </div>
              </div>

              <div class="gate-fork-tracks">
                <!-- TRUE PORTAL -->
                <div class="gate-portal-card portal-true ${
                  isTesting ? 'testing-portal' : isTrue ? 'chosen-portal' : 'blocked-portal'
                }">
                  <div class="portal-header">
                    <span class="indicator-dot ${isTesting ? 'dot-testing' : isTrue ? 'dot-true' : 'dot-locked'}"></span>
                    <span class="portal-title">True Portal</span>
                    <span class="portal-route-hint">${data.branchType === 'else' ? 'Fallback Block' : 'Indented Block'}</span>
                    <span class="portal-action-pill ${
                      isTesting ? 'pill-testing' : isTrue ? 'pill-open' : 'pill-locked'
                    }">
                      ${isTesting ? 'CHECKING' : isTrue ? 'OPEN' : 'LOCKED'}
                    </span>
                  </div>
                  <div class="portal-beam-track">
                    <div class="portal-beam-flow ${
                      isTesting ? 'flowing-beam-testing' : isTrue ? 'flowing-beam' : ''
                    }"></div>
                  </div>
                </div>

                <!-- FALSE BYPASS -->
                <div class="gate-portal-card portal-false ${
                  isTesting ? 'testing-portal' : !isTrue ? 'chosen-portal' : 'blocked-portal'
                }">
                  <div class="portal-header">
                    <span class="indicator-dot ${isTesting ? 'dot-testing' : !isTrue ? 'dot-false' : 'dot-locked'}"></span>
                    <span class="portal-title">False Bypass</span>
                    <span class="portal-route-hint">${data.branchType === 'else' ? 'No Skip' : 'Next Branch / Skip'}</span>
                    <span class="portal-action-pill ${
                      isTesting ? 'pill-testing' : !isTrue ? 'pill-divert' : 'pill-locked'
                    }">
                      ${isTesting ? 'CHECKING' : !isTrue ? 'BYPASS ACTIVE' : 'UNUSED'}
                    </span>
                  </div>
                  <div class="portal-beam-track">
                    <div class="portal-beam-flow ${
                      isTesting ? '' : !isTrue ? 'flowing-beam-false' : ''
                    }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="gate-footer-note ${isTesting ? 'note-testing' : isTrue ? 'note-true' : 'note-false'}">
              ${
                isTesting
                  ? `Evaluating condition: <code>${esc(data.condition)}</code>...`
                  : isTrue
                  ? `<b>Condition is True:</b> True Portal open — executing indented code block.`
                  : `<b>Condition is False:</b> Branch blocked — bypass route taken (skipping block).`
              }
            </div>
          </div>
        `;
      } else if (data.type === 'loop') {
        const items = data.items || [];
        stageViewEl.innerHTML = `
          <div class="loop-orbit-chamber">
            <div class="loop-header">
              <span class="loop-badge">LOOP CONVEYOR</span>
              <span class="loop-title-text">${esc(data.title)}</span>
              <span class="loop-round-pill">Round ${esc(data.round)}</span>
            </div>
            <div class="loop-stepping-track">
              ${items
                .map(
                  (it: string, idx: number) => `
                <div class="loop-step-node ${idx === data.activeIdx ? 'active-step' : idx < data.activeIdx ? 'done-step' : ''}">
                  <span class="step-num">#${idx + 1}</span>
                  <span class="step-val">${esc(it)}</span>
                </div>
              `
                )
                .join('')}
            </div>
            <div class="loop-current-bar">
              Active Element: <b style="color:var(--num)">${esc(data.val)}</b>
            </div>
          </div>
        `;
      } else if (data.type === 'broadcast') {
        stageViewEl.innerHTML = `
          <div class="broadcast-chamber">
            <div class="broadcast-body">
              <span class="broadcast-badge">BROADCAST TRANSMISSION</span>
              <span class="broadcast-msg">${esc(data.text)}</span>
            </div>
          </div>
        `;
      } else if (data.type === 'fusion') {
        stageViewEl.innerHTML = `
          <div class="fusion-chamber">
            <span class="fusion-badge">SYNTHESIS REACTOR</span>
            <div class="fusion-formula">
              <span class="fusion-target">${esc(data.target)}</span>
              <span class="fusion-op">${esc(data.op)}</span>
              <span class="fusion-delta">${esc(data.delta)}</span>
              <span class="fusion-arrow">-&gt;</span>
              <span class="fusion-result">${esc(data.newVal)}</span>
            </div>
          </div>
        `;
      } else if (data.type === 'call') {
        stageViewEl.innerHTML = `
          <div class="fusion-chamber">
            <span class="fusion-badge">FUNCTION PORTAL</span>
            <div class="fusion-formula">
              <span>${esc(data.fnName)}(${esc(data.args)})</span>
            </div>
          </div>
        `;
      } else {
        // Idle standby
        stageViewEl.innerHTML = `
          <div class="standby-chamber">
            <div class="standby-content">
              <span class="standby-title">Active Concept Animation Theater</span>
              <span class="standby-desc">Conditionals (<code>if/elif/else</code>), Loops, and Prints animate here live.</span>
            </div>
          </div>
        `;
      }
    }

    async function gate(ln: number) {
      if (cur !== gen) throw CANCEL;
      curLn = ln;
      if (++steps > 2500) E('RuntimeError', 'More than 2500 steps executed. Potential infinite loop.', ln);
      mark.style.top = 6 + ln * LH + 'px';
      mark.style.opacity = '1';
      mark.classList.remove('bad');

      const tPos = 6 + ln * LH;
      if (tPos < edEl.scrollTop) edEl.scrollTop = tPos - 6;
      else if (tPos + LH > edEl.scrollTop + edEl.clientHeight)
        edEl.scrollTop = tPos + LH - edEl.clientHeight + 6;

      // Record snapshot into time-travel history
      const snap = captureSnapshot(ln);
      historyFrames.push(snap);
      historyIdx = historyFrames.length - 1;
      updateStepCounter();

      if (mode === 'step') {
        if (auto) auto = false;
        else await new Promise<void>((r) => (wait = r));
        wait = null;
      } else {
        await sleep(Math.max(60, 240 / spd()));
      }
      if (cur !== gen) throw CANCEL;
    }

    /* Professional Memory Entries (Variable Container) */
    function renderVessels(
      activeVarName?: string,
      isNewVar?: boolean,
      incomingVal?: any,
      phase?: 'appearbox' | 'dropping'
    ) {
      renderVesselsRef.current = () => renderVessels();
      if (!vesselsEl) return;
      const env = stack[stack.length - 1];
      const allVars = { ...G.vars, ...env.vars };
      const keys = Object.keys(allVars);

      if (!keys.length) {
        vesselsEl.innerHTML =
          '<div style="color:var(--mute);padding:14px;font-size:14px;font-weight:500">No active memory entries. Assign a variable (e.g. <code>x = 5</code>) to allocate a memory slot.</div>';
        return;
      }

      vesselsEl.innerHTML = keys
        .map((k) => {
          const v = allVars[k];
          const t = ty(v);
          const typeCls =
            t === 'int'
              ? 't-int'
              : t === 'float'
              ? 't-float'
              : t === 'str'
              ? 't-str'
              : t === 'bool'
              ? 't-bool'
              : t === 'list'
              ? 't-list'
              : t === 'function'
              ? 't-func'
              : '';

          const isTarget = activeVarName === k;
          const isAppearBox = isTarget && phase === 'appearbox';
          const isDropping = isTarget && phase === 'dropping';

          let valDisplay = '';
          if (isAppearBox) {
            // When box appears, slot is waiting to receive incoming flying value
            valDisplay = `<div class="waiting-hint">ready for ${esc(t)}</div>`;
          } else if (typeof v === 'string') {
            // Stored with indexes (positive & negative indices for every character)
            const chars = Array.from(v);
            if (chars.length === 0) {
              valDisplay = `<div class="str-index-container"><span class="str-empty">"" (empty str, len 0)</span></div>`;
            } else {
              valDisplay = `
                <div class="str-index-container">
                  <div class="str-index-track">
                    ${chars
                      .map((ch, i) => {
                        const neg = i - chars.length;
                        const charShown =
                          ch === ' '
                            ? '<span class="str-space" title="Space">␣</span>'
                            : ch === '\t'
                            ? '⇥'
                            : ch === '\n'
                            ? '↵'
                            : esc(ch);
                        return `
                          <div class="str-char-cell ${isDropping ? 'cell-drop-in' : ''}" style="animation-delay:${
                          i * 35
                        }ms" title="Index ${i} [or ${neg}]: '${esc(ch)}'">
                            <div class="str-idx-num">${i}</div>
                            <div class="str-char-val">${charShown}</div>
                            <div class="str-idx-neg">${neg}</div>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>
                  <div class="str-meta-footer">
                    <span class="str-len-tag">len: ${chars.length}</span>
                    <span class="str-syntax-tag">${esc(k)}[0] -&gt; '${esc(chars[0])}'</span>
                  </div>
                </div>
              `;
            }
          } else if (Array.isArray(v)) {
            // List with element indexes
            valDisplay = `
              <div class="list-index-track">
                ${
                  v.length
                    ? v
                        .map(
                          (x, i) =>
                            `<div class="list-item-cell ${
                              isDropping && i === v.length - 1 ? 'cell-drop-in' : ''
                            }" title="Index ${i}: ${esc(rep(x))}">
                              <div class="list-idx-num">[${i}]</div>
                              <div class="list-item-val">${esc(typeof x === 'string' ? `"${x}"` : rep(x))}</div>
                            </div>`
                        )
                        .join('')
                    : '<span class="list-empty">empty list []</span>'
                }
              </div>
            `;
          } else {
            valDisplay = `<span class="scalar-value-token ${isDropping ? 'drop-anim' : ''}">${esc(rep(v))}</span>`;
          }

          const fillColors: Record<string, string> = {
            't-int': 'rgba(245, 158, 11, 0.45)',
            't-float': 'rgba(245, 158, 11, 0.45)',
            't-str': 'rgba(168, 85, 247, 0.45)',
            't-bool': 'rgba(16, 185, 129, 0.45)',
            't-list': 'rgba(2, 132, 199, 0.45)',
          };

          const slotClass = isAppearBox
            ? 'slot-waiting'
            : isDropping
            ? 'drop-impact slot-fill-active'
            : '';
          const slotStyle = isDropping
            ? `style="--fill-color:${fillColors[typeCls] || 'rgba(16, 185, 129, 0.45)'}"`
            : '';

          return `
            <div class="mem-box ${typeCls} ${isAppearBox ? 'appear-box targeting-mention' : ''} ${
            isDropping ? 'targeting-mention' : ''
          } ${isDropping && isNewVar ? 'spawn-new' : ''}" data-var="${esc(k)}">
              <div class="mem-head">
                <div class="mem-ident">
                  <span class="mem-var-name" title="${esc(k)}">${esc(k)}</span>
                </div>
                <span class="mem-badge-type">${esc(t)}</span>
              </div>
              <div class="mem-slot ${slotClass}" ${slotStyle}>
                ${(() => {
                  const histList = (memHistoryOnRef.current && varHist[k]) ? varHist[k] : [];
                  const inlineHistoryHtml = histList.length > 0 ? `
                    <div style="display:flex; align-items:center; gap:4px; font-size:11px; opacity:0.35; margin-bottom:4px; flex-wrap:wrap; font-family:'JetBrains Mono',monospace;">
                      ${histList.map(hx => `<span>${esc(rep(hx))}</span>`).join(' <span>-&gt;</span> ')} <span>-&gt;</span>
                    </div>
                  ` : '';
                  return inlineHistoryHtml + `<div style="font-weight:700; font-size:1.15em; color:var(--text);">${valDisplay}</div>`;
                })()}
              </div>
            </div>
          `;
        })
        .join('');
    }

    function spawnDropSparks(x: number, y: number, colorClass: string) {
      const colors: Record<string, string> = {
        'p-num': '#f59e0b',
        'p-str': '#a855f7',
        'p-bool': '#10b981',
        'p-list': '#0284c7',
        'p-term': '#38bdf8',
      };
      const col = colors[colorClass] || '#f59e0b';
      const angles = [0, 60, 120, 180, 240, 300];
      angles.forEach((deg) => {
        const rad = (deg * Math.PI) / 180;
        const dist = 24 + Math.random() * 16;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;
        const spark = document.createElement('div');
        spark.className = 'drop-spark';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.backgroundColor = col;
        spark.style.setProperty('--tx', `${tx}px`);
        spark.style.setProperty('--ty', `${ty}px`);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 500);
      });
    }

    async function setVar(env: any, name: string, v: any) {
      if (cur !== gen) throw CANCEL;
      const isNew = !(name in env.vars) && !(name in G.vars);
      const existingVal = env.vars[name] !== undefined ? env.vars[name] : G.vars[name];
      if (existingVal !== undefined && !eq(existingVal, v)) {
        varHist[name] = varHist[name] || [];
        varHist[name].push(existingVal);
        if (varHist[name].length > 5) varHist[name].shift();
      }
      env.vars[name] = v;

      renderVessels(name, isNew, v);
      if (stack.length === 1) traceAdd();

      const valPreview = typeof v === 'string' ? `"${cut(v, 14)}"` : cut(rep(v), 16);
      say_(
        `**Memory Entry:** Variable <b>${esc(name)}</b> = <code>${esc(valPreview)}</code> memory slot mein set hua.`
      );
    }

    /* Direct Terminal output */
    async function flyToTerminal(text: string, end = '\n') {
      const termBtn = $('#tab-terminal-btn') as HTMLElement;
      if (termBtn) termBtn.click();
      out(text, end);
    }

    /* Terminal Output */
    function out(text: string, end = '\n', err = false, nc = false) {
      if (!curSpan) {
        curSpan = document.createElement('span');
        curSpan.className = 'ln' + (err ? ' err' : '');
        curSpan.innerHTML = '<span class="pr">$</span>';
        curSpan.append(document.createTextNode(''));
        screen.append(curSpan);
      }
      curSpan.lastChild!.textContent += text;
      if (!nc) {
        OUTTXT += text + (end === '\n' ? '\n' : end);
      }
      if (end === '\n' || err) curSpan = null;
      else curSpan.lastChild!.textContent += end;
      screen.scrollTop = screen.scrollHeight;
    }

    function ask(prompt: string): Promise<string> {
      return new Promise((res) => {
        curSpan = null;
        const d = document.createElement('span');
        d.className = 'ln';
        d.innerHTML = '<span class="pr">$</span>';
        d.append(document.createTextNode(prompt));
        const inp = document.createElement('input');
        inp.className = 'ans';
        inp.setAttribute('aria-label', 'Type response');
        d.append(inp);
        screen.append(d);
        inp.focus({ preventScroll: true });
        say_('**Waiting for input:** Terminal me jawab likh kar Enter dabao.');
        inp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            const v = inp.value;
            inp.replaceWith(document.createTextNode(v));
            res(v);
          }
        };
      });
    }

    /* ---------- Turtle Graphics ---------- */
    const TS = { x: 0, y: 0, h: 0, pen: true, col: '#0f172a', fil: '#0f172a', size: 3, pts: null as [number, number][] | null };
    const tl = $('#tl')!;
    const spr = $('#spr')!;
    const sp = () => {
      spr.style.transform = `translate(${200 + TS.x}px,${200 - TS.y}px) rotate(${-TS.h}deg)`;
    };

    function tReset() {
      Object.assign(TS, { x: 0, y: 0, h: 0, pen: true, col: '#0f172a', fil: '#0f172a', size: 3, pts: null });
      if (tl) tl.innerHTML = '';
      if (spr) {
        spr.style.display = '';
        spr.style.transitionDuration = '0s';
        sp();
      }
    }

    const tn = (x: any) => {
      if (!isNb(x)) E('TypeError', 'turtle needs a number, not a ' + ty(x));
      return nv(x);
    };

    function shape(el: SVGElement, at: Record<string, any>, dur: number) {
      for (const k in at) el.setAttribute(k, at[k]);
      el.setAttribute('stroke', TS.col);
      el.setAttribute('stroke-width', String(TS.size));
      el.setAttribute('stroke-linecap', 'round');
      tl.append(el);
    }

    async function seg(nx: number, ny: number) {
      const d = Math.hypot(nx - TS.x, ny - TS.y);
      const dur = Math.max(90, d * 2.5);
      spr.style.transitionDuration = dur / spd() + 'ms';
      if (TS.pen && d > 0) {
        const l = document.createElementNS(NS, 'line');
        shape(l, { x1: 200 + TS.x, y1: 200 - TS.y, x2: 200 + nx, y2: 200 - ny }, dur);
      }
      TS.x = nx;
      TS.y = ny;
      if (TS.pts) TS.pts.push([nx, ny]);
      sp();
      await sleep(dur);
    }

    async function turn(a: number) {
      TS.h = TS.h + a;
      spr.style.transitionDuration = 160 / spd() + 'ms';
      sp();
      await sleep(180);
    }

    const fwd = (d: number) => {
      const r = (TS.h * Math.PI) / 180;
      return seg(TS.x + d * Math.cos(r), TS.y + d * Math.sin(r));
    };

    const TF: Record<string, (a: any[]) => any> = {
      forward: (a) => fwd(tn(a[0])),
      backward: (a) => fwd(-tn(a[0])),
      left: (a) => turn(tn(a[0])),
      right: (a) => turn(-tn(a[0])),
      penup: () => {
        TS.pen = false;
      },
      pendown: () => {
        TS.pen = true;
      },
      goto: (a) => seg(tn(a[0]), tn(a[1])),
      home: async () => {
        await seg(0, 0);
        TS.h = 0;
        sp();
      },
      setheading: async (a) => {
        TS.h = tn(a[0]);
        sp();
        await sleep(150);
      },
      color: (a) => {
        TS.col = str(a[0]);
        TS.fil = str(a[1] !== undefined ? a[1] : a[0]);
      },
      pencolor: (a) => {
        TS.col = str(a[0]);
      },
      fillcolor: (a) => {
        TS.fil = str(a[0]);
      },
      pensize: (a) => {
        TS.size = tn(a[0]);
      },
      begin_fill: () => {
        TS.pts = [[TS.x, TS.y]];
      },
      end_fill: () => {
        if (TS.pts && TS.pts.length > 2) {
          const p = document.createElementNS(NS, 'polygon');
          p.setAttribute('points', TS.pts.map((q) => `${200 + q[0]},${200 - q[1]}`).join(' '));
          p.setAttribute('fill', TS.fil);
          p.setAttribute('opacity', '.75');
          tl.insertBefore(p, tl.firstChild);
        }
        TS.pts = null;
      },
      circle: async (a) => {
        const r = tn(a[0]);
        const h = ((TS.h + 90) * Math.PI) / 180;
        const c = document.createElementNS(NS, 'circle');
        shape(c, { cx: 200 + TS.x + r * Math.cos(h), cy: 200 - TS.y - r * Math.sin(h), r: Math.abs(r), fill: 'none' }, 500);
        await sleep(500);
      },
      dot: (a) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', String(200 + TS.x));
        c.setAttribute('cy', String(200 - TS.y));
        c.setAttribute('r', String((a.length ? tn(a[0]) : 8) / 2));
        c.setAttribute('fill', TS.col);
        tl.append(c);
      },
      write: (a) => {
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(200 + TS.x));
        t.setAttribute('y', String(200 - TS.y));
        t.setAttribute('fill', TS.col);
        t.setAttribute('font-size', '16');
        t.textContent = str(a[0]);
        tl.append(t);
      },
      hideturtle: () => {
        spr.style.display = 'none';
      },
      showturtle: () => {
        spr.style.display = '';
      },
      clear: () => {
        tl.innerHTML = '';
      },
    };

    Object.assign(TF, {
      fd: TF.forward,
      bk: TF.backward,
      back: TF.backward,
      lt: TF.left,
      rt: TF.right,
      up: TF.penup,
      pu: TF.penup,
      down: TF.pendown,
      pd: TF.pendown,
      setpos: TF.goto,
      seth: TF.setheading,
      width: TF.pensize,
      ht: TF.hideturtle,
      st: TF.showturtle,
    });

    const DEFAULT =
      'total = 0\nfor i in range(1, 6):\n    if i % 2 == 0:\n        print(i, "even hai")\n    else:\n        print(i, "odd hai")\n    total += i\nprint("Total:", total)';

    /* Curriculum Examples */
    const U: Array<[string, string, string]> = [
      [
        '1 Variables',
        'Variable ek living vessel hai jisme number, text ya true/false ki energy rehti hai.',
        'name = "Mia"\nage = 15\nheight = 1.62\nis_student = True\nprint(name, age, height, is_student)\nprint(type(name), type(age))\nprint(type(height), type(is_student))',
      ],
      [
        '2 Operators',
        'Arithmetic reactor: do elements fuse hokar nayi value banate hain.',
        'a = 17\nb = 5\nprint("a + b =", a + b)\nprint("a - b =", a - b)\nprint("a * b =", a * b)\nprint("a / b =", a / b)\nprint("a // b =", a // b)\nprint("a % b =", a % b)\nprint("a ** 2 =", a ** 2)',
      ],
      [
        '3 Casting',
        'Alchemical transformation: text ka number me badlav.',
        'text = "25"\nprint(type(text))\nnumber = int(text)\nprint(type(number))\ntotal = number + 5\nprint("Total:", total)\nmsg = "Age: " + str(number)\nprint(msg)\nprice = float("9.5")\nprint(price, type(price))',
      ],
      [
        '4 if / elif',
        'Decision Gate: shart sach hone par hara path khulta hai.',
        'marks = 72\nif marks >= 90:\n    print("Grade A")\nelif marks >= 70:\n    print("Grade B")\nelif marks >= 50:\n    print("Grade C")\nelse:\n    print("Try again")',
      ],
      [
        '5 for loop',
        'Conveyor Wheel: har item line se aage badhta hai.',
        'for i in range(1, 6):\n    print(i, "x 3 =", i * 3)\ntotal = 0\nfor n in [4, 8, 15]:\n    total = total + n\nprint("Total:", total)',
      ],
      [
        '6 while loop',
        'Samay Chakra: jab tak shart sach hai, cycle chalti rahegi.',
        'count = 3\nwhile count > 0:\n    print("Countdown:", count)\n    count = count - 1\nprint("Go!")',
      ],
      [
        '7 Strings',
        'Text ke aksharon ki mala aur slicing.',
        'word = "Python"\nprint(len(word), word[0], word[-1], word[0:3])\nprint(word.upper(), word.lower())\nmsg = "  hello world  "\nprint(msg.strip().title())\nprint(msg.replace("world", "class"))\nprint("o" in word, word.count("t"), word.find("th"))',
      ],
      [
        '8 Lists',
        'Linked capsules: items ko jodna, nikalna aur sort karna.',
        'fruits = ["apple", "banana"]\nfruits.append("mango")\nprint(fruits, len(fruits))\nprint(fruits[0], fruits[-1])\nfruits.remove("banana")\nfor f in fruits:\n    print("I like", f)\nnums = [5, 2, 9]\nnums.sort()\nprint(nums, sum(nums), max(nums))',
      ],
      [
        '9 Functions',
        'Sub-Chamber Portal: def se chamber banao aur return se jawab bhejo.',
        'def greet(name):\n    print("Hello", name)\ndef add(a, b):\n    return a + b\ngreet("Mia")\nresult = add(3, 4)\nprint("Sum:", result)',
      ],
      [
        '10 Turtle: Square',
        'Creative Canvas: turtle creature geometric canvas par draw karta hai.',
        'import turtle\nt = turtle.Turtle()\nt.penup()\nt.goto(-50, -50)\nt.pendown()\nfor i in range(4):\n    t.forward(100)\n    t.left(90)',
      ],
      [
        '11 Turtle: Shapes',
        'Rectangle and triangle creation.',
        'import turtle\nt = turtle.Turtle()\nt.penup()\nt.goto(-150, 40)\nt.pendown()\nfor i in range(2):\n    t.forward(150)\n    t.right(90)\n    t.forward(70)\n    t.right(90)\nt.penup()\nt.goto(60, -120)\nt.pendown()\nt.color("purple")\nfor i in range(3):\n    t.forward(100)\n    t.left(120)',
      ],
      [
        '12 Turtle: Star',
        'Golden Star Geometry.',
        'import turtle\nt = turtle.Turtle()\nt.penup()\nt.goto(-60, 40)\nt.pendown()\nt.color("goldenrod")\nt.begin_fill()\nfor i in range(5):\n    t.forward(120)\n    t.right(144)\nt.end_fill()',
      ],
      [
        '13 Recursion',
        'Chamber within Chamber: function portal jo khud ko wapas bulata hai.',
        'def fact(n):\n    if n == 1:\n        return 1\n    return n * fact(n - 1)\nprint(fact(4))',
      ],
    ];

    function highlightPython(text: string): string {
      const escHtml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const lines = text.split('\n');
      return lines
        .map((line) => {
          let out = '';
          let pos = 0;
          while (pos < line.length) {
            // 1. Comments
            if (line[pos] === '#') {
              out += `<span class="vsc-comment">${escHtml(line.slice(pos))}</span>`;
              pos = line.length;
              break;
            }

            // 2. Decorators: @identifier
            if (line[pos] === '@') {
              const decMatch = /^@[A-Za-z_]\w*/.exec(line.slice(pos));
              if (decMatch) {
                out += `<span class="vsc-fn">${escHtml(decMatch[0])}</span>`;
                pos += decMatch[0].length;
                continue;
              }
            }

            // 3. String literals (including f, r, b, triple quotes, single/double quotes)
            const strMatch = /^([fFrRbBuU]{0,2})("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/.exec(line.slice(pos));
            if (strMatch) {
              const prefix = strMatch[1];
              const rawStr = strMatch[2];
              const isFString = /[fF]/.test(prefix);
              if (prefix) {
                out += `<span class="vsc-kw">${escHtml(prefix)}</span>`;
              }
              if (isFString && rawStr.includes('{') && rawStr.includes('}')) {
                const quoteChar = rawStr[0];
                out += `<span class="vsc-str">${escHtml(quoteChar)}</span>`;
                const inner = rawStr.slice(1, -1);
                let inBrace = false;
                let braceBuf = '';
                for (let chIdx = 0; chIdx < inner.length; chIdx++) {
                  const ch = inner[chIdx];
                  if (ch === '{' && inner[chIdx + 1] !== '{') {
                    inBrace = true;
                    out += `<span class="vsc-op">{</span>`;
                    braceBuf = '';
                  } else if (ch === '}' && inBrace) {
                    inBrace = false;
                    out += `<span class="vsc-id">${escHtml(braceBuf)}</span>`;
                    out += `<span class="vsc-op">}</span>`;
                  } else if (inBrace) {
                    braceBuf += ch;
                  } else {
                    out += `<span class="vsc-str">${escHtml(ch)}</span>`;
                  }
                }
                out += `<span class="vsc-str">${escHtml(quoteChar)}</span>`;
              } else {
                out += `<span class="vsc-str">${escHtml(rawStr)}</span>`;
              }
              pos += strMatch[0].length;
              continue;
            }

            // 4. Numbers (hex, binary, float, int)
            const numMatch = /^(0[xX][0-9a-fA-F]+|0[bB][01]+|\d+\.\d+(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+)/.exec(line.slice(pos));
            if (numMatch) {
              out += `<span class="vsc-num">${escHtml(numMatch[0])}</span>`;
              pos += numMatch[0].length;
              continue;
            }

            // 5. Identifiers, Keywords, Builtins
            const wordMatch = /^[A-Za-z_]\w*/.exec(line.slice(pos));
            if (wordMatch) {
              const word = wordMatch[0];
              const afterWord = line.slice(pos + word.length);
              const isFollowedByParen = /^\s*\(/.test(afterWord);
              const beforeWord = line.slice(0, pos);
              const isDef = /\bdef\s+$/.test(beforeWord);
              const isClass = /\bclass\s+$/.test(beforeWord);

              if (isDef) {
                out += `<span class="vsc-fn font-semibold">${escHtml(word)}</span>`;
              } else if (isClass) {
                out += `<span class="vsc-class font-semibold">${escHtml(word)}</span>`;
              } else if (/^(True|False|None)$/.test(word)) {
                out += `<span class="vsc-bool">${escHtml(word)}</span>`;
              } else if (/^(def|class|return|import|from|as|global|nonlocal|lambda|yield|async|await)$/.test(word)) {
                out += `<span class="vsc-decl">${escHtml(word)}</span>`;
              } else if (/^(if|elif|else|while|for|in|break|continue|pass|try|except|finally|raise|with|assert|is|not|and|or)$/.test(word)) {
                out += `<span class="vsc-kw">${escHtml(word)}</span>`;
              } else if (/^(self|cls)$/.test(word)) {
                out += `<span class="vsc-self">${escHtml(word)}</span>`;
              } else if (/^(print|input|len|range|int|str|float|bool|list|dict|set|tuple|abs|round|min|max|sum|sorted|enumerate|zip|type|all|any|map|filter|open|ord|chr|bin|hex|oct|format|dir|help|exit|quit|pow)$/.test(word)) {
                out += `<span class="vsc-builtin">${escHtml(word)}</span>`;
              } else if (isFollowedByParen) {
                out += `<span class="vsc-fn">${escHtml(word)}</span>`;
              } else {
                out += `<span class="vsc-id">${escHtml(word)}</span>`;
              }
              pos += word.length;
              continue;
            }

            // 6. Operators & Delimiters
            const opMatch = /^(\*\*|\/\/=?|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|[-+*\/%()\[\]{},:.=<>|&^~])/.exec(line.slice(pos));
            if (opMatch) {
              const op = opMatch[0];
              if (/[()\[\]{},:.]/.test(op)) {
                out += `<span class="vsc-punct">${escHtml(op)}</span>`;
              } else {
                out += `<span class="vsc-op">${escHtml(op)}</span>`;
              }
              pos += op.length;
              continue;
            }

            // 7. Plain character (spaces, tabs, symbols)
            out += escHtml(line[pos]);
            pos++;
          }
          return out;
        })
        .join('\n');
    }

    const exSelect = $('#ex') as HTMLSelectElement;
    if (exSelect && exSelect.options.length <= 1) {
      CURRICULUM_MODULES.forEach((mod) => {
        const og = document.createElement('optgroup');
        og.label = `Module ${mod.moduleNumber}: ${mod.title}`;
        mod.topics.forEach((top) => {
          const o = document.createElement('option');
          o.value = top.id;
          o.textContent = `${top.topicNumber} ${top.title}`;
          og.append(o);
        });
        exSelect.append(og);
      });
      exSelect.onchange = () => {
        const topId = exSelect.value;
        if (!topId) return;
        for (const m of CURRICULUM_MODULES) {
          const found = m.topics.find((t) => t.id === topId);
          if (found) {
            code.value = found.guide.codeExample;
            updateHighlight();
            reset();
            say_('**Topic ' + found.topicNumber + ':** ' + found.intro.summary);
            break;
          }
        }
      };
    }

    /* Trace Table & Variable History */
    let TR: Array<{ ln: number; snap: Record<string, string> }> = [];
    let trCols: string[] = [];
    let varHist: Record<string, any[]> = {};

    function traceAdd() {
      const snap: Record<string, string> = {};
      for (const k in G.vars) {
        const v = G.vars[k];
        if (v && v.fn) continue;
        snap[k] = rep(v);
      }
      Object.keys(snap).forEach((k) => {
        if (!trCols.includes(k)) trCols.push(k);
      });
      TR.push({ ln: curLn, snap });
      if (TR.length > 60) TR.shift();
      renderTrace();
    }

    function renderTrace() {
      const p = $('#tr');
      if (!p) return;
      if (!TR.length) {
        p.innerHTML = '<div style="color:#64748b;padding:12px;font-size:13px">Trace table khali hai. Run karo: state change yahan record hogi.</div>';
        return;
      }
      p.innerHTML =
        '<table id="tt"><thead><tr><th>#</th><th>line</th>' +
        trCols.map((c) => `<th>${esc(c)}</th>`).join('') +
        '</tr></thead><tbody>' +
        TR.map((r, i) => {
          const pv = i ? TR[i - 1].snap : {};
          return `<tr><td>${i + 1}</td><td>${r.ln + 1}</td>${trCols
            .map((c) => {
              const v = r.snap[c];
              return `<td class="${v !== undefined && v !== pv[c] ? 'ch' : ''}">${v === undefined ? '' : esc(v)}</td>`;
            })
            .join('')}</tr>`;
        }).join('') +
        '</tbody></table>';
      p.scrollTop = p.scrollHeight;
    }

    const lnOf = (e: any) => {
      if (e.ln !== undefined) return e.ln;
      const m = (e.m || '').match(/line (\d+)/);
      return m ? +m[1] - 1 : undefined;
    };

    function liveErr(e: any) {
      const ln = lnOf(e);
      if (ln !== undefined) {
        mark.style.top = 6 + ln * LH + 'px';
        mark.style.opacity = '1';
        mark.classList.add('bad');
      }
      say_(`**Error (${esc(e.t || 'Error')})**: ${esc(e.m || 'Kuch gadbad hui')}`);
    }

    const norm = (s: any) =>
      String(s)
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .join('\n');

    function doneMsg() {
      if (pred === null) return lang === 'urdulish' ? '**Mukammal:** Code kamyabi se execute ho gaya.' : '**Finished:** Execution sequence complete.';
      const ok = norm(OUTTXT) === norm(pred);
      pred = null;
      return ok
        ? (lang === 'urdulish' ? '**Sahi Andaza!** Output andazay ke bilkul mutabiq hai.' : '**Prediction Correct!** Output matches prediction.')
        : (lang === 'urdulish' ? '**Ghalat Andaza:** Terminal output ke sath mawazna karein.' : '**Prediction Mismatch:** Compare with terminal output.');
    }

    function drawGut() {
      const n = code.value.split('\n').length;
      gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
      const targetH = Math.max(n * LH + 16, edEl.clientHeight || 200) + 'px';
      code.style.height = targetH;
      if (highlightEl) highlightEl.style.height = targetH;
      const hasTurtle = /\bturtle\b/.test(code.value);
      if (hasTurtle) {
        setActiveTab('turtle');
      }
    }

    function reset() {
      gen++;
      if (wait) wait();
      wait = null;
      running = false;
      steps = 0;
      historyFrames = [];
      historyIdx = -1;
      updateStepCounter();
      G.vars = {};
      stack = [G];
      envN = 0;
      curSpan = null;
      mark.style.opacity = '0';
      screen.innerHTML = '';
      tReset();
      renderVessels();
      TR = [];
      trCols = [];
      varHist = {};
      renderTrace();
      OUTTXT = '';
      setMeta({ type: 'idle' });
      say_(lang === 'urdulish' ? '**Python Studio:** Code likhein aur **Run Karein** ya **Agay** dabayein.' : '**Python Studio:** Enter code and press **Run** or **Step**.');
      drawGut();
    }

    async function start(m: string, src: string) {
      reset();
      cur = gen;
      mode = m;
      auto = m === 'step';
      running = true;
      updateStepCounter();
      out('python main.py', '\n', false, true);
      try {
        const prog = parseProgram(src);
        await run(prog, G);
        if (cur === gen) {
          curSpan = null;
          mark.style.opacity = '0';
          const finMsg = doneMsg();
          say_(finMsg);
          const endSnap = captureSnapshot(curLn);
          endSnap.say = finMsg;
          historyFrames.push(endSnap);
          historyIdx = historyFrames.length - 1;
          updateStepCounter();
        }
      } catch (e: any) {
        if (e === CANCEL) return;
        curSpan = null;
        const errType = e instanceof PyErr ? e.t : (e.name || 'RuntimeError');
        const errMsg = e instanceof PyErr ? e.m : (e.message || String(e));
        const ln = lnOf(e);
        out('Traceback (most recent call last):', '\n', true, true);
        out(`  File "main.py"${ln !== undefined ? ', line ' + (ln + 1) : ''}`, '\n', true, true);
        out(`${errType}: ${errMsg}`, '\n', true);
        liveErr({ t: errType, m: errMsg, ln });
        const errSnap = captureSnapshot(ln !== undefined ? ln : 0, true);
        errSnap.say = `**Error (${esc(errType)})**: ${esc(errMsg)}`;
        historyFrames.push(errSnap);
        historyIdx = historyFrames.length - 1;
        updateStepCounter();
      } finally {
        if (cur === gen) running = false;
        updateStepCounter();
      }
    }

    const runBtn = $('#run');
    if (runBtn) {
      runBtn.onclick = () => {
        if (running) {
          if (mode === 'step') {
            mode = 'run';
            if (historyIdx < historyFrames.length - 1) {
              historyIdx = historyFrames.length - 1;
              restoreSnapshot(historyFrames[historyIdx]);
            }
            if (wait) wait();
            return;
          }
          mode = 'step';
          return;
        }
        const prInput = $('#pr') as HTMLInputElement;
        if (prInput?.checked) {
          const pt = $('#pt') as HTMLTextAreaElement;
          if (pt) pt.value = '';
          $('#pred')?.classList.add('on');
          pt?.focus();
        } else {
          start('run', code.value);
        }
      };
    }

    const pgoBtn = $('#pgo');
    if (pgoBtn) {
      pgoBtn.onclick = () => {
        const pt = $('#pt') as HTMLTextAreaElement;
        pred = pt ? pt.value : '';
        $('#pred')?.classList.remove('on');
        start('run', code.value);
      };
    }

    const pnoBtn = $('#pno');
    if (pnoBtn) {
      pnoBtn.onclick = () => $('#pred')?.classList.remove('on');
    }

    const clrBtn = $('#clr');
    if (clrBtn) {
      clrBtn.onclick = () => {
        screen.innerHTML = '';
        curSpan = null;
      };
    }

    const stepBackBtn = $('#step-back');
    if (stepBackBtn) {
      stepBackBtn.onclick = () => {
        if (running && mode === 'run') {
          mode = 'step';
        }
        if (historyIdx > 0) {
          historyIdx--;
          restoreSnapshot(historyFrames[historyIdx]);
          updateStepCounter();
        }
      };
    }

    const stepBtn = $('#step');
    if (stepBtn) {
      stepBtn.onclick = () => {
        if (historyIdx < historyFrames.length - 1) {
          historyIdx++;
          restoreSnapshot(historyFrames[historyIdx]);
          updateStepCounter();
          return;
        }

        if (running) {
          mode = 'step';
          if (wait) wait();
        } else {
          start('step', code.value);
        }
      };
    }

    const resetBtn = $('#reset');
    if (resetBtn) {
      resetBtn.onclick = reset;
    }

    const VOID_TAGS = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    const highlightEl = $('#code-highlight');
    const updateHighlight = () => {
      if (highlightEl) {
        highlightEl.innerHTML = highlightPython(code.value);
      }
    };

    const handleInput = () => {
      updateHighlight();
      drawGut();
      reset();
    };

    const handleScroll = () => {
      if (highlightEl) {
        highlightEl.scrollTop = edEl.scrollTop;
        highlightEl.scrollLeft = edEl.scrollLeft;
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const active = autoTagCloserRef.current;
      const start = code.selectionStart;
      const end = code.selectionEnd;
      const val = code.value;

      // 1. Tab key always indents 4 spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        code.setRangeText('    ', start, end, 'end');
        reset();
        return;
      }

      if (!active) return;

      // 2. Auto Tag Closer: typing '>' after an opening tag <tag> or <tag attr="val">
      if (e.key === '>') {
        if (start === end) {
          // If cursor is directly before existing '>', just step over it
          if (val[start] === '>') {
            e.preventDefault();
            code.selectionStart = code.selectionEnd = start + 1;
            return;
          }

          const textBefore = val.slice(0, start);
          // Match opening tag: <tag-name or <tag-name ...
          const openTagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9-:]*)(?:\s+[^<>]*)?$/);
          if (openTagMatch) {
            const fullMatch = openTagMatch[0];
            const tagName = openTagMatch[1];
            const trimmed = fullMatch.trim();

            // Ignore if it's a closing tag </..., self-closing />, or a void HTML element
            if (!fullMatch.startsWith('</') && !trimmed.endsWith('/') && !VOID_TAGS.has(tagName.toLowerCase())) {
              e.preventDefault();
              const insertText = `></${tagName}>`;
              code.setRangeText(insertText, start, end, 'preserve');
              code.selectionStart = code.selectionEnd = start + 1; // cursor right between > and </
              reset();
              return;
            }
          }
        }
      }

      // 3. Auto Tag Closer: typing '/' right after '<' (i.e. typing '</')
      if (e.key === '/') {
        if (start === end && start > 0 && val[start - 1] === '<') {
          const textBefore = val.slice(0, start - 1);
          const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9-:]*)(?:\s+[^<>]*)?(\/?)>/g;
          const stack: string[] = [];
          let m: RegExpExecArray | null;
          while ((m = tagRegex.exec(textBefore)) !== null) {
            const isClosing = m[0].startsWith('</');
            const isSelfClose = m[2] === '/' || VOID_TAGS.has(m[1].toLowerCase());
            if (isSelfClose) continue;
            if (isClosing) {
              if (stack.length > 0 && stack[stack.length - 1].toLowerCase() === m[1].toLowerCase()) {
                stack.pop();
              }
            } else {
              stack.push(m[1]);
            }
          }
          if (stack.length > 0) {
            const unclosedTag = stack.pop()!;
            e.preventDefault();
            code.setRangeText(`/${unclosedTag}>`, start, end, 'end');
            reset();
            return;
          }
        }
      }

      // 4. Auto Pair Closer: brackets, braces, and quotes
      const PAIRS: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'",
        '`': '`',
      };

      // Step over existing closing char if typed directly before it
      if ([']', ')', '}', '"', "'", '`'].includes(e.key)) {
        if (start === end && val[start] === e.key) {
          if (!(['"', "'", '`'].includes(e.key) && start > 0 && val[start - 1] === '\\')) {
            e.preventDefault();
            code.selectionStart = code.selectionEnd = start + 1;
            return;
          }
        }
      }

      // Wrap selected text or insert matching pair
      if (PAIRS[e.key]) {
        const openChar = e.key;
        const closeChar = PAIRS[openChar];

        if (start !== end) {
          e.preventDefault();
          const selected = val.slice(start, end);
          code.setRangeText(`${openChar}${selected}${closeChar}`, start, end, 'select');
          code.selectionStart = start + 1;
          code.selectionEnd = end + 1;
          reset();
          return;
        } else {
          // If quote typed right after a word character, don't auto-close (avoids interfering with contractions)
          if (['"', "'"].includes(openChar) && start > 0 && /\w/.test(val[start - 1])) {
            return;
          }
          e.preventDefault();
          code.setRangeText(`${openChar}${closeChar}`, start, end, 'preserve');
          code.selectionStart = code.selectionEnd = start + 1;
          reset();
          return;
        }
      }

      // Wrap selection with < > when typing '<'
      if (e.key === '<' && start !== end) {
        e.preventDefault();
        const selected = val.slice(start, end);
        code.setRangeText(`<${selected}>`, start, end, 'select');
        code.selectionStart = start + 1;
        code.selectionEnd = end + 1;
        reset();
        return;
      }

      // 5. Backspace between empty pairs
      if (e.key === 'Backspace' && start === end && start > 0) {
        const prev = val[start - 1];
        const next = val[start];
        const isPair =
          (prev === '(' && next === ')') ||
          (prev === '[' && next === ']') ||
          (prev === '{' && next === '}') ||
          (prev === '"' && next === '"') ||
          (prev === "'" && next === "'") ||
          (prev === '`' && next === '`');

        if (isPair) {
          e.preventDefault();
          code.setRangeText('', start - 1, start + 1, 'start');
          reset();
          return;
        }
      }

      // 6. Enter key inside empty pairs or between tags: auto-indent
      if (e.key === 'Enter' && start === end) {
        const prevChar = val[start - 1];
        const nextTwo = val.slice(start, start + 2);

        const lastNewline = val.lastIndexOf('\n', start - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const currentLine = val.slice(lineStart, start);
        const indentMatch = currentLine.match(/^\s*/);
        const currentIndent = indentMatch ? indentMatch[0] : '';

        const isBetweenTags = prevChar === '>' && nextTwo === '</';
        const isBetweenBrackets =
          (prevChar === '{' && val[start] === '}') ||
          (prevChar === '[' && val[start] === ']') ||
          (prevChar === '(' && val[start] === ')');

        if (isBetweenTags || isBetweenBrackets) {
          e.preventDefault();
          const insert = `\n${currentIndent}    \n${currentIndent}`;
          code.setRangeText(insert, start, end, 'preserve');
          code.selectionStart = code.selectionEnd = start + 1 + currentIndent.length + 4;
          reset();
          return;
        } else if (currentIndent.length > 0 || currentLine.trim().endsWith(':')) {
          const extraIndent = currentLine.trim().endsWith(':') ? '    ' : '';
          e.preventDefault();
          const insert = `\n${currentIndent}${extraIndent}`;
          code.setRangeText(insert, start, end, 'end');
          reset();
          return;
        }
      }
    };

    code.addEventListener('input', handleInput);
    code.addEventListener('scroll', handleScroll);
    edEl.addEventListener('scroll', handleScroll);
    code.addEventListener('keydown', handleKeydown);

    loadCodeRef.current = (codeStr: string, autoRun = false) => {
      if (!code) return;
      code.value = codeStr;
      updateHighlight();
      drawGut();
      reset();
      setViewMode('studio');
      if (autoRun) {
        setTimeout(() => {
          start('run', codeStr);
        }, 150);
      }
    };

    code.value = DEFAULT;
    updateHighlight();
    drawGut();
    reset();

    return () => {
      gen++;
      if (wait) wait();
      code.removeEventListener('input', handleInput);
      code.removeEventListener('scroll', handleScroll);
      edEl.removeEventListener('scroll', handleScroll);
      code.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-screen h-[100dvh] w-full overflow-hidden transition-colors duration-200 ${
        theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#090e17] text-slate-100'
      }`}
    >
      {/* Universal Navigation Header */}
      <header className="tb justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <b className={`tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Python Practice Lab
          </b>
          <div
            className={`flex items-center p-1 rounded-full border ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-[#10192a] border-slate-700/80'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition ${
                viewMode === 'curriculum'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 bg-transparent border-0'
                  : 'text-slate-300 hover:text-white bg-transparent border-0'
              }`}
            >
              {t.curriculumBtn}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition ${
                viewMode === 'studio'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 bg-transparent border-0'
                  : 'text-slate-300 hover:text-white bg-transparent border-0'
              }`}
            >
              {t.studioBtn}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'studio' ? (
            <>
              <select id="ex" aria-label="Curriculum Topics" style={{ maxWidth: '240px' }}>
                <option value="">{t.chooseTopic}</option>
              </select>
              <button className="go" id="run" title="Run / Play / Pause">
                {t.runBtn}
              </button>
              <button id="step-back" title="Step Backward">
                {t.stepBackBtn}
              </button>
              <button id="step" title="Step Forward">
                {t.stepBtn}
              </button>
              <span id="step-counter" title="Current Step / Total Steps">
                {t.stepCounterLabel} 0 / 0
              </span>
              <button id="reset" title="Reset">{t.resetBtn}</button>
              <label className={`ck text-xs ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <input type="checkbox" id="pr" /> {t.predictLabel}
              </label>
              <label className={`ck text-xs ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                {t.speedLabel} <input type="range" id="spd" min="0.5" max="5" step="0.5" defaultValue="1.5" />
              </label>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow"
            >
              {t.openStudioBtn}
            </button>
          )}

          {/* Language Switcher */}
          <div
            className={`flex items-center p-0.5 rounded-full border text-xs font-bold ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-800 border-slate-700'
            }`}
            title="Language (Zaban): English or Urdulish (Roman Urdu)"
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                lang === 'en'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 bg-transparent border-0'
                  : 'text-slate-300 hover:text-white bg-transparent border-0'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('urdulish')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                lang === 'urdulish'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 bg-transparent border-0'
                  : 'text-slate-300 hover:text-white bg-transparent border-0'
              }`}
            >
              Urdulish
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`text-xs px-3 py-1.5 rounded-full font-bold border transition ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle Light or Dark Mode"
          >
            {theme === 'light' ? t.darkMode : t.lightMode}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* Curriculum Page View */}
        <div
          style={{ display: viewMode === 'curriculum' ? 'block' : 'none' }}
          className="h-full w-full overflow-hidden"
        >
          <CurriculumPage
            theme={theme}
            lang={lang}
            onLoadCodeIntoStudio={(code) => loadCodeRef.current(code, true)}
            onCloseToStudio={() => setViewMode('studio')}
          />
        </div>

        {/* Python Studio Interactive Workspace */}
        <div
          style={{ display: viewMode === 'studio' ? 'grid' : 'none' }}
          className="app"
        >
          {/* Sub Toolbar when in Studio */}
          <div className="tb" style={{ background: theme === 'light' ? '#f1f5f9' : '#111a2c', padding: '6px 16px', fontSize: '13px', borderBottom: theme === 'light' ? '1px solid #e2e8f0' : '1px solid #1e293b' }}>
            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Workspace:</span>
            <span className="text-xs font-semibold text-emerald-500">{t.workspaceVisualizer}</span>
            <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-600'}>|</span>
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={`text-xs px-2.5 py-0.5 rounded-md border ${
                theme === 'light'
                  ? 'text-slate-700 hover:text-slate-900 bg-white border-slate-300'
                  : 'text-slate-300 hover:text-white bg-slate-800 border-slate-700'
              }`}
            >
              {t.browseLessons}
            </button>
          </div>

          {/* Editor & Metaphor Arena */}
          <div className="work">
            <aside className="edp">
              <div className="tab-bar">
                <div className="tab">main.py</div>
                <button
                  type="button"
                  className={`auto-closer-toggle ${autoTagCloser ? 'on' : ''}`}
                  onClick={() => setAutoTagCloser((prev) => !prev)}
                  title="Toggle Auto Tag Closer and Auto Pair Closer"
                >
                  Auto Tag Closer: {autoTagCloser ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="ed">
                <div className="mark" id="mark" />
                <div className="gut" id="gut" />
                <pre id="code-highlight" aria-hidden="true"></pre>
                <textarea id="code" spellCheck={false} wrap="off" aria-label="Python code editor" />
              </div>
            </aside>

            <main className="viz">
              {/* Mascot Guidance */}
              <div className="mascot">
                <div id="say"></div>
              </div>

              {/* Living Metaphor Theater */}
              <div className="meta-theater">
                {/* Concept Stage (Dynamic Metaphor Action) */}
                <div className="meta-stage">
                  <div className="stage-title">
                    <span>{t.activeConceptAnimation}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mute)' }}>
                      Decision Gates · Orbit Loops · Fusion Streams
                    </span>
                  </div>
                  <div className="stage-view" id="meta-stage-view"></div>
                </div>

                {/* Professional Memory Entries Deck */}
                <div className="meta-vessels-deck">
                  <div className="stage-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span>{t.liveMemoryEntries}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mute)', marginLeft: '8px' }}>
                        Target Mention {'->'} Value Drop Animation
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`auto-closer-toggle ${memHistoryOn ? 'on' : ''}`}
                      onClick={() => {
                        setMemHistoryOn((prev) => {
                          const next = !prev;
                          setTimeout(() => renderVesselsRef.current(), 10);
                          return next;
                        });
                      }}
                      title="Toggle Variable History Breadcrumbs"
                    >
                      History: {memHistoryOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="vessels-grid" id="vessels"></div>
                </div>
              </div>
            </main>
          </div>

          {/* Output Deck — Always Stays Black */}
          <div className="term-deck">
            <div className="deck-tabs">
              <button
                id="tab-terminal-btn"
                className={`deck-tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveTab('terminal')}
              >
                {t.terminalTab}
              </button>
              <button
                className={`deck-tab-btn ${activeTab === 'trace' ? 'active' : ''}`}
                onClick={() => setActiveTab('trace')}
              >
                {t.traceTab}
              </button>
              <button
                className={`deck-tab-btn ${activeTab === 'turtle' ? 'active' : ''}`}
                onClick={() => setActiveTab('turtle')}
              >
                {t.turtleTab}
              </button>
              <button id="clr" style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                {t.clearOutput}
              </button>
            </div>

            <div className="term-screen screen" id="screen" style={{ display: activeTab === 'terminal' ? 'block' : 'none' }} aria-live="polite" />
            <div id="tr" style={{ flex: 1, minHeight: 0, overflow: 'auto', display: activeTab === 'trace' ? 'block' : 'none', padding: '8px' }} />
            <div style={{ flex: 1, minHeight: 0, display: activeTab === 'turtle' ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <svg id="tsvg" viewBox="0 0 400 400" style={{ width: '100%', height: '100%', maxHeight: '200px' }}>
                <line className="ax" x1="200" y1="0" x2="200" y2="400" />
                <line className="ax" x1="0" y1="200" x2="400" y2="200" />
                <g id="tl" />
                <polygon id="spr" points="14,0 -9,8 -9,-8" />
              </svg>
            </div>
          </div>

          {/* Predict Modal */}
          <div className="modal" id="pred">
            <div className="mbox">
              <h3>{t.predictTitle}</h3>
              <p style={{ color: 'var(--mute)', fontSize: '14px', margin: '4px 0 12px' }}>
                {t.predictPrompt}
              </p>
              <textarea id="pt" rows={4} aria-label="Prediction input" />
              <div className="mb">
                <button className="go" id="pgo">
                  {t.verifyPrediction}
                </button>
                <button id="pno">{t.cancelBtn}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
