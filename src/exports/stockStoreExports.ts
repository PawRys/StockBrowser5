import { calcPrice, calcQuant } from '@/exports/common_functions'
import { useSortingStore } from '@/stores/sortingStore'
import { useFilterStore } from '@/stores/filterStore'
import { storeToRefs } from 'pinia'

export function applyStatusFilter(el: Plywood) {
  return el.quantityStatus >= useFilterStore().statusFilter
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
    const plywoodAttribute = plywood?.attr[k]?.split(' ') || ''
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
    | 'id'
    | 'name'
    | 'size'
    | 'purchase'
    | 'quantityCubicTotal'
    | 'quantityCubicAviable'
    | 'inventoryCubicSum'
    | 'quantityStatus'
  >

  const { sortDir, sortCol, sortUnit } = storeToRefs(useSortingStore())

  const sortingUnits = ['m3', 'm2', 'szt']

  const aValue = a[sortCol.value as keyof SortingColumnsNames] ?? ''
  const bValue = b[sortCol.value as keyof SortingColumnsNames] ?? ''
  const collator = new Intl.Collator(undefined, {
    usage: 'sort',
    numeric: true
  })

  let A = aValue
  let B = bValue
  const x = 1000000
  if (sortCol.value.match(/purchase/i)) {
    A = x * calcPrice(a.size, Number(aValue), 'm3', sortingUnits[sortUnit.value])
    B = x * calcPrice(b.size, Number(bValue), 'm3', sortingUnits[sortUnit.value])
  }
  if (sortCol.value.match(/quantity/i)) {
    A = x * calcQuant(a.size, Number(aValue), 'm3', sortingUnits[sortUnit.value])
    B = x * calcQuant(b.size, Number(bValue), 'm3', sortingUnits[sortUnit.value])
  }
  if (sortCol.value.match(/inventory/i)) {
    const Adiff = Number(aValue) - a['quantityCubicTotal']
    const Bdiff = Number(bValue) - b['quantityCubicTotal']
    A = x * calcQuant(a.size, Adiff, 'm3', sortingUnits[sortUnit.value])
    B = x * calcQuant(b.size, Bdiff, 'm3', sortingUnits[sortUnit.value])
  }
  if (sortDir.value > 0) return collator.compare(A.toString(), B.toString())
  if (sortDir.value < 0) return collator.compare(B.toString(), A.toString())
  return 0
}
