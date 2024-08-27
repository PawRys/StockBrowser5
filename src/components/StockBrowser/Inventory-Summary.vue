<script setup lang="ts">
import _ from 'lodash'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { calcQuant, evalMath } from '@/exports/common_functions'
import { setInventoryStatus } from '@/exports/stockUpdateExports'

const emit = defineEmits(['refresh'])
const { listView } = storeToRefs(usePreferencesStore())

const summaryDiff = (unit: string) => {
  return useStockStore().items.reduce((acc: number, item: Plywood) => {
    const cub = calcQuant(item.size, evalMath(item.inventory?.m3 || ''), 'm3', unit)
    const sqr = calcQuant(item.size, evalMath(item.inventory?.m2 || ''), 'm2', unit)
    const pcs = calcQuant(item.size, evalMath(item.inventory?.szt || ''), 'szt', unit)
    return acc + cub + sqr + pcs - calcQuant(item.size, item.totalStock, 'm3', unit)
  }, 0)
}

const summaryInput = (unit: string) => {
  return useStockStore().items.reduce((acc: number, item: Plywood) => {
    const cub = calcQuant(item.size, evalMath(item.inventory?.m3 || ''), 'm3', unit)
    const sqr = calcQuant(item.size, evalMath(item.inventory?.m2 || ''), 'm2', unit)
    const pcs = calcQuant(item.size, evalMath(item.inventory?.szt || ''), 'szt', unit)
    return acc + cub + sqr + pcs
  }, 0)
}

const summarySymfo = (unit: string) => {
  return useStockStore().items.reduce((acc: number, item: Plywood) => {
    return acc + calcQuant(item.size, item.totalStock, 'm3', unit)
  }, 0)
}

const zeroOutFilteredInventory = () => {
  const storedItems = JSON.parse(localStorage.SB5_stockList || '[]')
  const filteredItems = useStockStore().items
  filteredItems.map((filteredItem: Plywood) => {
    storedItems.find((storedItem: Plywood) => {
      if (storedItem.id === filteredItem.id) {
        delete storedItem.inventory
        _.merge(storedItem, { inventoryStatus: setInventoryStatus(storedItem) })
      }
    })
  })
  useStockStore().updateData({ stockList: storedItems })
  emit('refresh')
}

function toggleInventoryFilter(item: string) {
  let filter = useFilterStore().inventoryFilter
  filter.match(item)
    ? (useFilterStore().inventoryFilter = filter.replace(item, '').trim())
    : (useFilterStore().inventoryFilter = `${filter} ${item}`.trim())
}

const isActive = computed(() => useFilterStore().inventoryFilter)
// const preFix = computed(() => {
//   if (diff.value > 0) return '+'
//   return ''
// })
</script>

<template>
  <li class="list-summary" v-if="listView === 'inventory'">
    <section class="inventory-summary">
      <!-- <span class="field">{{ summarySymfo('m3').toFixed(3) }}</span>
      <span class="field">{{ summarySymfo('m2').toFixed(2) }}</span>
      <span class="field">{{ summarySymfo('szt').toFixed(1) }}</span>

      <span class="field">{{ summaryInput('m3').toFixed(3) }}</span>
      <span class="field">{{ summaryInput('m2').toFixed(2) }}</span>
      <span class="field">{{ summaryInput('szt').toFixed(1) }}</span> -->

      <span class="field">
        {{ summaryDiff('m3').toFixed(3) }}<small>m<sup>3</sup></small>
      </span>
      <span class="field">
        {{ summaryDiff('m2').toFixed(2) }}<small>m<sup>2</sup></small>
      </span>
      <span class="field">{{ summaryDiff('szt').toFixed(1) }}<small>szt</small></span>
    </section>
    <button @click="zeroOutFilteredInventory()" :disabled="summaryInput('m3') === 0">
      Zeruj filtrowane
    </button>
  </li>
</template>

<style scoped>
.list-summary {
  background: var(--bg2-color);
}
</style>
