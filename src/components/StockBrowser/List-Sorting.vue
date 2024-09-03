<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSortingStore } from '@/stores/sortingStore'
const { sortCol, sortDir, sortUnit } = storeToRefs(useSortingStore())

const sortingColumn = [
  { col: 'id', label: 'Kod towaru' },
  { col: 'size', label: 'Wymiar' },
  { col: 'purchase', label: 'Cena zakupu' },
  { col: 'quantityCubicTotal', label: 'Stan całkowity' },
  { col: 'quantityCubicAviable', label: 'Stan handlowy' },
  { col: 'inventoryCubicSum', label: 'Spis z natury' }
]

// const sortingUnit = ['szt', 'm2', 'm3']
const sortingUnits = ['m3', 'm2', 'szt']

function sortData(ev: Event) {
  const target = ev.target as HTMLSelectElement
  const value = target.value
  // useSortingStore().sortResetDir = value
  sortCol.value = value
}
</script>

<template>
  <section class="product-sorting">
    <select @change="sortData">
      <template v-for="st in sortingColumn" :key="st.column">
        <option :value="st.col">{{ st.label }}</option>
      </template>
    </select>

    <button @click="sortUnit = (sortUnit + 1) % sortingUnits.length" class="compact">
      <span>{{ sortingUnits[sortUnit] }}</span>
    </button>

    <button @click="sortDir *= -1" class="compact">
      <i v-if="sortDir > 0" class="bi bi-sort-down-alt"></i>
      <i v-if="sortDir < 0" class="bi bi-sort-down"></i>
    </button>
  </section>
</template>

<style scoped>
.product-sorting {
  display: inline-flex;
}

i {
  font-size: 1.3rem;
}
</style>
