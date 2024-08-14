/* eslint-disable no-regex-spaces */
/* eslint-disable no-control-regex */
import _ from 'lodash'
import { calcPrice, calcQuant, evalMath } from './common_functions'
import { promptModal } from 'jenesius-vue-modal'
import InventoryMerge from '@/components/Modals/InventoryMerge.vue'

interface defineDataTypeOutput {
  data: 'stocks' | 'reservations' | 'code' | boolean | null
  message: string
}

export function defineDataType(input: string): defineDataTypeOutput {
  const text = input.trim()
  let datatype: 'stocks' | 'reservations' | 'code' | boolean | null = null
  let message: string = ''

  if (!text) {
    datatype = null
    message = ``
  } else {
    datatype = false
    message = `❌ Nie rozpoznano danych.`
  }

  const isStocks = /Stany magazynowe towarów/i.test(text)
  const isCorrectStocksColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(text)
  if (isStocks && isCorrectStocksColumns) {
    datatype = 'stocks'
    message = `📜 Rozpoznano Stany magazynowe towarów.`
  }

  const isReservation = /Stany i rezerwacje towarów/i.test(text)
  const isCorrectReservationColumns =
    /Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(text)
  if (isReservation && isCorrectReservationColumns) {
    datatype = 'reservations'
    message = `📦 Rozpoznano Stany i rezerwacje towarów.`
  }

  const codeLength = 4
  const isFullExchangeCode = new RegExp(`^\\d{${codeLength}}$`, 'i').test(text)
  if (isFullExchangeCode) {
    datatype = 'code'
    message = `🔢 Rozpoznano kod wymiany danych.`
  }

  const isPartExchangeCode = new RegExp(`^\\d{1,${codeLength - 1}}$`, 'i').test(text)
  if (isPartExchangeCode) {
    datatype = null
    message = `${text.replace(/\d/g, '✱').padEnd(codeLength, '⚹')}`
  }

  return { data: datatype, message: message }
}

export function convertToArray(data: string): string[][] {
  const result = []
  const lines = data.match(/[^\r\n]+/g) || []
  for (const line of lines) {
    const row = line.trim().split(/\t+/)
    result.push(row)
  }
  return result
}

export function removeGarbage(data: string[][], datatype: string) {
  const forbidden = /(stany|kod|podsumowanie|dostawa|transport|usługa|zamówienie)/gi
  const result = []
  for (const row of data) {
    if (datatype === 'stocks' && row.length !== 6) continue
    if (datatype === 'reservations' && row.length !== 7) continue
    if (row.join('\t').match(forbidden)) continue
    result.push(row)
  }
  return result
}

