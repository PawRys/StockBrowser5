<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue'
import { calcQuant } from '@/exports/common_functions'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const diff = computed(() => {
  const totalUnitInventory = calcQuant(item.value.size, item.value.inventoryCubicSum, 'm3', unit)
  const totalUnitQuantity = calcQuant(item.value.size, item.value.quantityCubicTotal, 'm3', unit)
  return totalUnitInventory - totalUnitQuantity
})

const zeroFix = computed(() => {
  if (unit === 'm3') return 3
  if (unit === 'm2') return 2
  if (unit === 'szt') return 1
  return 2
})

const unitLabel = computed(() => {
  if (unit.match(/m3/)) return `m<sup>3</sup>`
  if (unit.match(/m2/)) return `m<sup>2</sup>`
  if (unit.match(/szt/)) return `szt`
  return ``
})

const fontColor = computed(() => {
  const color = {
    OK: 'blue-font',
    brak: 'red-font',
    pusty: 'grey-font',
    nadmiar: 'green-font'
  }
  return color[item.value.inventoryStatus as keyof typeof color]
})
</script>

<template>
  <div class="inventory-diff field" :class="fontColor">
    {{ `${diff.toFixed(zeroFix)}` }}<small v-html="unitLabel"></small>
  </div>
</template>

<style scoped>
/* styles in List-Container.vue */
.inventory-diff {
  grid-row: 3 / 4;
}

.green-font::before {
  content: '+';
}
</style>
