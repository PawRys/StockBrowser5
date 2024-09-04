<script setup lang="ts">
// import { computed } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { hasReservations } from '@/exports/common_functions'

const statusList = [
  { label: 'Zerowy', icon: 'bi bi-0-square', show: true },
  { label: 'Całkowity', icon: 'bi bi-boxes', show: true },
  { label: 'Handlowy', icon: 'bi bi-box', show: hasReservations() }
]
</script>

<template>
  <section class="product-status-filter">
    <template v-for="(item, index) in statusList" :key="`status-${index}`">
      <label v-if="item.show" class="button switch compact" tabindex="0">
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

.bi {
  font-size: 1.6rem;
}
</style>
