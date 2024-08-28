<script setup lang="ts">
import { useVatStore } from '@/stores/vatStore'

const vatUnits: Array<'m3' | 'm2' | 'szt'> = ['m3', 'm2', 'szt']
function formatSuper(text: string): string {
  return text.replace(/(\d)/g, '<sup>$1</sup>')
}
</script>
<template>
  <section class="product-vat-switch">
    <!-- <h4>Vat:</h4> -->
    <label v-for="unit in vatUnits" :key="unit" class="button compact" tabindex="0">
      <input
        type="checkbox"
        name="vat-switch"
        :checked="useVatStore()[unit]"
        @click="useVatStore()[unit] = !useVatStore()[unit]"
      />
      <span v-html="formatSuper(unit)"></span>
    </label>
  </section>
</template>

<style scoped>
.product-vat-switch {
  display: inline-flex;
  align-items: flex-end;
}

h4 {
  place-self: center;
  margin: 0;
  margin-right: 0.6ch;
}
</style>
