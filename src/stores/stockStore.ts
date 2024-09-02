import type { Ref } from 'vue'

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import _ from 'lodash'

import {
  applySort,
  applyAttrFilter,
  applyTextFilter,
  applyStatusFilter,
  applyInventoryFilter
} from '@/exports/stockStoreExports'

const localStorageSB5_stockList = ref(localStorage.getItem('SB5_stockList') || '[]')
const localStorageSB5_stockDate = ref(localStorage.getItem('SB5_stockDate') || '')
const localStorageSB5_stockWarehause = ref(localStorage.getItem('SB5_stockWarehause') || '')

export const useStockStore = defineStore(
  'SB5_stockStore',
  () => {
    const date = computed(() => localStorageSB5_stockDate.value)
    const warehause = computed(() => localStorageSB5_stockWarehause.value)
    const items = <Ref<Plywood[]>>computed(() =>
      JSON.parse(localStorageSB5_stockList.value)
        .filter((el: Plywood) => applyStatusFilter(el))
        .filter((el: Plywood) => applyInventoryFilter(el))
        .filter((el: Plywood) => applyTextFilter(el))
        .filter((el: Plywood) => applyAttrFilter(el))
        .sort((a: Plywood, b: Plywood) => applySort(a, b))
    )

    function updateItem(incomingItem: Plywood): void {
      const localData = JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
      const localItemIndex = localData.findIndex(
        (localItem: Plywood) => localItem.id === incomingItem.id
      )
      _.merge(localData[localItemIndex], incomingItem)
      const data = JSON.stringify(localData)
      localStorage.setItem('SB5_stockList', data)
      localStorageSB5_stockList.value = data
    }

    function updateData(incomingData: DBSchema): void {
      console.time('updateData')
      localStorage.setItem('SB5_stockList', JSON.stringify(incomingData.stockList))
      localStorageSB5_stockList.value = JSON.stringify(incomingData.stockList)

      const stockDate = incomingData.stockDate || localStorage.getItem('SB5_stockDate') || ''
      localStorage.setItem('SB5_stockDate', stockDate)
      localStorageSB5_stockDate.value = stockDate

      const stockWarehause =
        incomingData.stockWarehause || localStorage.getItem('SB5_stockWarehause') || ''
      localStorage.setItem('SB5_stockWarehause', stockWarehause)
      localStorageSB5_stockWarehause.value = stockWarehause
      console.timeEnd('updateData')
    }

    return { items, date, warehause, updateItem, updateData }
  },
  {
    persist: false
  }
)
