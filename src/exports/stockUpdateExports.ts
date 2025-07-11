/* eslint-disable no-regex-spaces */
/* eslint-disable no-control-regex */
import _ from 'lodash'
import { php_server_url } from '@/exports/urls'

import { calcPrice, calcQuant, evalMath } from '@/exports/common_functions'
import { createDBbackup } from '@/exports/stackManagerExports'
import { promptModal } from 'jenesius-vue-modal'
import InventoryMerge from '@/components/Modals/InventoryMergeModal.vue'

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
    const searchString = `${row[1]} ${row[0]} `
    const unit = getVolumeUnit(row[2])
    const plywood = {} as Plywood
    const plywoodSize = getSize(searchString)

    const unknown = '(?)'
    plywood.id = row[0]
    plywood.name = row[1] || unknown
    plywood.size = plywoodSize || unknown

    if (datatype === 'stocks') {
      const purchaseValue = Number(row[5].replace(',', '.'))
      const quantity = Number(row[3].replace(',', '.'))
      const price = purchaseValue / quantity
      const priceFinite = isFinite(price) ? price : 0
      plywood.purchase = calcPrice(plywoodSize, priceFinite, unit, 'm3')
      plywood.quantityCubicTotal = calcQuant(plywoodSize, quantity, unit, 'm3')
    }

    if (datatype === 'reservations') {
      const total_stock = Number(row[6].replace(',', '.'))
      const aviable_stock = Number(row[3].replace(',', '.'))
      plywood.quantityCubicTotal = calcQuant(plywoodSize, total_stock, unit, 'm3')
      plywood.quantityCubicAviable = calcQuant(plywoodSize, aviable_stock, unit, 'm3')
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
  return `${lo || '?'}x${hi || '?'}'`
}

type VolumeUnit = 'szt' | 'm2' | 'm3' | undefined
function getVolumeUnit(input: string): VolumeUnit {
  const match = input.match(/szt|m2|m3/i)
  return match ? (match[0].toLowerCase() as VolumeUnit) : undefined
}

