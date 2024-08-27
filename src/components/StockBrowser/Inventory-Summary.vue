<script setup lang="ts">
import _ from 'lodash'
import { computed } from 'vue'

import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'

import { calcQuant, evalMath } from '@/exports/common_functions'
import { setInventoryStatus } from '@/exports/stockUpdateExports'

const emit = defineEmits(['refresh'])

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
  <section class="product-summary">
    <hr />
    <!-- <button
        class="switch"
        :class="{ active: isActive.match(/brak|nadmiar/) }"
        @click="toggleInventoryFilter('brak nadmiar')"
      >
        Różnice
      </button>
      <button
        class="switch"
        :class="{ active: isActive.includes('OK') }"
        @click="toggleInventoryFilter('OK')"
      >
        OK
      </button>
          

      <button @click="zeroOutFilteredInventory()" :disabled="summaryInput('m3') === 0">
        Zeruj filtrowane
      </button> -->
    <section>
      <div class="quant">
        <span>{{ summarySymfo('m3').toFixed(3) }}</span>
        <span>{{ summarySymfo('m2').toFixed(2) }}</span>
        <span>{{ summarySymfo('szt').toFixed(1) }}</span>
      </div>
      <div class="quant">
        <span>{{ summaryInput('m3').toFixed(3) }}</span>
        <span>{{ summaryInput('m2').toFixed(2) }}</span>
        <span>{{ summaryInput('szt').toFixed(1) }}</span>
      </div>

      <div class="quant">
        <span>
          {{ summaryDiff('m3').toFixed(3) }}<small>m<sup>3</sup></small>
        </span>
        <span>
          {{ summaryDiff('m2').toFixed(2) }}<small>m<sup>2</sup></small>
        </span>
        <span>{{ summaryDiff('szt').toFixed(1) }}<small>szt</small></span>
      </div>
    </section>
    <span></span>
  </section>
</template>

<style scoped>
.product-summary {
  margin-inline: auto;
  margin-block: 0;
  padding: 0.1ch 1ch;
  width: min(100%, 65ch);
  background: var(--bg2-color);
}

.quant {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5ch;
  /* padding-block: 1ch; */
  text-align: right;
}
.quant > span {
  padding: 0.4ch 0.8ch;
}
</style>
