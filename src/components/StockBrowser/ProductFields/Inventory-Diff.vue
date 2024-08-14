<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue'
import { evalMath, calcQuant } from '@/exports/common_functions'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const diff = computed(() => {
  const cub = calcQuant(item.value.size, evalMath(item.value.inventory?.m3 || '0'), 'm3', unit)
  const sqr = calcQuant(item.value.size, evalMath(item.value.inventory?.m2 || '0'), 'm2', unit)
  const pcs = calcQuant(item.value.size, evalMath(item.value.inventory?.szt || '0'), 'szt', unit)
  return cub + sqr + pcs - calcQuant(item.value.size, item.value.totalStock, 'm3', unit)
})

const zeroFix = computed(() => {
  let result = 2
  if (unit === 'm3') result = 3
  if (unit === 'm2') result = 2
  if (unit === 'szt') result = 1
  return result
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
  <span :class="fontColor">
    {{ diff.toFixed(zeroFix) }}
  </span>
</template>

<style scoped>
.grey-font {
  color: darkslategray;
}
.blue-font {
  color: dodgerblue;
}
.red-font {
  color: crimson;
}
.green-font {
  color: limegreen;
}
</style>