export function convertToObject(data: string[][], datatype: string): Plywood[] {
  const products = []
  for (const row of data) {
    const plywood = {} as Plywood
    const plywoodSize = getSize(row[1])
    const [sizeT = null, sizeA = null, sizeB = null] = plywoodSize?.split('x') || []
    const plywoodVolumeUnit = getVolumeUnit(row[2])
    const searchString = `${row[1]} ${row[0]} `
    const faceType_val = getFaceType(searchString)
    const glueType_val = getGlueType(searchString)
    const woodType_val = getWoodType(searchString)
    const color_val = getColor(searchString, faceType_val)

    plywood.id = row[0]
    plywood.name = row[1] || '(???)'
    plywood.size = plywoodSize || '(???)'
    plywood.attr = plywood.attr || {}
    plywood.attr.sizeT = sizeT || '(???)'
    plywood.attr.sizeA = sizeA || '(???)'
    plywood.attr.sizeB = sizeB || '(???)'
    plywood.attr.sizeAB = `${sizeA}x${sizeB}` || '(???)'
    plywood.attr.footSize = getFootSize(plywoodSize) || '(???)'
    plywood.attr.faceType = faceType_val || '(???)'
    plywood.attr.glueType = glueType_val || '(???)'
    plywood.attr.woodType = woodType_val || '(???)'
    plywood.attr.color = color_val || '(???)'
    // plywood.inventory = {}

    if (datatype === 'stocks') {
      const price = Number(row[5].replace(',', '.'))
      const total_stock = Number(row[3].replace(',', '.'))
      const total_status = total_stock > 0 ? 1 : null
      const price_calc = price / total_stock
      const finite_price = isFinite(price_calc) ? price_calc : 0
      plywood.price = calcPrice(plywoodSize, finite_price, plywoodVolumeUnit, 'm3')
      plywood.totalStock = calcQuant(plywoodSize, total_stock, plywoodVolumeUnit, 'm3')
      plywood.stockStatus = total_status || 0
    }

    if (datatype === 'reservations') {
      const total_stock = Number(row[6].replace(',', '.'))
      const total_status = total_stock > 0 ? 1 : null
      const aviable_stock = Number(row[3].replace(',', '.'))
      const aviable_status = aviable_stock > 0 ? 2 : null
      plywood.totalStock = calcQuant(plywoodSize, total_stock, plywoodVolumeUnit, 'm3')
      plywood.aviableStock = calcQuant(plywoodSize, aviable_stock, plywoodVolumeUnit, 'm3')
      plywood.stockStatus = aviable_status || total_status || 0
    }

    products.push(plywood)
  }
  return products
}

function getSize(input: string): string | undefined {
  const match = input.match(/\d+([,.]\d+)?x\d{2,4}x\d{2,4}/i)
  return match ? match[0].replace(/,/g, '.') : undefined
}

function getFootSize(input: string | undefined): string | undefined {
  if (!input) return undefined
  const numbers = input.split('x')
  const ratio = 305
  const A = Math.round(Number(numbers[1]) / ratio)
  const B = Math.round(Number(numbers[2]) / ratio)
  const lo = A < B ? A : B
  const hi = A > B ? A : B
  // return `${A}x?'`
  if (lo == hi) return `5x5'`
  if (lo < 4) return `3x~'`
  if (lo == 4 && hi == 8) return `4x8'`
  if (lo == 4) return `4x~'`
  if (lo == 5 && hi == 8) return `5x8'`
  if (lo == 5 && hi == 10) return `5x10'`
  if (lo == 5) return `5x~'`
  if (lo >= 6) return `7x~'`
}

type VolumeUnit = 'szt' | 'm2' | 'm3' | undefined
function getVolumeUnit(input: string): VolumeUnit {
  const match = input.match(/szt|m2|m3/i)
  return match ? (match[0].toLowerCase() as VolumeUnit) : undefined
}

function getGlueType(text: string): string | undefined {
  let result = undefined
  if (/sucho|\bMR\b|\bINT\b/g.test(text)) result = 'MR'
  if (/wodo|\bWD\b|\bEXT\b|\bE\b/g.test(text)) result = 'WD'
  if (/lamin|foliowana|antypo/g.test(text)) result = 'WD'
  if (/melamin|M\?M/g.test(text)) result = 'WD'
  return result
}

