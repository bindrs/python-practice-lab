/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'terminal' | 'trace' | 'turtle'>('terminal');
  const [autoTagCloser, setAutoTagCloser] = useState(true);
  const autoTagCloserRef = useRef(true);

  useEffect(() => {
    autoTagCloserRef.current = autoTagCloser;
  }, [autoTagCloser]);

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
        if ((m = /^(\*\*|\/\/=?|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|[-+*\/%()\[\],:.=<>])/.exec(r))) {
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
          const e = or_();
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
          if (!(h[0] && h[0].k === 'i' && h[1] && h[1].v === 'in')) {
            E('SyntaxError', `line ${ln + 1}: write  for name in something:`, ln);
          }
          return [{ t: 'for', ln, v: h[0].v, it: ast(h.slice(2), ln), b: r[0] }, r[1]];
        }
        if (w === 'def') {
          const h = head(i);
          const r = body(i);
          if (!h[0] || h[0].k !== 'i' || !h[1] || h[1].v !== '(') {
            E('SyntaxError', `line ${ln + 1}: write  def name(parameters):`, ln);
          }
          return [{ t: 'def', ln, n: h[0].v, ps: h.slice(2, -1).filter((x) => x.k === 'i').map((x) => x.v), b: r[0] }, r[1]];
        }
        if (w === 'return') return [{ t: 'ret', ln, e: t.length > 1 ? ast(t.slice(1), ln) : null }, i + 1];
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
          const tg = ast(t.slice(0, k), ln);
          if (tg[0] !== 'name' && tg[0] !== 'idx') E('SyntaxError', `line ${ln + 1}: you can only store a value in a variable or a list item`, ln);
          const o = t[k].v;
          return [{ t: 'asg', ln, tg, op: o === '=' ? null : o.slice(0, -1), e: ast(t.slice(k + 1), ln) }, i + 1];
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
        E('TypeError', `a ${ty(a[0])} has no len()`);
      },
      int: (a) => toInt(a[0]),
      float: (a) => toFloat(a[0]),
      str: (a) => (a.length ? str(a[0]) : ''),
      bool: (a) => truthy(a[0]),
      list: (a) => (typeof a[0] === 'string' ? [...a[0]] : Array.isArray(a[0]) ? a[0].slice() : a.length ? E('TypeError', 'list() needs a list or a string') : []),
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
      type: (a) => ({ cls: ty(a[0]) }),
      abs: (a) => num(Math.abs(nv(a[0])), a[0] instanceof F),
      round: (a) => (a.length > 1 ? new F(+nv(a[0]).toFixed(a[1])) : Math.round(nv(a[0]))),
      max: (a) => lst(a).reduce((x, y) => (cmpv(y, x) > 0 ? y : x)),
      min: (a) => lst(a).reduce((x, y) => (cmpv(y, x) < 0 ? y : x)),
      sum: (a) => a[0].reduce((x: any, y: any) => binop('+', x, y), 0),
      sorted: (a) => a[0].slice().sort(cmpv),
    };

    const NOOP = ['done', 'mainloop', 'exitonclick', 'Screen', 'title', 'setup', 'tracer', 'update', 'speed', 'delay'];
    function attr(o: any, n: string) {
      if (typeof o === 'string' && SM[n]) return bi(n, (a) => SM[n](o, a));
      if (Array.isArray(o) && LM[n]) return bi(n, (a) => LM[n](o, a));
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
      say_(`🚪 **Portal Open (Function Call):** **${esc(f.name)}** ka chamber shuru hua. Parameters: <code>${esc(a.map(rep).join(', '))}</code>`);
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
          } else {
            const o = await ev(s.tg[1], env);
            const i = await ev(s.tg[2], env);
            if (typeof o === 'string') E('TypeError', 'a string cannot be changed. Make a new string instead.');
            o[idx(o, i)] = v;
            say_(`**List Updated:** Index <b>${esc(i)}</b> par value <b>${esc(rep(v))}</b> set hui.`);
            renderVessels();
          }
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
              evalStr: subst ? `${subst} ➔ ${v ? 'True' : 'False'}` : `${rawCond} ➔ ${v ? 'True' : 'False'}`,
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
              evalStr: 'Sabhi shartein False thi ➔ Default Path',
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
              evalStr: `Round ${n}: ${subst || rawCond} ➔ ${v ? 'True' : 'False'}`,
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
          const it = await ev(s.it, env);
          if (typeof it !== 'string' && !Array.isArray(it)) E('TypeError', `cannot loop over a ${ty(it)}`);
          const items = [...it];
          let r: any;
          for (let k = 0; k < items.length; k++) {
            await gate(s.ln);
            setMeta({
              type: 'loop',
              title: `for ${s.v} in items`,
              items: items.slice(0, 10).map((x) => String(rep(x))),
              activeIdx: k,
              val: rep(items[k]),
              round: `${k + 1}/${items.length}`,
            });
            say_(`**Loop Conveyor (Round ${k + 1}/${items.length}):** Item <b>${esc(rep(items[k]))}</b> variable <b>${esc(s.v)}</b> me aaya.`);
            await setVar(env, s.v, items[k]);
            await sleep(450);
            r = await run(s.b, env);
            if (r) {
              if (r.brk) break;
              if (r.cont) continue;
              return r;
            }
          }
          if (!items.length) say_('Loop collection khali tha, loop aage badh gaya.');
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
          say_(`🎁 **Beam Out (Return):** Function ne <b>${esc(rep(v))}</b> baahar bheja.`);
          await sleep(400);
          return { ret: v };
        }
        case 'break':
          await gate(s.ln);
          say_('🛑 **Break Barrier:** Loop beech me hi toot gaya!');
          return { brk: 1 };
        case 'continue':
          await gate(s.ln);
          say_('⏩ **Continue Warp:** Seedha agle round par jump!');
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

    const spd = () => +(($('#spd') as HTMLInputElement)?.value || 1.5);
    const sleep = (ms: number) =>
      (window as any).__fast ? Promise.resolve() : new Promise((r) => setTimeout(r, ms / spd()));

    const say_ = (h: string) => {
      if (sayEl) sayEl.innerHTML = h;
    };

    /* Active Concept Animation (Decision Gates, Loop Orbits, Synthesis Reactors, Broadcasts) */
    function setMeta(data: any) {
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
                <span class="gate-eval-arrow">➔</span>
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
              <span class="fusion-arrow">➔</span>
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
      if (++steps > 4000) E('RuntimeError', 'More than 4000 steps executed. Potential infinite loop.', ln);
      mark.style.top = 6 + ln * LH + 'px';
      mark.style.opacity = '1';
      mark.classList.remove('bad');

      const t = 6 + ln * LH;
      if (t < edEl.scrollTop) edEl.scrollTop = t - 6;
      else if (t + LH > edEl.scrollTop + edEl.clientHeight) edEl.scrollTop = t + LH - edEl.clientHeight + 6;

      if (mode === 'step') {
        if (auto) auto = false;
        else await new Promise<void>((r) => (wait = r));
        wait = null;
      } else {
        await sleep(240);
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
                    <span class="str-syntax-tag">${esc(k)}[0] ➔ '${esc(chars[0])}'</span>
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
                ${valDisplay}
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
      const isNew = !(name in env.vars) && !(name in G.vars);
      env.vars[name] = v;

      // STEP 1: APPEAR BOX
      // When assigning any variable, the box appears first with receiver slot waiting!
      renderVessels(name, isNew, v, 'appearbox');
      say_(
        `**Box Appears:** Variable <code>${esc(name)}</code> ke liye memory box ready hua. Value fly hokar enter hogi...`
      );

      const targetBox = vesselsEl.querySelector(`[data-var="${name}"]`) as HTMLElement;
      const targetSlot = targetBox?.querySelector('.mem-slot') as HTMLElement;

      if (targetBox && targetSlot && !((window as any).__fast)) {
        await sleep(180 / spd());

        const srcEl = mark || edEl;
        const srcRect = srcEl ? srcEl.getBoundingClientRect() : { left: 80, top: 140, width: 40, height: 24 };
        const tgtRect = targetSlot.getBoundingClientRect();

        const srcX = srcRect.left + (srcEl === mark ? 60 : srcRect.width / 2);
        const srcY = srcRect.top + srcRect.height / 2;
        const tgtX = tgtRect.left + tgtRect.width / 2;
        const tgtY = tgtRect.top + tgtRect.height / 2;

        // High overhead flight path (flying over editor and theater)
        const apexY = Math.max(20, Math.min(srcY, tgtY) - 130);
        const midX = (srcX + tgtX) / 2;
        const hoverY = tgtY - 72;

        const t = ty(v);
        const tCls =
          t === 'int' || t === 'float'
            ? 'p-num'
            : t === 'str'
            ? 'p-str'
            : t === 'bool'
            ? 'p-bool'
            : 'p-list';

        // Create the flying capsule without icons
        const flyer = document.createElement('div');
        flyer.className = `flyover-capsule ${tCls}`;
        const valPreview = typeof v === 'string' ? `"${cut(v, 10)}"` : cut(rep(v), 12);
        flyer.innerHTML = `
          <div class="flyover-body">
            <span class="flyover-label">${esc(name)}</span>
            <span class="flyover-eq">=</span>
            <span class="flyover-val">${esc(valPreview)}</span>
          </div>
          <div class="flyover-tail"></div>
        `;
        document.body.appendChild(flyer);

        say_(
          `**Flying Over:** <code>${esc(name)} = ${esc(valPreview)}</code> memory box <b>${esc(name)}</b> ki taraf ja raha hai.`
        );

        // STAGE A: FLY OVER THE SCREEN (High Arched Aerial Flight Over Animation)
        const flyDuration = 520 / spd();
        const flyAnim = flyer.animate(
          [
            { transform: `translate(${srcX}px, ${srcY}px) scale(0.65) rotate(-14deg)`, opacity: 0 },
            { transform: `translate(${srcX + (midX - srcX) * 0.3}px, ${apexY + 25}px) scale(1.18) rotate(-8deg)`, opacity: 1, offset: 0.25 },
            { transform: `translate(${midX}px, ${apexY}px) scale(1.3) rotate(4deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${tgtX - 10}px, ${hoverY - 8}px) scale(1.12) rotate(1deg)`, opacity: 1, offset: 0.85 },
            { transform: `translate(${tgtX}px, ${hoverY}px) scale(1.05) rotate(0deg)`, opacity: 1, offset: 1 },
          ],
          {
            duration: flyDuration,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'forwards',
          }
        );
        await flyAnim.finished;

        // STAGE B: TARGET LOCK & HOVER OVER BOX
        say_(
          `**Target Locked on \`${esc(name)}\`:** Value box ke theek upar aakar ruki, ab neeche drop hogi.`
        );
        await sleep(140 / spd());

        // STAGE C: VERTICAL GRAVITATIONAL DROP DIRECTLY INTO THE BOX
        const dropDuration = 240 / spd();
        const dropAnim = flyer.animate(
          [
            { transform: `translate(${tgtX}px, ${hoverY}px) scale(1.05)`, opacity: 1 },
            { transform: `translate(${tgtX}px, ${tgtY - 10}px) scale(0.9, 1.25)`, opacity: 0.95, offset: 0.8 },
            { transform: `translate(${tgtX}px, ${tgtY}px) scale(1.3, 0.45)`, opacity: 0, offset: 1 },
          ],
          {
            duration: dropDuration,
            easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            fill: 'forwards',
          }
        );
        await dropAnim.finished;
        flyer.remove();

        // STAGE D: IMPACT BURST & THUD ON BOX
        spawnDropSparks(tgtX, tgtY, tCls);
        targetBox.classList.add('drop-thud');
        setTimeout(() => targetBox.classList.remove('drop-thud'), 450);
      }

      // STEP 2: ENTER IN BOX WITH FILL EFFECT & STRING INDEXES
      renderVessels(name, isNew, v, 'dropping');
      say_(
        `**Entered with Fill Effect:** Value <code>${esc(rep(v))}</code> memory box <b>${esc(
          name
        )}</b> me store ho gayi.`
      );

      if (stack.length === 1) traceAdd();
      await sleep(380 / spd());

      // Settle back into professional stable state
      renderVessels();
    }

    /* Flying Animation and Drop at Terminal */
    async function flyToTerminal(text: string, end = '\n') {
      const termBtn = $('#tab-terminal-btn') as HTMLElement;
      if (termBtn) termBtn.click();

      if ((window as any).__fast) {
        out(text, end);
        return;
      }

      await sleep(140 / spd());

      const srcEl = mark || edEl;
      const srcRect = srcEl ? srcEl.getBoundingClientRect() : { left: 80, top: 140, width: 40, height: 24 };
      const tgtScreen = screen || $('#screen');
      const tgtRect = tgtScreen ? tgtScreen.getBoundingClientRect() : { left: 100, top: 400, width: 300, height: 80 };

      const srcX = srcRect.left + (srcEl === mark ? 60 : srcRect.width / 2);
      const srcY = srcRect.top + srcRect.height / 2;

      // Calculate landing spot inside terminal
      const lineCount = tgtScreen ? tgtScreen.children.length : 0;
      const tgtX = Math.min(window.innerWidth - 90, Math.max(90, tgtRect.left + 75));
      const tgtY = Math.min(window.innerHeight - 35, tgtRect.top + Math.min(tgtRect.height - 24, lineCount * 22 + 20));

      const apexY = Math.max(20, Math.min(srcY, tgtY) - 130);
      const midX = (srcX + tgtX) / 2;
      const hoverY = tgtY - 65;

      const preview = cut(text.replace(/\n/g, ' ↵ '), 18);

      // Create flying capsule (clean text, no icons)
      const flyer = document.createElement('div');
      flyer.className = 'flyover-capsule p-term';
      flyer.innerHTML = `
        <div class="flyover-body">
          <span class="flyover-term-badge">PRINT</span>
          <span class="flyover-val">${esc(preview)}</span>
        </div>
        <div class="flyover-tail"></div>
      `;
      document.body.appendChild(flyer);

      say_(
        `**Output Flying:** Result <code>${esc(preview)}</code> terminal ki taraf fly ho raha hai...`
      );

      // STAGE A: HIGH ARCHED AERIAL FLIGHT OVER THE ARENA
      const flyDuration = 520 / spd();
      const flyAnim = flyer.animate(
        [
          { transform: `translate(${srcX}px, ${srcY}px) scale(0.65) rotate(-14deg)`, opacity: 0 },
          { transform: `translate(${srcX + (midX - srcX) * 0.3}px, ${apexY + 25}px) scale(1.18) rotate(-8deg)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${midX}px, ${apexY}px) scale(1.3) rotate(4deg)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${tgtX - 10}px, ${hoverY - 8}px) scale(1.12) rotate(1deg)`, opacity: 1, offset: 0.85 },
          { transform: `translate(${tgtX}px, ${hoverY}px) scale(1.05) rotate(0deg)`, opacity: 1, offset: 1 },
        ],
        {
          duration: flyDuration,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        }
      );
      await flyAnim.finished;

      // STAGE B: HOVER OVER TERMINAL
      say_(
        `**Terminal Lock:** Result <code>${esc(preview)}</code> terminal ke upar hover kar raha hai, ab drop hoga.`
      );
      await sleep(130 / spd());

      // STAGE C: VERTICAL GRAVITATIONAL DROP DIRECTLY INTO TERMINAL
      const dropDuration = 240 / spd();
      const dropAnim = flyer.animate(
        [
          { transform: `translate(${tgtX}px, ${hoverY}px) scale(1.05)`, opacity: 1 },
          { transform: `translate(${tgtX}px, ${tgtY - 8}px) scale(0.9, 1.25)`, opacity: 0.95, offset: 0.8 },
          { transform: `translate(${tgtX}px, ${tgtY}px) scale(1.3, 0.45)`, opacity: 0, offset: 1 },
        ],
        {
          duration: dropDuration,
          easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
          fill: 'forwards',
        }
      );
      await dropAnim.finished;
      flyer.remove();

      // STAGE D: IMPACT BURST & SHOCKWAVE ON TERMINAL
      spawnDropSparks(tgtX, tgtY, 'p-term');
      if (tgtScreen) {
        tgtScreen.classList.add('terminal-impact');
        setTimeout(() => tgtScreen.classList.remove('terminal-impact'), 450);
      }

      // Output arrives at terminal with landing animation
      out(text, end);
      if (tgtScreen && tgtScreen.lastElementChild) {
        tgtScreen.lastElementChild.classList.add('ln-landing');
      }

      say_(
        `**Output Landed:** Result <code>${esc(preview)}</code> terminal me drop hokar print ho gaya.`
      );
      await sleep(280 / spd());
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

    const exSelect = $('#ex') as HTMLSelectElement;
    if (exSelect && exSelect.options.length <= 1) {
      U.forEach((x, i) => {
        const o = document.createElement('option');
        o.value = String(i);
        o.textContent = x[0];
        exSelect.append(o);
      });
      exSelect.onchange = () => {
        const i = exSelect.value;
        if (i === '') return;
        code.value = U[+i][2];
        reset();
        say_('**Goal:** ' + U[+i][1]);
      };
    }

    /* Trace Table */
    let TR: Array<{ ln: number; snap: Record<string, string> }> = [];
    let trCols: string[] = [];

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
      if (pred === null) return '**Finished:** Execution sequence complete.';
      const ok = norm(OUTTXT) === norm(pred);
      pred = null;
      return ok ? '**Prediction Correct!** Output matches prediction.' : '**Prediction Mismatch:** Compare with terminal output.';
    }

    function drawGut() {
      const n = code.value.split('\n').length;
      gut.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
      code.style.height = n * LH + 12 + 'px';
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
      renderTrace();
      OUTTXT = '';
      setMeta({ type: 'idle' });
      say_('**Python Studio:** Enter code and press **Run** or **Step**.');
      drawGut();
    }

    async function start(m: string, src: string) {
      reset();
      cur = gen;
      mode = m;
      auto = m === 'step';
      running = true;
      out('python main.py', '\n', false, true);
      try {
        const prog = parseProgram(src);
        await run(prog, G);
        if (cur === gen) {
          curSpan = null;
          mark.style.opacity = '0';
          say_(doneMsg());
        }
      } catch (e: any) {
        if (e === CANCEL) return;
        if (!(e instanceof PyErr)) throw e;
        curSpan = null;
        const ln = lnOf(e);
        out('Traceback (most recent call last):', '\n', true, true);
        out(`  File "main.py"${ln !== undefined ? ', line ' + (ln + 1) : ''}`, '\n', true, true);
        out(e.t + ': ' + e.m, '\n', true);
        liveErr(e);
      } finally {
        if (cur === gen) running = false;
      }
    }

    const runBtn = $('#run');
    if (runBtn) {
      runBtn.onclick = () => {
        if (running) {
          mode = 'run';
          if (wait) wait();
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

    const stepBtn = $('#step');
    if (stepBtn) {
      stepBtn.onclick = () => {
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

    const handleInput = () => reset();
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
    code.addEventListener('keydown', handleKeydown);

    code.value = DEFAULT;
    reset();

    return () => {
      gen++;
      if (wait) wait();
      code.removeEventListener('input', handleInput);
      code.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div ref={containerRef} className="app">
      {/* Top Header & Actions */}
      <div className="tb">
        <b>Python Studio</b>
        <select id="ex" aria-label="Examples">
          <option value="">Curriculum Examples</option>
        </select>
        <button className="go" id="run">
          Run
        </button>
        <button id="step">Step</button>
        <button id="reset">Reset</button>
        <label className="ck">
          <input type="checkbox" id="pr" /> Predict Output
        </label>
        <label className="ck">
          Speed <input type="range" id="spd" min="0.5" max="5" step="0.5" defaultValue="1.5" />
        </label>
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
                <span>Active Concept Animation</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mute)' }}>
                  Decision Gates · Orbit Loops · Fusion Streams
                </span>
              </div>
              <div className="stage-view" id="meta-stage-view"></div>
            </div>

            {/* Professional Memory Entries Deck */}
            <div className="meta-vessels-deck">
              <div className="stage-title">
                <span>Live Memory Entries</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--mute)' }}>
                  Target Mention ➔ Value Drop Animation
                </span>
              </div>
              <div className="vessels-grid" id="vessels"></div>
            </div>
          </div>
        </main>
      </div>

      {/* Output Deck */}
      <div className="term-deck">
        <div className="deck-tabs">
          <button
            id="tab-terminal-btn"
            className={`deck-tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            Terminal Output
          </button>
          <button
            className={`deck-tab-btn ${activeTab === 'trace' ? 'active' : ''}`}
            onClick={() => setActiveTab('trace')}
          >
            Trace Table
          </button>
          <button
            className={`deck-tab-btn ${activeTab === 'turtle' ? 'active' : ''}`}
            onClick={() => setActiveTab('turtle')}
          >
            Turtle Canvas
          </button>
          <button id="clr" style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
            Clear Output
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
          <h3>Predict Before Running</h3>
          <p style={{ color: 'var(--mute)', fontSize: '14px', margin: '4px 0 12px' }}>
            Is code ka output kya aayega? Neeche type karo, phir run karke compare karo.
          </p>
          <textarea id="pt" rows={4} aria-label="Prediction input" />
          <div className="mb">
            <button className="go" id="pgo">
              Verify Prediction
            </button>
            <button id="pno">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
