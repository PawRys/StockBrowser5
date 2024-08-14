<script setup lang="ts">
import { useStockStore } from '@/stores/stockStore'

function daysDiff() {
  const today = new Date(new Date().toJSON().split('T')[0])
  const subtract = new Date(useStockStore().date)
  return (today.getTime() - subtract.getTime()) / 1000 / 60 / 60 / 24
}

function daysDiffWord() {
  const diff = daysDiff()
  if (diff < 0) return `za ${diff * -1} dni`
  if (diff === 0) return 'dziś'
  if (diff === 1) return 'wczoraj'
  if (diff > 1) return `${diff} dni`
}
</script>

<template>
  <section>
    <span>Magazyn: </span>
    <span :class="{ 'red-bg': useStockStore().warehause === 'Wszystkie' }">
      {{ `${useStockStore().warehause || 'null'}` }}
    </span>
    <span :class="{ 'rainbow-text': daysDiff() < 0, 'red-font': daysDiff() >= 2 }">
      {{ `${useStockStore().date || 'null'} ${daysDiffWord() || 'null'}` }}
    </span>
  </section>
</template>

<style scoped>
.red-font {
  color: crimson;
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

.red-bg {
  background-color: orangered;
  padding-inline: 1ch;
}
</style>
