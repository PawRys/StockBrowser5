<script setup lang="ts">
import { inject } from 'vue'
import { storeToRefs } from 'pinia'

import { useStockStore } from '@/stores/stockStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { calcQuant } from '@/exports/common_functions'
import { setInventoryStatus, setQuantityStatus } from '@/exports/stockUpdateExports'

import { promptModal } from 'jenesius-vue-modal'
import YepNopeModal from '@/components/Modals/YepNopeModal.vue'

import QuantityStatus from '@/components/StockBrowser/QuantityStatusSwitch.vue'

import type { Ref } from 'vue'
const refreshMainComponent = inject<Ref<number>>('refreshMainComponent')!

const { listView } = storeToRefs(usePreferencesStore())

const summaryDiff = (unit: string) => {
  return useStockStore().items.reduce((acc: number, item: Plywood) => {
    const totalUnitInventory = calcQuant(item.size, item.inventoryCubicSum, 'm3', unit)
    const totalUnitQuantity = calcQuant(item.size, item.quantityCubicTotal, 'm3', unit)
    return acc + totalUnitInventory - totalUnitQuantity
  }, 0)
}

const zerooutFilteredInventory = async () => {
  const msg = `<b>Zerowanie inwentaryzacji</b><br>
  Ilość zerowanych pozycji: <b>${filledInventoryCount()} z ${useStockStore().items.length}</b> filtrowanych`
  if (!(await promptModal(YepNopeModal, { text: msg, heading: `Wyzerować?` }))) return

  const storedItems = JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
  const filteredItems = useStockStore().items
  filteredItems.map((filteredItem: Plywood) => {
    storedItems.find((storedItem: Plywood) => {
      if (storedItem.id === filteredItem.id) {
        delete storedItem.inventoryCubicSum
        delete storedItem.inventory
        storedItem.inventoryStatus = setInventoryStatus(storedItem)
        storedItem.quantityStatus = setQuantityStatus(storedItem)
      }
    })
  })
  useStockStore().updateData({ stockList: storedItems })
  refreshMainComponent.value++
}

function filledInventoryCount() {
  let counter = 0
  useStockStore().items.map((filteredItem: Plywood) => {
    if (filteredItem.inventory) {
      let check = false
      if (filteredItem.inventory.m3) check = true
      if (filteredItem.inventory.m2) check = true
      if (filteredItem.inventory.szt) check = true
      if (check) counter++
    }
  })
  return counter
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
</script>

<template>
  <section class="list-summary" v-if="listView === 'inventory'">
    <hr />
    <div class="inventory-summary">
      <header>
        <h4>Sumy filtrowanych pozycji</h4>

        <div>
          <QuantityStatus />
          <button
            class="compact"
            @click="zerooutFilteredInventory()"
            :disabled="!filledInventoryCount()"
          >
            <i class="bi bi-backspace-fill"></i>
            Zeruj ({{ `${filledInventoryCount()} z ${useStockStore().items.length}` }})
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
    </div>
  </section>
</template>

<style scoped>
.list-summary {
  background: var(--bg2-color);
  padding: 1ch;
  width: 100%;

  position: sticky;
  z-index: 1;
  bottom: 0;
}

.list-summary hr {
  border-color: var(--accent-lighter);
  margin-block: 0ch 2ch;
}

.list-summary section {
  gap: 1rem 0;
}

.list-summary header {
  grid-column: 1 / 4;
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;
  margin-bottom: 1ch;
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

@media (max-width: 600px) {
  .list-summary header h4 {
    display: none;
  }
}

.list-summary .field {
  font-size: 1.2rem;
}

.list-summary .green-font::before {
  content: '+';
}
</style>
