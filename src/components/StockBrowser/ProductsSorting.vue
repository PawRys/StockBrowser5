<script setup lang="ts">
import { useSortingStore } from '@/stores/sortingStore'

const sortingTable = [
  { column: 'id', label: 'Kod' },
  { column: 'size', label: 'Wymiar' },
  { column: 'price_m3', label: 'Zakup m3' },
  { column: 'price_m2', label: 'Zakup m2' },
  { column: 'price_pcs', label: 'Zakup szt' },
  { column: 'totalStock_m3', label: 'Całkowity m3' },
  { column: 'totalStock_m2', label: 'Całkowity m2' },
  { column: 'totalStock_pcs', label: 'Całkowity szt' },
  { column: 'aviableStock_m3', label: 'Handlowy m3' },
  { column: 'aviableStock_m2', label: 'Handlowy m2' },
  { column: 'aviableStock_pcs', label: 'Handlowy szt' }
]

function sortuj(param: string): void {
  useSortingStore().sortParam = param
  useSortingStore().sortDir *= -1
  const [col, unit] = param.split('_')
  useSortingStore().sortCol = col
  useSortingStore().sortUnit = unit || ''
}
</script>

<template>
  <section class="product-sorting">
    <h3>Sortowanie</h3>
    <template v-for="st in sortingTable" :key="st.column">
      <button @click="sortuj(st.column)">
        {{ st.label }}
      </button>
    </template>
  </section>
</template>

<style scoped></style>