function getFaceType(text: string): string | undefined {
  let result = undefined
  /*!!! Keep order. Any order if equal number. !!! */
  /*1*/ if (/s11\/|kilo/gi.test(text)) result = 'Kilo'
  /*2*/ if (/\bPQ\b/gi.test(text)) result = 'PQ'
  /*3*/ if (/\bPQ\W?F\b/gi.test(text)) result = 'PQF'

  /*4*/ if (/s12|s13/gi.test(text)) result = 'F/F'
  /*4*/ if (/s14|s15/gi.test(text)) result = 'F/W'
  /*4*/ if (/s16|s17/gi.test(text)) result = 'W/W'

  /*5*/ if (/\bF\/W\W?H\b|Heksa/gi.test(text)) result = 'Heksa'
  /*5*/ if (/\bhoney\b/gi.test(text)) result = 'Honey'
  /*5*/ if (/\bM\/M\b|mel/gi.test(text)) result = 'M/M'
  /*5*/ if (/\bopal\b/gi.test(text)) result = 'Opal'
  /*5*/ if (/\bopal white\b/gi.test(text)) result = 'Opal White'
  /*5*/ if (/\bPF\b|poliform/gi.test(text)) result = 'Poliform'
  /*5*/ if (/\bPPL\b/gi.test(text)) result = 'PPL'
  /*5*/ if (/OSB/gi.test(text)) result = 'OSB'

  // /*5*/ if (/s12|s13|\bF\/F\b|lamin|folio/gi.test(text)) result = 'F/F'
  // /*5*/ if (/s14|s15|\bF\/W\b|anty/gi.test(text)) result = 'F/W'
  // /*5*/ if (/s16|s17|\bW\/W\b/gi.test(text)) result = 'W/W'

  const regexpGrade = /\b(S|B|BB|CP|WG|WGE|C|CC|V|M|F|W)\b/
  const expression = new RegExp(`${regexpGrade.source}/${regexpGrade.source}`, 'gi')
  if (expression.test(text)) {
    const grade = text.match(expression)
    result = grade ? grade[0] : '??/??'
  }
  return result
}

function getWoodType(text: string): string | undefined {
  const results = new Set()

  if (/liścia/gi.test(text)) results.add('Liściasta')
  if (/iglasta/gi.test(text)) results.add('Iglasta')
  if (/pine|sosn/gi.test(text)) results.add('Sosna')
  if (/\bCH\b|topol/gi.test(text)) results.add('Topola')
  if (/\bRP\b|radiata/gi.test(text)) results.add('Radiata')
  if (/\bTB\b|bintangor/gi.test(text)) results.add('Bintangor')
  if (/\bEUK\b|eukaliptus/gi.test(text)) results.add('Eukaliptus')

  if (results.size === 0) return undefined
  return Array.from(results).join(' ')
}

function getColor(text: string, faceType: string | undefined): string | undefined {
  const results = new Set()

  if (/opal/gi.test(text)) results.add('opal')
  if (/yell|zółt[ya]/gi.test(text)) results.add('yellow')
  if (/white|biał[ya]/gi.test(text)) results.add('white')
  if (/black|czarn[ya]/gi.test(text)) results.add('black')
  if (/green|zielon[ya]/gi.test(text)) results.add('green')
  if (/blue|niebiesk[ia]/gi.test(text)) results.add('blue')
  if (/\bred\b|czerwon[ya]/gi.test(text)) results.add('red')
  if (/c\.less|trans|bezbarwna/gi.test(text)) results.add('c.less')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('l.grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(br|brąz|brown)/gi.test(text)) results.add('l.brown')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(d\.)?(br|brąz|brown)\b/gi.test(text)) results.add('d.brown')

  /* Apply defaults if no color specified */
  if (results.size === 0) {
    if (faceType === 'F/F') results.add('d.brown')
    if (faceType === 'F/W') results.add('d.brown')
    if (faceType === 'W/W') results.add('d.brown')
    if (faceType === 'Heksa') results.add('d.brown')
    if (faceType === 'Honey') results.add('honey')
    if (faceType === 'M/M') results.add('white')
    if (faceType === 'Poliform') results.add('(nieznany)')
    if (faceType === 'Opal') results.add('(nieznany)')
    if (faceType === 'PPL') results.add('(nieznany)')
    if (faceType === 'PQF') results.add('(nieznany)')
  }
  if (results.size === 0 && faceType) results.add('(surowa)')
  else results.add('(laminat)')
  if (results.size === 0) return undefined
  return Array.from(results).join(' ')
}

export function zeroOutPrices(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.price = 0
    return el
  })
}

export function zeroOutStocks(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.totalStock = 0
    el.stockStatus = 0
    return el
  })
}

export function zeroOutReservations(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.aviableStock = 0
    el.totalStock = 0
    el.stockStatus = 0
    return el
  })
}

