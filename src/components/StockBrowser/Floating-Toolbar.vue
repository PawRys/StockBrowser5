<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { openDialogByID } from '@/exports/dialogsExports'
import { usePreferencesStore } from '@/stores/preferencesStore'

const filterStore = useFilterStore()
const { listView } = storeToRefs(usePreferencesStore())
const { items: stockItems } = storeToRefs(useStockStore())
</script>

<template>
  <section class="floating-toolbar" id="floating-toolbar">
    <button class="cta" @click="openDialogByID('list-filter')">
      <i class="bi bi-search"></i>
      <span>Szukaj</span>
    </button>

    <button
      v-if="Object.keys(filterStore.attrFilter).length || filterStore.textFilter"
      @click="filterStore.resetAllFilters"
    >
      <i class="bi bi-trash3"></i>
    </button>
    <span class="filter-count">{{ `Wyników: ${stockItems.length}` }}</span>

    <button v-if="listView === 'prices'" @click="listView = 'inventory'">
      <i class="bi bi-coin"></i>
    </button>
    <button v-if="listView === 'inventory'" @click="listView = 'prices'">
      <i class="bi bi-calculator"></i>
    </button>
  </section>
</template>

<style scoped>
.floating-toolbar {
  position: sticky;
  z-index: 1;
  top: 0ch;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1ch;

  margin: auto;
  padding: 1ch;
  width: fit-content;

  background-color: var(--bg-color);
  border-radius: 0 0 1ch 1ch;
  font-size: 1.1rem;
}

.floating-toolbar .filter-count {
  font-weight: 700;
}
</style>
