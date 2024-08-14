export function calcQuant(
  size: string | undefined,
  value: number | undefined,
  from: string | undefined,
  to: string | undefined
): number {
  if (!size || !value || !from || !to) return 0
  const [x, y, z] = size.split('x')
  const a = Number(x) / 1000
  const b = Number(y) / 1000
  const c = Number(z) / 1000
  if (from === 'm3') {
    if (to === 'm2') value = value / a
    if (to === 'szt') value = value / a / b / c
  }
  if (from === 'm2') {
    if (to === 'm3') value = value * a
    if (to === 'szt') value = value / b / c
  }
  if (from === 'szt') {
    if (to === 'm3') value = value * a * b * c
    if (to === 'm2') value = value * b * c
  }
  return value
}

export function calcPrice(
  size: string | undefined,
  value: number | undefined,
  from: string | undefined,
  to: string | undefined
): number {
  if (!size || !value || !from || !to) return 0
  const [x, y, z] = size.split('x')
  const a = Number(x) / 1000
  const b = Number(y) / 1000
  const c = Number(z) / 1000
  if (from === 'm3') {
    if (to === 'm2') value = value * a
    if (to === 'szt') value = value * a * b * c
  }
  if (from === 'm2') {
    if (to === 'm3') value = value / a
    if (to === 'szt') value = value * b * c
  }
  if (from === 'szt') {
    if (to === 'm3') value = value / a / b / c
    if (to === 'm2') value = value / b / c
  }
  return value
}

export function escapeNonword(string: string) {
  return string
    .split('')
    .map((char) => (!char.match(/\w|\d/) ? char.charCodeAt(0).toString(32) : char))
    .join('')
}

export function scrollTo(element: string, remOffset: number) {
  const el = document.querySelector(element)
  const rect = el?.getBoundingClientRect()
  const { scrollY } = window
  const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
  const rootFontSizeValue = parseFloat(rootFontSize)
  remOffset = remOffset || 0
  if (rect) {
    window.scrollTo({
      // top: el.offsetTop,
      top: scrollY + rect.top + rootFontSizeValue * remOffset,
      behavior: 'smooth'
    })
  }
}

export function evalMath(expr: string): number {
  function calcMultiply(exp: string) {
    const [numA, numB] = exp.split(/[*/]/)
    const a: number = Number(numA)
    const b: number = Number(numB)
    return /\*/.test(exp) ? a * b : a / b
  }

  expr = expr ? expr : ''
  expr = expr.replace(/,/gi, '.')
  expr = expr.replace(/-\+/gi, '-')
  expr = expr.replace(/--/gi, '+')
  expr = expr.replace(/\++/gi, '+')
  expr = expr.replace(/\B\.\B/gi, '0')
  expr = expr.replace(/\B(\.)/gi, '0$1')
  expr = expr.replace(/(\d)(\()/gi, '$1*$2')
  expr = expr.replace(/(\))(\d)/gi, '$1*$2')
  expr = expr.replace(/(\))(\()/gi, '$1*$2')
  const regexpParenthesis = /\(([^()]+)\)/i
  const regexpMultiply = /\d+(\.\d+)?[*/]-?\d+(\.\d+)?/i
  const regexpAddition = /[+-]?\d+(\.\d+)?/gi
  const isParenthesis = expr.match(regexpParenthesis)
  const isMultiply = expr.match(regexpMultiply)
  const isAddition: null | (string | number)[] = expr.match(regexpAddition)

  if (isParenthesis) {
    const evalParenthesis = expr.replace(regexpParenthesis, evalMath(isParenthesis[1]).toString())
    return evalMath(evalParenthesis)
  }

  if (isMultiply) {
    const evalMultiply = expr.replace(regexpMultiply, calcMultiply(isMultiply[0]).toString())
    return evalMath(evalMultiply)
  }

  const finalResult = isAddition ? isAddition.reduce((acc, curr) => Number(curr) + Number(acc)) : 0
  return Number(finalResult)
}

export function plural(one: string, two: string, tre: string, val: number): String {
  let result = ''
  if (val === 1) result = one
  else if (val % 10 > 1 && val % 10 < 5 && (val % 100 < 10 || val % 100 > 20)) result = two
  else if (val >= 5) result = tre
  return result
}
