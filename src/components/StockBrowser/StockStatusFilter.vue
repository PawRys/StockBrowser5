<script setup lang="ts">
import { computed } from 'vue'
import { useFilterStore } from '@/stores/filterStore'

const statusList = [
  { label: 'Zerowy', icon: 'bi bi-0-circle' },
  { label: 'Całkowity', icon: 'bi bi-boxes' },
  { label: 'Handlowy', icon: 'bi bi-box' }
]

const isActive = computed(() => useFilterStore().inventoryFilter)

function toggleInventoryFilter(item: string) {
  let filter = useFilterStore().inventoryFilter
  filter.match(item)
    ? (useFilterStore().inventoryFilter = filter.replace(item, '').trim())
    : (useFilterStore().inventoryFilter = `${filter} ${item}`.trim())
}
</script>

<template>
  <section class="status-filter-panel">
    <button
      class="button switch tight"
      :class="{ active: isActive.match(/brak|nadmiar/) }"
      @click="toggleInventoryFilter('brak nadmiar')"
    >
      <i class="bi bi-plus-slash-minus"></i>
      <small>różnice</small>
    </button>

    <label
      v-for="(item, index) in statusList"
      :key="`status-${index}`"
      class="button switch tight"
      tabindex="0"
    >
      <input
        :id="`status-${index}`"
        :type="'radio'"
        :value="index"
        name="statusFilter"
        v-model="useFilterStore().statusFilter"
        hidden
      />
      <i :class="item.icon" :title="`Stan ${item.label.toLowerCase()}`"></i>
      <small>{{ item.label.toLowerCase() }}</small>
    </label>
  </section>
</template>

<style scoped>
.status-filter-panel {
  display: flex;
  gap: 0.5ch;
}

.button {
  flex-direction: column;
}

.bi {
  font-size: 1.6rem;
}
</style>
