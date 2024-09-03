/* eslint-disable no-regex-spaces */
/* eslint-disable no-control-regex */
import _ from 'lodash'
import { php_server_url } from '@/exports/urls'

import { calcPrice, calcQuant, evalMath } from './common_functions'
import { promptModal } from 'jenesius-vue-modal'
import InventoryMerge from '@/components/Modals/InventoryMergeModal.vue'
// await promptModal(InventoryMerge)

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
    message = `Nie rozpoznano danych ❌`
  }

  const isStocks = /Stany magazynowe towarów/i.test(text)
  const isCorrectStocksColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(text)
  if (isStocks && isCorrectStocksColumns) {
    datatype = 'stocks'
    message = `Rozpoznano Stany magazynowe towarów 📜`
  }

  const isReservation = /Stany i rezerwacje towarów/i.test(text)
  const isCorrectReservationColumns =
    /Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(text)
  if (isReservation && isCorrectReservationColumns) {
    datatype = 'reservations'
    message = `Rozpoznano Stany i rezerwacje towarów 📦`
  }

  const codeLength = 4
  const isFullExchangeCode = new RegExp(`^\\d{${codeLength}}$`, 'i').test(text)
  if (isFullExchangeCode) {
    datatype = 'code'
    message = `Rozpoznano kod wymiany danych 🔢`
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
    const faceGroup_val = getFaceGroup(searchString)
    const faceType_val = getFaceType(searchString)
    const glueType_val = getGlueType(searchString)
    const woodType_val = getWoodType(searchString)
    const color_val = getColor(searchString, faceType_val)

    plywood.id = row[0]
    plywood.name = row[1] || '(?)'
    plywood.size = plywoodSize || '(?)'
    plywood.attr = plywood.attr || {}
    plywood.attr.sizeT = sizeT || '(?)'
    plywood.attr.sizeA = sizeA || '(?)'
    plywood.attr.sizeB = sizeB || '(?)'
    plywood.attr.sizeAB = `${sizeA}x${sizeB}` || '(?)'
    plywood.attr.footSize = getFootSize(plywoodSize) || '(?)'
    plywood.attr.faceType = faceType_val || '(?)'
    plywood.attr.faceGroup = faceGroup_val || '(?)'
    plywood.attr.glueType = glueType_val || '(?)'
    plywood.attr.woodType = woodType_val || '(?)'
    plywood.attr.color = color_val

    if (datatype === 'stocks') {
      const price = Number(row[5].replace(',', '.'))
      const total_stock = Number(row[3].replace(',', '.'))
      const price_calc = price / total_stock
      const finite_price = isFinite(price_calc) ? price_calc : 0
      plywood.purchase = calcPrice(plywoodSize, finite_price, plywoodVolumeUnit, 'm3')
      plywood.quantityCubicTotal = calcQuant(plywoodSize, total_stock, plywoodVolumeUnit, 'm3')
    }

    if (datatype === 'reservations') {
      const total_stock = Number(row[6].replace(',', '.'))
      const aviable_stock = Number(row[3].replace(',', '.'))
      plywood.quantityCubicTotal = calcQuant(plywoodSize, total_stock, plywoodVolumeUnit, 'm3')
      plywood.quantityCubicAviable = calcQuant(plywoodSize, aviable_stock, plywoodVolumeUnit, 'm3')
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
  if (lo == hi) return `${lo}x${lo}'`
  if (lo <= 3) return `3x~'`
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

  const regexpGrade = /\b(S|B|BB|CP|WG|WGE|C|CC|V|M|F|W)\b/
  const expression = new RegExp(`${regexpGrade.source}/${regexpGrade.source}`, 'gi')
  if (expression.test(text)) {
    const grade = text.match(expression)
    result = grade ? grade[0] : '??/??'
  }
  /*!!! Keep order. Any order if equal number. !!! */

  /*1*/ if (/s01\//gi.test(text)) result = 'B/B'
  /*1*/ if (/s02\//gi.test(text)) result = 'B/BB'
  /*1*/ if (/s03\//gi.test(text)) result = 'S/BB'
  /*1*/ if (/s04\//gi.test(text)) result = 'BB/BB'
  /*1*/ if (/s05\//gi.test(text)) result = 'BB/CP'
  /*1*/ if (/s06\//gi.test(text)) result = 'BB/WG'
  /*1*/ if (/s07\//gi.test(text)) result = 'CP/CP'
  /*1*/ if (/s08\//gi.test(text)) result = 'WGE/WGE'
  /*1*/ if (/s09\//gi.test(text)) result = 'WG/WG'
  /*1*/ if (/s10\//gi.test(text)) result = 'C/C'
  /*1*/ if (/s11\//gi.test(text)) result = 'Kilo'
  /*1*/ if (/s12\//gi.test(text)) result = 'F/F'
  /*1*/ if (/s13\//gi.test(text)) result = 'F/F II'
  /*1*/ if (/s14\//gi.test(text)) result = 'F/W'
  /*1*/ if (/s15\//gi.test(text)) result = 'F/W II'
  /*1*/ if (/s16\//gi.test(text)) result = 'W/W'
  /*1*/ if (/s17\//gi.test(text)) result = 'W/W II'
  /*1*/ if (/s18\//gi.test(text)) result = 'CP/C'
  /*1*/ if (/s19\//gi.test(text)) result = 'M/WG'
  /*1*/ if (/s20\//gi.test(text)) result = 'F/BB'
  /*1*/ if (/s20\//gi.test(text)) result = 'F/WG'
  /*1*/ if (/s24\//gi.test(text)) result = 'W/WG'
  /*1*/ if (/s25\//gi.test(text)) result = 'B/WG'
  /*1*/ if (/s26\//gi.test(text)) result = 'F/WH'
  /*1*/ if (/s27\//gi.test(text)) result = 'W/CP'
  /*1*/ if (/s22\//gi.test(text)) result = 'BB/C'
  /*1*/ if (/s28\//gi.test(text)) result = 'S/WG'
  /*1*/ if (/s29\//gi.test(text)) result = 'S/CP'
  /*1*/ if (/s30\//gi.test(text)) result = 'V/V'
  /*1*/ if (/s31\//gi.test(text)) result = 'OSB3'
  /*1*/ if (/s32\//gi.test(text)) result = 'OSB T&G'
  /*1*/ if (/s35\//gi.test(text)) result = 'BB/CC'

  /*2.1*/ if (/\bkilo\b/gi.test(text)) result = 'Kilo'
  /*2.2*/ if (/\bPQ\b/gi.test(text)) result = 'PQ'
  /*2.3*/ if (/\bPQ\W?F\b/gi.test(text)) result = 'PQF'
  /*3*/ if (/\bF\/W\W?H\b|Heksa/gi.test(text)) result = 'Heksa'
  /*3*/ if (/\bhoney\b/gi.test(text)) result = 'Honey'
  /*3*/ if (/\bM\/M\b|mel/gi.test(text)) result = 'M/M'
  /*3*/ if (/\bopal\b/gi.test(text)) result = 'Opal'
  /*3*/ if (/\bopal white\b/gi.test(text)) result = 'Opal White'
  /*3*/ if (/\bPF\b|poliform/gi.test(text)) result = 'Poliform'
  /*3*/ if (/\bPPL\b/gi.test(text)) result = 'PPL'
  /*3*/ if (/OSB/gi.test(text)) result = 'OSB'

  // /*5*/ if (/s12|s13|\bF\/F\b|lamin|folio/gi.test(text)) result = 'F/F'
  // /*5*/ if (/s14|s15|\bF\/W\b|anty/gi.test(text)) result = 'F/W'
  // /*5*/ if (/s16|s17|\bW\/W\b/gi.test(text)) result = 'W/W'

  return result
}

function getFaceGroup(text: string): string | undefined {
  const regexpNatural = /\b(S|B|BB|CP|WG|WGE|C|CC|V)\b/
  const regexpLaminate = /\b(M|F|W)\b/
  let result = ''

  if (
    /s01|s02|s03|s04|s05|s06|s07|s08|s09|s10/gi.test(text) ||
    /s11|s18|s22|s25|s28|s29|s30|s31|s32|s35/gi.test(text) ||
    new RegExp(`${regexpNatural.source}/${regexpNatural.source}`, 'gi').test(text)
  )
    result = 'surowa'
  if (
    /s12|s13|s14|s15|s16|s17|s19|s20|s21|s23|s24|s26|s27/gi.test(text) ||
    new RegExp(`${regexpLaminate.source}/${regexpLaminate.source}`, 'gi').test(text) ||
    /\bPQ\W?F\b/gi.test(text)
  )
    result = 'laminat'

  return result || undefined
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
    if (faceType === 'F/F II') results.add('d.brown')
    if (faceType === 'F/W II') results.add('d.brown')
    if (faceType === 'W/W II') results.add('d.brown')
    if (faceType === 'Heksa') results.add('d.brown')
    if (faceType === 'Honey') results.add('honey')
    if (faceType === 'M/M') results.add('white')
    if (faceType === 'Poliform') results.add('(nieznany)')
    if (faceType === 'Opal') results.add('(nieznany)')
    if (faceType === 'PPL') results.add('(nieznany)')
    if (faceType === 'PQF') results.add('(nieznany)')
  }

  // if (results.size === 0 && faceType) results.add('(brak)')
  // else results.add('(laminat)')
  // if (results.size === 0) results.add('(---)')
  return Array.from(results).join(' ')
}

export function zeroOutPrices(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.purchase = 0
    return el
  })
}

export function zeroOutStocks(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.quantityCubicTotal = 0
    el.quantityStatus = 0
    return el
  })
}

export function zeroOutReservations(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    el.quantityCubicAviable = 0
    el.quantityCubicTotal = 0
    el.quantityStatus = 0
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
  const quantityCubicTotalPcs = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'szt')

  const cub = calcQuant(item.size, evalMath(item.inventory?.m3 || '0'), 'm3', 'szt')
  const sqr = calcQuant(item.size, evalMath(item.inventory?.m2 || '0'), 'm2', 'szt')
  const pcs = calcQuant(item.size, evalMath(item.inventory?.szt || '0'), 'szt', 'szt')
  const diff = cub + sqr + pcs - quantityCubicTotalPcs

  let status = 'pusty'
  if (quantityCubicTotalPcs < 0) status = 'what'
  if (quantityCubicTotalPcs >= 0) {
    if (Math.abs(diff) <= threshold) status = 'OK'
    if (quantityCubicTotalPcs <= threshold) status = 'brak'
    if (quantityCubicTotalPcs == diff) status = 'pusty'
    if (diff < threshold * -1) status = 'brak'
    if (diff > threshold) status = 'nadmiar'
  }
  return status
}

function setQuantityStatus(item: Plywood) {
  const aviable_status = item.quantityCubicAviable || 0 > 0 ? 2 : null
  const total_status = item.quantityCubicTotal > 0 ? 1 : null
  return aviable_status || total_status || 0
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

    if (localItemIndex < 0) {
      incomingItem.inventoryStatus = setInventoryStatus(incomingItem)
      incomingItem.quantityStatus = setQuantityStatus(incomingItem)
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
      localData[localItemIndex].inventoryStatus = setInventoryStatus(localData[localItemIndex])
      localData[localItemIndex].quantityStatus = setQuantityStatus(localData[localItemIndex])
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

  const result = { message: '', data: '' }

  const fetchResponse = await fetch(php_server_url, fetchSettings).catch((err) => {
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
