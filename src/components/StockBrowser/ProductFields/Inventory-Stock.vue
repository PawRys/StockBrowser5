<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue'
import { calcQuant } from '@/exports/common_functions'

const props = defineProps<{
  item: Plywood
  unit: string
  stockName: 'totalStock' | 'aviableStock'
}>()
const { item } = toRefs(props)
const { unit, stockName } = props

const quantity = computed(() => {
  return calcQuant(item.value.size, item.value[stockName], 'm3', unit) * -1
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
</script>

<template>
  <div class="inventory-stock">
    {{ quantity.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
  </div>
</template>

<style scoped>
.inventory-stock {
  grid-row: 1/2;
}
</style>
