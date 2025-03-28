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

export function scrollTo(element: string, pxOffset: number) {
  const el = document.querySelector(element)
  const rect = el?.getBoundingClientRect()
  const { scrollY } = window
  // const rootFontSize = window.getComputedStyle(document.documentElement).fontSize
  // const rootFontSizeValue = parseFloat(rootFontSize)
  pxOffset = pxOffset || 0
  if (rect) {
    window.scrollTo({
      // top: el.offsetTop,
      top: scrollY + rect.top + pxOffset,
      behavior: 'smooth'
    })
  }
}

export function prettierExpression(expr: string): string {
  expr = expr.replace(/,/gi, '.')
  expr = expr.replace(/[^-+*/.0-9()@#$%&= ]/gi, '')
  while (/(--|\+\+|-\+|\+-|[/*]([/*]))/.test(expr)) {
    expr = expr.replace(/-\+|\+-/, '-')
    expr = expr.replace(/--|\+\+/, '+')
    expr = expr.replace(/[/*]([/*])/, '$1')
  }
  expr = expr.replace(/\B(\.)/gi, '0$1')
  expr = expr.replace(/([0-9])([(])/gi, '$1*$2')
  expr = expr.replace(/([)])([0-9])/gi, '$1*$2')
  expr = expr.replace(/([)])([(])/gi, '$1*$2')
  expr = expr.replace(/([0-9]) ([0-9])/gi, '$1$2')
  return expr
}

export function evalMath(expr: string): number {
  function calcMultiply(exp: string) {
    const [numA, numB] = exp.split(/[*/]/)
    const a: number = Number(numA)
    const b: number = Number(numB)
    return /\*/.test(exp) ? a * b : a / b
  }

  expr = expr ? expr : ''
  expr = expr.replace(/\(\)|[@#$%&= ]|\u200B/gi, '') // remove unwanted chars
  expr = expr.replace(/\B\.\B/gi, '0')
  expr = prettierExpression(expr)
  const regexpParenthesis = /\(([^()]+)\)/i
  const regexpMultiply = /\d+(\.\d+)?[*/][+-]?\d+(\.\d+)?/i
  const regexpAddition = /[+-]?\d+(\.\d+)?/gi
  const isParenthesis = expr.match(regexpParenthesis)
  const isMultiply = expr.match(regexpMultiply)
  const isAddition: null | (string | number)[] = expr.match(regexpAddition)

  if (isParenthesis) {
    const evalParenthesis = expr.replace(regexpParenthesis, evalMath(isParenthesis[1]).toString())
    return evalMath(evalParenthesis)
  }

  if (!isParenthesis && /\(/.test(expr)) {
    return evalMath(`${expr}+0)`)
  }

  if (!isParenthesis && /\)/.test(expr)) {
    return evalMath(`(0+${expr}`)
  }

  if (isMultiply) {
    const evalMultiply = expr.replace(regexpMultiply, calcMultiply(isMultiply[0]).toString())
    return evalMath(evalMultiply)
  }

  const finalResult = isAddition ? isAddition.reduce((acc, curr) => Number(curr) + Number(acc)) : 0
  return Number(finalResult)
}

export function hasPurchase(): Boolean {
  const x = JSON.parse(localStorage.getItem('SB5_stockList') || '[]').reduce(
    (acc: number, item: Plywood) => {
      return acc + (item.purchase ? 1 : 0)
    },
    0
  )
  return x ? true : false
}

export function hasReservations(): Boolean {
  const x = JSON.parse(localStorage.getItem('SB5_stockList') || '[]').reduce(
    (acc: number, item: Plywood) => {
      return acc + (item.quantityCubicAviable ? 1 : 0)
    },
    0
  )
  return x ? true : false
}

export function downloadFile(file: string, data: string, type: string) {
  const blob = new Blob([data], { type: type })
  const blobUrl = URL.createObjectURL(blob)
  const linkElement = document.createElement('a')
  linkElement.href = blobUrl
  linkElement.download = file
  document.body.appendChild(linkElement)
  linkElement.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  )
  document.body.removeChild(linkElement)
  URL.revokeObjectURL(blobUrl)
}

export function setRandomUUID() {
  function uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    )
  }
  const UUID = localStorage.getItem('SB5_UUID') || ''
  const UUIDpattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(UUID)

  if (UUIDpattern === false) {
    // localStorage.setItem('SB5_UUID', crypto.randomUUID()) // doesnt work on network http
    localStorage.setItem('SB5_UUID', uuidv4())
  }
}