export function hasInventory(stockList: Plywood[]): Boolean {
  if (!stockList) return false
  for (const row of stockList) {
    if (row.inventory) return true
  }
  return false
}

export function deleteInventory(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    delete el.inventory
    return el
  })
}

export function setInventoryStatus(item: Plywood) {
  const threshold = 0.62
  const totalStockPcs = calcQuant(item.size, item.totalStock, 'm3', 'szt')

  const cub = calcQuant(item.size, evalMath(item.inventory?.m3 || '0'), 'm3', 'szt')
  const sqr = calcQuant(item.size, evalMath(item.inventory?.m2 || '0'), 'm2', 'szt')
  const pcs = calcQuant(item.size, evalMath(item.inventory?.szt || '0'), 'szt', 'szt')
  const diff = cub + sqr + pcs - totalStockPcs

  let status = 'pusty'
  if (totalStockPcs < 0) status = 'what'
  if (totalStockPcs >= 0) {
    if (Math.abs(diff) <= threshold) status = 'OK'
    if (totalStockPcs <= threshold) status = 'brak'
    if (totalStockPcs == diff) status = 'pusty'
    if (diff < threshold * -1) status = 'brak'
    if (diff > threshold) status = 'nadmiar'
  }
  return status
}

export async function mergeStocks(
  incomingData: Plywood[],
  localData: Plywood[],
  datatype?: string
) {
  let modal = <string | unknown>''
  if (hasInventory(incomingData)) modal = await promptModal(InventoryMerge)
  if (modal === 'local') incomingData = deleteInventory(incomingData || [])
  if (modal === 'cloud') localData = deleteInventory(localData || [])

  if (datatype?.match(/code/i)) {
    localData = zeroOutPrices(localData || [])
    localData = zeroOutStocks(localData || [])
    localData = zeroOutReservations(localData || [])
  }
  if (datatype?.match(/stocks/i)) {
    localData = zeroOutPrices(localData || [])
    localData = zeroOutStocks(localData || [])
  }
  if (datatype?.match(/reservations/i)) {
    localData = zeroOutReservations(localData || [])
  }

  for (const incomingItem of incomingData) {
    const localItemIndex = localData.findIndex((localItem) => localItem.id === incomingItem.id)
    incomingItem.inventoryStatus = setInventoryStatus(incomingItem)

    if (localItemIndex < 0) {
      localData.push(incomingItem)
    } else {
      const localItem = localData[localItemIndex]
      if (localItem.inventory && modal === 'merge') {
        const units = ['m3', 'm2', 'szt'] as const
        units.map((unit) => {
          if (localItem.inventory?.[unit] && incomingItem.inventory?.[unit]) {
            _.merge(incomingItem.inventory, {
              [unit]: `${localItem.inventory[unit]} + ${incomingItem.inventory?.[unit]}`
            })
          }
        })
      }
      _.merge(localData[localItemIndex], incomingItem) // Object.assign but better
    }
  }
  return localData
}

export async function fetchRemoteData(pincode: string): Promise<{ message: string; data: string }> {
  const POST_data = {
    action: 'request',
    pin: pincode
  }

  const fetchSettings: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(POST_data)
  }

  // const url = 'https://bossman.hekko24.pl/stock_browser_server/server.php',
  const url = 'http://localhost:3000/php_server/server.php'
  const result = { message: '', data: '' }

  const fetchResponse = await fetch(url, fetchSettings).catch((err) => {
    console.error('Error fetching data:', err)
    result.message = 'connection_error'
    return
  })

  if (fetchResponse) {
    const responseText = await fetchResponse.text()

    try {
      const { message, data } = JSON.parse(responseText)
      result.message = message
      result.data = data
    } catch (err) {
      console.error('Error parsing JSON:', err)
      console.log('PHP error message: ', responseText)
      result.message = 'bad_JSON'
    }
  }
  return result
}