function getGlueType(text: string): string | undefined {
  let result = undefined
  if (/melamin|M\?M|foliowana|antypo/g.test(text)) result = 'WD'
  if (/wodo|\bWD\b|\bEXT\b|\bE\b/g.test(text)) result = 'WD'
  if (/sucho|\bMR\b|\bINT\b/g.test(text)) result = 'MR'
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
  /*1*/ if (/s12\/|s13\//gi.test(text)) result = 'F/F' // II applied in *4*
  /*1*/ if (/s14\/|s15\//gi.test(text)) result = 'F/W' // II applied in *4*
  /*1*/ if (/s16\/|s17\//gi.test(text)) result = 'W/W' // II applied in *4*
  /*1*/ if (/s18\//gi.test(text)) result = 'CP/C'
  /*1*/ if (/s19\//gi.test(text)) result = 'M/WG'
  /*1*/ if (/s20\//gi.test(text)) result = 'F/BB'
  /*1*/ if (/s21\//gi.test(text)) result = 'F/WG'
  /*1*/ if (/s22\//gi.test(text)) result = 'BB/C'
  /*1*/ if (/s23\//gi.test(text)) result = 'W/BB'
  /*1*/ if (/s24\//gi.test(text)) result = 'W/WG'
  /*1*/ if (/s25\//gi.test(text)) result = 'B/WG'
  /*1*/ if (/s26\//gi.test(text)) result = 'F/WH'
  /*1*/ if (/s27\//gi.test(text)) result = 'W/CP'
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
  /*3*/ if (/\bF\/W\W?H\W?\+|Heksa\W?\+|Heksa Plus/gi.test(text)) result = 'Heksa Plus'
  /*3*/ if (/\bM\/M\b|mel|\bopal white\b/gi.test(text)) result = 'M/M'
  // /*3*/ if (/\bhoney\b/gi.test(text)) result = 'Honey'
  // /*3*/ if (/\bM\/M\b|mel/gi.test(text)) result = 'M/M'
  // /*3*/ if (/\bopal\b/gi.test(text)) result = 'Opal'
  // /*3*/ if (/\bopal white\b/gi.test(text)) result = 'Opal White'
  /*3*/ if (/\bPF\b|poliform/gi.test(text)) result = 'Poliform'
  /*3*/ if (/\bPPL\b/gi.test(text)) result = 'PPL'
  /*3*/ if (/OSB/gi.test(text)) result = 'OSB'

  /*4*/ // !important Apply II grade at the end
  /*4*/ if (/s13\/|s15\/|s17\/|((WT|FA|MA|W|F|M) II)/gi.test(text)) result += ' II'

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

  if (/li[sś]cia/gi.test(text)) results.add('Liściasta')
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

  if (/\bhoney\b/gi.test(text)) results.add('honey')
  if (/yell|zółt[ya]/gi.test(text)) results.add('yellow')
  if (/black|czarn[ya]/gi.test(text)) results.add('black')
  if (/green|zielon[ya]/gi.test(text)) results.add('green')
  if (/blue|niebiesk[ia]/gi.test(text)) results.add('blue')
  if (/\bred\b|czerwon[ya]/gi.test(text)) results.add('red')
  if (/(?<!(opal ?))(white)/gi.test(text)) results.add('white')
  if (/(?<=(opal ?))(white)/gi.test(text)) results.add('opal white')
  if (/c\.less|trans|bezbarwna/gi.test(text)) results.add('c.less')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('l.grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(br|brąz|brown)/gi.test(text)) results.add('l.brown')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(d\.)?(br|brąz|brown)\b/gi.test(text)) results.add('d.brown')

  /* Apply defaults if no color specified */
  if (results.size === 0) {
    if (faceType?.match('F/F')) results.add('d.brown')
    if (faceType?.match('F/W')) results.add('d.brown')
    if (faceType?.match('W/W')) results.add('d.brown')
    if (faceType?.match('Heksa')) results.add('d.brown')
    if (faceType?.match('M/M')) results.add('white')
    // if (faceType?.match('Poliform')) results.add('(nieznany)')
    // if (faceType?.match('PPL')) results.add('(nieznany)')
    // if (faceType?.match('PQF')) results.add('(nieznany)')
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
    if (row.inventoryCubicSum && row.inventoryCubicSum !== 0) return true
  }
  return false
}

export function deleteInventory(data: Plywood[]): Plywood[] {
  return data.map((el) => {
    delete el.inventoryCubicSum
    delete el.inventory
    return el
  })
}

export function setQuantityStatus(item: Plywood) {
  const inventory_status = item.inventoryStatus
  const aviable_status = item.quantityCubicAviable || 0 > 0 ? 2 : null
  const total_status = item.quantityCubicTotal > 0 ? 1 : null
  const quantity_status = aviable_status || total_status || 0

  if (quantity_status === 0 && inventory_status === 'nadmiar') {
    return 1
  } else {
    return quantity_status
  }
}

function setInventoryCubicSum(item: Plywood) {
  const cub = calcQuant(item.size, evalMath(item.inventory?.m3 || '0'), 'm3', 'm3')
  const sqr = calcQuant(item.size, evalMath(item.inventory?.m2 || '0'), 'm2', 'm3')
  const pcs = calcQuant(item.size, evalMath(item.inventory?.szt || '0'), 'szt', 'm3')
  return cub + sqr + pcs

  // if (!item.inventoryCubicSum) return (item.inventoryCubicSum = 0)
  // return item.inventoryCubicSum
}

export function setInventoryStatus(item: Plywood) {
  const threshold = 0.62
  const quantityTotalPcs = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'szt')
  const inventorySumPcs = calcQuant(item.size, item.inventoryCubicSum, 'm3', 'szt')
  const diff = inventorySumPcs - quantityTotalPcs

  let status = 'pusty'
  if (quantityTotalPcs < 0) status = 'what'
  if (quantityTotalPcs >= 0) {
    if (Math.abs(diff) <= threshold) status = 'OK'
    if (quantityTotalPcs <= threshold) status = 'brak'
    if (quantityTotalPcs == diff) status = 'pusty'
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

  if (modal === 'cloud' || modal === 'merge') createDBbackup()
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
    localData = zeroOutStocks(localData || [])
    localData = zeroOutReservations(localData || [])
  }

  for (const incomingItem of incomingData) {
    const localItemIndex = localData.findIndex((localItem) => localItem.id === incomingItem.id)

    if (localItemIndex < 0) {
      localData.push(incomingItem)
    } else {
      if (modal === 'merge') {
        const localItem = localData[localItemIndex]
        const units = ['m3', 'm2', 'szt'] as const
        units.map((unit) => {
          const isLocalDefined = localItem.inventory?.[unit]
          const isIncomingDefined = incomingItem.inventory?.[unit]
          const local = isLocalDefined?.trim() === '' ? '0' : isLocalDefined?.trim()
          const incoming = isIncomingDefined?.trim() === '' ? '0' : isIncomingDefined?.trim()
          if (local && incoming) {
            _.merge(incomingItem.inventory, { [unit]: `${local}+(${incoming})` })
          }
        })
      }

      _.merge(localData[localItemIndex], incomingItem)
    }
  }

  const collator = new Intl.Collator(undefined, {
    usage: 'sort',
    numeric: true
  })

  localData
    .sort((a: Plywood, b: Plywood) => collator.compare(a.id, b.id))
    .map((item: Plywood) => {
      const unknown = '(?)'
      const str = `${item.id} ${item.name}`
      const plywoodSize = item.size || getSize(str)
      const [sizeT = null, sizeA = null, sizeB = null] = plywoodSize?.split('x') || []

      item.inventoryCubicSum = setInventoryCubicSum(item)
      item.inventoryStatus = setInventoryStatus(item)
      item.quantityStatus = setQuantityStatus(item)
      item.size = plywoodSize || unknown
      item.attr = item.attr || {}
      item.attr.sizeT = sizeT || unknown
      item.attr.sizeA = sizeA || unknown
      item.attr.sizeB = sizeB || unknown
      item.attr.sizeAB = `${sizeA}x${sizeB}` || unknown
      item.attr.footSize = getFootSize(plywoodSize) || unknown
      item.attr.faceType = getFaceType(str) || unknown
      item.attr.faceGroup = getFaceGroup(str) || unknown
      item.attr.glueType = getGlueType(str) || unknown
      item.attr.woodType = getWoodType(str) || unknown
      item.attr.color = getColor(str, item.attr.faceType)
    })

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
