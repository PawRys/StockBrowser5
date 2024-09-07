<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { hasReservations } from '@/exports/common_functions'
import { useSortingStore } from '@/stores/sortingStore'
const { sortCol, sortDir, sortUnit } = storeToRefs(useSortingStore())

const sortingColumn = [
  { col: 'id', label: 'Kod towaru', icon: '&#xF40A;', show: true },
  { col: 'size', label: 'Wymiar', icon: ' &#xF150;', show: true },
  { col: 'purchase', label: 'Cena zakupu', icon: '&#xF634;', show: true },
  { col: 'quantityCubicTotal', label: 'Stan całkowity', icon: '&#xF685;', show: true },
  {
    col: 'quantityCubicAviable',
    label: 'Stan handlowy',
    icon: '&#xF1C8;',
    show: hasReservations()
  },
  { col: 'inventoryCubicSum', label: 'Spis z natury', icon: '&#xF1E0;', show: true }
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
  <section class="list-sorting">
    <select @change="sortData">
      <template v-for="st in sortingColumn" :key="st.col">
        <option v-if="st?.show" :value="st.col">{{ st.label }}</option>
      </template>
    </select>

    <button
      v-if="sortCol.match(/purchase|quantityCubicTotal|quantityCubicAviable|inventoryCubicSum/i)"
      @click="sortUnit = (sortUnit + 1) % sortingUnits.length"
      class="compact"
    >
      <span v-html="sortingUnits[sortUnit].replace(/(2|3)/, '<sup>$1</sup>')"></span>
    </button>

    <button @click="sortDir *= -1" class="compact">
      <i v-if="sortDir > 0" class="bi bi-sort-down-alt"></i>
      <i v-if="sortDir < 0" class="bi bi-sort-down"></i>
    </button>
  </section>
</template>

<style scoped>
.list-sorting {
  display: inline-flex;
}

i {
  font-size: 1.3rem;
}
</style>
