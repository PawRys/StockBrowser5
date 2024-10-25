<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import { promptModal } from 'jenesius-vue-modal'
import ListSettingsModal from '@/components/Modals/ListSettingsModal.vue'
import ListFilterModal from '@/components/Modals/ListFilterModal.vue'

const filterStore = useFilterStore()
const { listView } = storeToRefs(usePreferencesStore())
</script>

<template>
  <section class="floating-toolbar" id="floating-toolbar">
    <button class="cta" @click="promptModal(ListFilterModal)">
      <i class="bi bi-search"></i>
      <span>Szukaj</span>
    </button>

    <button
      v-if="Object.keys(filterStore.attrFilter).length || filterStore.textFilter"
      @click="filterStore.resetAllFilters"
    >
      <i class="bi bi-trash3"></i>
    </button>

    <button v-if="listView === 'prices'" @click="listView = 'inventory'">
      <i class="bi bi-coin"></i>
    </button>
    <button v-if="listView === 'inventory'" @click="listView = 'prices'">
      <i class="bi bi-calculator"></i>
    </button>

    <button @click="promptModal(ListSettingsModal)">
      <i class="bi bi-three-dots-vertical"></i>
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
  /* width: fit-content; */

  background-color: var(--bg-color);
  /* border-radius: 0 0 1ch 1ch; */
  font-size: 1.1rem;
}

.filter-count {
  font-weight: 700;
}
</style>
