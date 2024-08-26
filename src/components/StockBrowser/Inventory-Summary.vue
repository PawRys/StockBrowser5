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
</script>

<template>
  <section class="product-summary">
    <hr />
    <ul>
      <li class="summary">
        <span></span>
        <span></span>
        <span> </span>
        <span>
          <!-- <button
            class="switch"
            :class="{ active: isActive.includes('nadmiar') }"
            @click="toggleInventoryFilter('nadmiar')"
          >
            Nadmiary
          </button>
          <button
            class="switch"
            :class="{ active: isActive.includes('brak') }"
            @click="toggleInventoryFilter('brak')"
          >
            Braki
          </button> -->
          <button
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
          <!-- <button
            class="switch"
            :class="{ active: isActive.includes('pusty') }"
            @click="toggleInventoryFilter('pusty')"
          >
            puste
          </button> -->

          <button @click="zeroOutFilteredInventory()" :disabled="summaryInput('m3') === 0">
            Zeruj filtrowane
          </button>
        </span>
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
            <span>{{ summaryDiff('m3').toFixed(3) }}</span>
            <span>{{ summaryDiff('m2').toFixed(2) }}</span>
            <span>{{ summaryDiff('szt').toFixed(1) }}</span>
          </div>
        </section>
        <span></span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.quant {
  display: grid;
  gap: 0.5ch;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: right;
}
</style>
