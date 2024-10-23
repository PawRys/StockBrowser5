<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { hasReservations } from '@/exports/common_functions'

const { items: stockItems } = storeToRefs(useStockStore())
const statusList = [
  { label: 'Zerowy', icon: 'bi bi-0-square', show: true },
  { label: 'Całkowity', icon: 'bi bi-boxes', show: true },
  { label: 'Handlowy', icon: 'bi bi-box', show: hasReservations() }
]

const isActive = computed(() => useFilterStore().inventoryFilter)
const random = Math.round(Math.random() * 1000000)
const hasZeroStatusInventory = ref(false)

function toggleInventoryFilter(item: string) {
  let filter = useFilterStore().inventoryFilter
  filter.match(item)
    ? (useFilterStore().inventoryFilter = filter.replace(item, '').trim())
    : (useFilterStore().inventoryFilter = `${filter} ${item}`.trim())
}

watch(
  stockItems,
  () => {
    const localData = JSON.parse(localStorage.getItem('SB5_stockList') || '[]') as Plywood[]

    let test = false
    for (const item of localData) {
      if (item.quantityStatus === 0 && item.inventoryStatus !== 'pusty') {
        test = true
        break
      }
    }
    hasZeroStatusInventory.value = test
  },
  { immediate: true }
)
</script>

<template>
  <section class="product-status-filter">
    <button
      class="button switch compact"
      :class="{ active: isActive.match(/OK/) }"
      @click="toggleInventoryFilter('OK')"
    >
      <i class="bi bi-emoji-smile"></i>
    </button>
    <button
      class="button switch compact"
      :class="{ active: isActive.match(/brak|nadmiar/) }"
      @click="toggleInventoryFilter('brak nadmiar')"
    >
      <i class="bi bi-plus-slash-minus"></i>
    </button>

    <template v-for="(item, index) in statusList" :key="`status-${index}-${random}`">
      <label
        v-if="item.show"
        class="button switch compact"
        :class="{ hasZeroInventory: index === 0 && hasZeroStatusInventory }"
        tabindex="0"
      >
        <input
          :type="'radio'"
          :value="index"
          :name="`statusFilter-${random}`"
          v-model="useFilterStore().statusFilter"
          :checked="useFilterStore().statusFilter == index"
          hidden
        />
        <i :class="item.icon" :title="`Stan ${item.label.toLowerCase()}`"></i>
        <!-- <small>{{ item.label.toLowerCase() }}</small> -->
      </label>
    </template>
  </section>
</template>

<style scoped>
.product-status-filter {
  display: flex;
  gap: 0.5ch;
}

.button {
  flex-direction: column;
}

.hasZeroInventory::after {
  content: '';
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 1rem;
  background-color: var(--cta-color);
  position: absolute;
  top: -0.1rem;
  right: -0.1rem;
}
</style>
