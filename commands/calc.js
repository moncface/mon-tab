export const meta = {
  name: 'calc',
  desc: 'Evaluate expression',
  category: 'math',
  usage: 'calc <expr>',
  scope: 'universal',
}

// --- Evaluator injection (CLI can inject math.js for advanced features) ---
let _evaluate = null
export function setEvaluator(fn) { _evaluate = fn }

function formatResult(expr, val) {
  if (typeof val === 'object' && val !== null) return `${expr} = ${val.toString()}`
  if (typeof val === 'number') {
    if (!isFinite(val)) return isNaN(val) ? 'Error: invalid expression' : String(val)
    const fmt = Number.isInteger(val) ? val : +val.toPrecision(10)
    return `${expr} = ${fmt}`
  }
  return `${expr} = ${val}`
}

export const command = (expr) => {
  if (!expr) return 'Usage: calc <expr>  e.g. calc 1920/1080  or  calc 15% of 3980'
  const trimmed = expr.trim()

  // Preprocess mon-tab custom syntax (shared by both evaluators)
  const preprocessed = trimmed
    .replace(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi, '($1/100*$2)')
    .replace(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)%/g,     '($1+$1*$2/100)')
    .replace(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)%/g,      '($1-$1*$2/100)')

  // Use injected evaluator (math.js) if available
  if (_evaluate) {
    try {
      const result = _evaluate(preprocessed)
      return formatResult(trimmed, result)
    } catch (e) {
      return `Error: ${e.message}`
    }
  }

  // --- Built-in recursive descent parser (Chrome + CLI fallback) ---
  let s = preprocessed
    .replace(/\bpi\b/gi, String(Math.PI))
    .replace(/\be\b/g,   String(Math.E))
  // factorial: 5! → (120)
  s = s.replace(/(\d+)!/g, (_, n) => {
    let f = 1; for (let j = 2; j <= +n; j++) f *= j; return String(f)
  })
  let i = 0
  const skip = () => { while (s[i] === ' ') i++ }
  const parseExpr = () => {
    let v = parseTerm(); skip()
    while (s[i] === '+' || s[i] === '-') {
      const op = s[i++]; skip(); const r = parseTerm(); skip()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  const parseTerm = () => {
    let v = parseMod(); skip()
    while ((s[i] === '*' || s[i] === '/') && s.slice(i, i+2) !== '**') {
      const op = s[i++]; skip(); const r = parseMod(); skip()
      v = op === '*' ? v * r : v / r
    }
    return v
  }
  const parseMod = () => {
    let v = parsePow(); skip()
    while (s[i] === '%' && !/\s+(of)\b/.test(s.slice(i))) {
      i++; skip(); const r = parsePow(); skip()
      v = v % r
    }
    return v
  }
  const parsePow = () => {
    const v = parseUnary(); skip()
    if (s.slice(i, i+2) === '**') { i += 2; skip(); return Math.pow(v, parsePow()) }
    if (s[i] === '^') { i++; skip(); return Math.pow(v, parsePow()) }
    return v
  }
  const parseUnary = () => {
    skip()
    if (s[i] === '-') { i++; return -parsePrimary() }
    if (s[i] === '+') { i++; return  parsePrimary() }
    return parsePrimary()
  }
  const fns = {
    sqrt: Math.sqrt, floor: Math.floor, ceil: Math.ceil, round: Math.round,
    abs: Math.abs, log: Math.log, ln: Math.log, exp: Math.exp,
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    log2: Math.log2, log10: Math.log10, cbrt: Math.cbrt, sign: Math.sign, trunc: Math.trunc,
  }
  const multiFns = {
    max: Math.max, min: Math.min, pow: Math.pow, hypot: Math.hypot,
  }
  const parsePrimary = () => {
    skip()
    if (s[i] === '(') {
      i++; const v = parseExpr(); skip(); if (s[i] === ')') i++; return v
    }
    const rest = s.slice(i).toLowerCase()
    // Multi-arg functions: max(a,b,...), min(a,b,...), pow(a,b)
    for (const fn of Object.keys(multiFns)) {
      if (rest.startsWith(fn + '(')) {
        i += fn.length + 1
        const args = [parseExpr()]
        skip()
        while (s[i] === ',') { i++; skip(); args.push(parseExpr()); skip() }
        if (s[i] === ')') i++
        return multiFns[fn](...args)
      }
    }
    // Single-arg functions
    for (const fn of Object.keys(fns)) {
      if (rest.startsWith(fn + '(')) {
        i += fn.length + 1; const v = parseExpr(); skip(); if (s[i] === ')') i++
        return fns[fn](v)
      }
    }
    const m = s.slice(i).match(/^\d+(?:\.\d+)?/)
    if (m) { i += m[0].length; return parseFloat(m[0]) }
    throw new Error(`unexpected "${s[i] ?? 'end'}"`)
  }
  try {
    const result = parseExpr()
    return formatResult(trimmed, result)
  } catch(e) {
    return `Error: ${e.message}  (e.g. calc 3980*0.15)`
  }
}
