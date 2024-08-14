<script setup lang="ts">
import { useVatStore } from '@/stores/vatStore'

const vatUnits: Array<'m3' | 'm2' | 'szt'> = ['m3', 'm2', 'szt']
function formatSuper(text: string): string {
  return text.replace(/(\d)/g, '<sup>$1</sup>')
}
</script>
<template>
  <section class="vat-switch-panel">
    <h4>Vat:</h4>
    <label v-for="unit in vatUnits" :key="unit" class="button switch" tabindex="0">
      <span v-html="formatSuper(unit)"></span>
      <input
        type="checkbox"
        name="vat-switch"
        :checked="useVatStore()[unit]"
        @click="useVatStore()[unit] = !useVatStore()[unit]"
        hidden
      />
    </label>
  </section>
</template>

<style scoped>
section {
  display: flex;
}
h4 {
  place-self: center;
  margin: 1ch;
}
</style>
