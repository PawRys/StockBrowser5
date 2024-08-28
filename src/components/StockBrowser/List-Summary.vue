<script setup lang="ts">
import _ from 'lodash'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { calcQuant, evalMath } from '@/exports/common_functions'
import { setInventoryStatus } from '@/exports/stockUpdateExports'

import { promptModal } from 'jenesius-vue-modal'
import YepNopeModal from '@/components/Modals/YepNopeModal.vue'

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

// const summarySymfo = (unit: string) => {
//   return useStockStore().items.reduce((acc: number, item: Plywood) => {
//     return acc + calcQuant(item.size, item.totalStock, 'm3', unit)
//   }, 0)
// }

const zeroOutFilteredInventory = async () => {
  if (!(await promptModal(YepNopeModal))) return
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

function setFontColor(unit: 'm3' | 'm2' | 'szt') {
  const val = summaryDiff(unit)
  let threshold = 0

  if (unit === 'm3') threshold = 0.01
  if (unit === 'm2') threshold = 0.1
  if (unit === 'szt') threshold = 1

  if (val > -1 * threshold && val < threshold) return 'blue-font'
  if (val >= threshold) return 'green-font'
  if (val <= threshold) return 'red-font'
  return ''
}

const isActive = computed(() => useFilterStore().inventoryFilter)

function toggleInventoryFilter(item: string) {
  let filter = useFilterStore().inventoryFilter
  filter.match(item)
    ? (useFilterStore().inventoryFilter = filter.replace(item, '').trim())
    : (useFilterStore().inventoryFilter = `${filter} ${item}`.trim())
}
</script>

<template>
  <li class="list-summary" v-if="listView === 'inventory'">
    <section class="inventory-summary">
      <header>
        <h4>Sumy filtrowanych pozycji</h4>

        <div>
          <button
            class="button switch compact"
            :class="{ active: isActive.match(/OK/) }"
            @click="toggleInventoryFilter('OK')"
          >
            <i class="bi bi-check-lg"></i>
          </button>
          <button
            class="button switch compact"
            :class="{ active: isActive.match(/brak|nadmiar/) }"
            @click="toggleInventoryFilter('brak nadmiar')"
          >
            <i class="bi bi-plus-slash-minus"></i>
          </button>
          <button
            class="compact"
            @click="zeroOutFilteredInventory()"
            :disabled="summaryInput('m3') === 0"
          >
            <i class="bi bi-trash3"></i>
            Zeruj filtrowane
          </button>
        </div>
      </header>

      <span class="field" :class="setFontColor('m3')">
        {{ summaryDiff('m3').toFixed(3) }}<small>m<sup>3</sup></small>
      </span>

      <span class="field" :class="setFontColor('m2')">
        {{ summaryDiff('m2').toFixed(2) }}<small>m<sup>2</sup></small>
      </span>

      <span class="field" :class="setFontColor('szt')">
        {{ summaryDiff('szt').toFixed(1) }}<small>szt</small>
      </span>
    </section>
  </li>
</template>

<style scoped>
.list-summary {
  background: var(--bg2-color);
}

.list-summary section {
  gap: 1rem 0;
}

.list-summary header {
  grid-column: 1 / 4;
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;
}

.list-summary header h4 {
  margin: 0;
  margin-right: auto;
  white-space: nowrap;
}

.list-summary header div {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4ch;

  margin-left: auto;
}

.list-summary .field {
  font-size: 1.2rem;
}

.list-summary .green-font::before {
  content: '+';
}
</style>
