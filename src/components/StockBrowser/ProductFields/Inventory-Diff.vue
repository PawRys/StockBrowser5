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

const preFix = computed(() => {
  if (diff.value > 0) return '+'
  return ''
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
  <div class="inventory-diff" :class="fontColor">
    {{ `${preFix}${diff.toFixed(zeroFix)}` }}<small v-html="unitLabel"></small>
  </div>
</template>

<style scoped>
.inventory-diff {
  grid-row: 3/4;
}
</style>
