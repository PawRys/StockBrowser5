<script setup lang="ts">
import { useSortingStore } from '@/stores/sortingStore'

const sortingTable = [
  { column: 'id', label: 'Kod towaru' },
  { column: 'size', label: 'Wymiar' },
  { column: 'price_m3', label: 'Zakup m3' },
  { column: 'price_m2', label: 'Zakup m2' },
  { column: 'price_szt', label: 'Zakup szt' },
  { column: 'quantityCubicTotal_m3', label: 'Całkowity m3' },
  { column: 'quantityCubicTotal_m2', label: 'Całkowity m2' },
  { column: 'quantityCubicTotal_szt', label: 'Całkowity szt' },
  { column: 'quantityCubicAviable_m3', label: 'Handlowy m3' },
  { column: 'quantityCubicAviable_m2', label: 'Handlowy m2' },
  { column: 'quantityCubicAviable_szt', label: 'Handlowy szt' }
]

function sortData(ev: Event) {
  const target = ev.target as HTMLSelectElement
  const value = target.value

  useSortingStore().sortParam = value
  useSortingStore().sortDir *= -1
  const [col, unit] = value.split('_')
  useSortingStore().sortCol = col
  useSortingStore().sortUnit = unit || ''
}
</script>

<template>
  <section class="product-sorting">
    <select @change="sortData">
      <template v-for="st in sortingTable" :key="st.column">
        <option :value="st.column">{{ st.label }}</option>
      </template>
    </select>
    <button @click="useSortingStore().sortDir *= -1" class="compact">
      <i v-if="useSortingStore().sortDir > 0" class="bi bi-sort-down-alt"></i>
      <i v-if="useSortingStore().sortDir < 0" class="bi bi-sort-down"></i>
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
