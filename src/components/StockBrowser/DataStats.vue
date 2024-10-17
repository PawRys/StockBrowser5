<script setup lang="ts">
import { watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stockStore'
import { hasPurchase } from '@/exports/common_functions'
// import {  hasReservations } from '@/exports/common_functions'

const { date, items, warehause } = storeToRefs(useStockStore())
const refreshLocalComponent = ref(0)

watch([date, items, warehause], () => {
  refreshLocalComponent.value++
})

function daysDiff() {
  const today = new Date(new Date().toJSON().split('T')[0])
  const subtract = new Date(date.value)
  return (today.getTime() - subtract.getTime()) / 1000 / 60 / 60 / 24
}

function daysDiffWord() {
  const diff = daysDiff()
  if (diff < 0) return `za ${diff * -1} dni`
  if (diff === 0) return 'dziś'
  if (diff === 1) return 'wczoraj'
  if (diff > 1) return `${diff} dni`
}

function warehauseWarning() {
  const wh = warehause.value
  if (wh.split(',').length > 1) return true
  if (wh === 'Wszystkie') return true
}
</script>

<template>
  <section class="data-status" :key="refreshLocalComponent">
    <span :class="{ 'red-font': warehauseWarning() }">
      {{ `Magazyn: ${warehause || ''}` }}
    </span>
    <span :class="{ 'rainbow-text': daysDiff() < 0, 'red-font': daysDiff() >= 2 }">
      {{ `${date || '0000-00-00'} ${daysDiffWord() || '0'}` }}
    </span>
    <span class="overlap" v-if="!hasPurchase()" title="Brak danych o cenach">
      <span>❌</span>
      <span>💵</span>
    </span>
    <!-- <span class="overlap" v-if="!hasReservations()" title="Brak danych o rezerwacjach">
      <span>❌</span>
      <sapn>📦</sapn>
    </span> -->
  </section>
</template>

<style scoped>
.data-status {
  display: flex;
  align-items: baseline;
  gap: 1ch;
}

.overlap > *:nth-child(1) {
  position: absolute;
  z-index: 1;
  bottom: 0;
  right: 0;
  font-size: 0.64em;
}

.rainbow-text {
  background-image: linear-gradient(
    to left,
    violet,
    indigo,
    blue,
    green,
    darkgoldenrod,
    orange,
    red
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.red-font::after {
  content: ' ❗';
}
</style>
