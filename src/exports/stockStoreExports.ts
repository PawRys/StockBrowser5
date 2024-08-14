import { calcPrice, calcQuant } from '@/exports/common_functions'
import { useSortingStore } from '@/stores/sortingStore'
import { useFilterStore } from '@/stores/filterStore'

export function applyStatusFilter(el: Plywood) {
  return el.stockStatus >= useFilterStore().statusFilter
}

export function applyInventoryFilter(el: Plywood) {
  return useFilterStore().inventoryFilter
    ? !!useFilterStore().inventoryFilter.match(el.inventoryStatus)
    : true
}

export function applyTextFilter(el: Plywood) {
  return `${el.id} ${el.name}`.match(new RegExp(useFilterStore().textFilter, 'gi'))
}

export function applyAttrFilter(plywood: Plywood) {
  const filterStore = useFilterStore()
  const attrFilter = filterStore.attrFilter

  let matchFound = 0
  const filterCategories = Object.keys(attrFilter)
  for (const key of filterCategories) {
    const k = key as keyof typeof attrFilter
    const selectedAttribute = JSON.parse(JSON.stringify(attrFilter[k]))
    const plywoodAttribute = plywood.attr[k].split(' ')
    const attributesSet = [...new Set([...selectedAttribute, ...plywoodAttribute])]
    if (selectedAttribute.length + plywoodAttribute.length > attributesSet.length) {
      matchFound++
    }
  }
  return filterCategories.length === matchFound ? true : false
}

export function applySort(a: Plywood, b: Plywood) {
  type SortingColumnsNames = Pick<
    Plywood,
    'id' | 'name' | 'size' | 'price' | 'totalStock' | 'aviableStock' | 'stockStatus'
  >

  const sortDir = useSortingStore().sortDir
  const sortCol = useSortingStore().sortCol
  const sortUnit = useSortingStore().sortUnit

  const aValue = a[sortCol as keyof SortingColumnsNames] ?? ''
  const bValue = b[sortCol as keyof SortingColumnsNames] ?? ''
  const collator = new Intl.Collator(undefined, {
    usage: 'sort',
    numeric: true
  })

  let lo = aValue
  let hi = bValue
  if (sortCol.match(/price/i)) {
    lo = calcPrice(a.size, Number(aValue), sortUnit, 'm3')
    hi = calcPrice(b.size, Number(bValue), sortUnit, 'm3')
  }
  if (sortCol.match(/Stock/i)) {
    lo = calcQuant(a.size, Number(aValue), sortUnit, 'm3')
    hi = calcQuant(b.size, Number(bValue), sortUnit, 'm3')
  }
  if (sortDir > 0) return collator.compare(lo.toString(), hi.toString())
  if (sortDir < 0) return collator.compare(hi.toString(), lo.toString())
  return 0
}
