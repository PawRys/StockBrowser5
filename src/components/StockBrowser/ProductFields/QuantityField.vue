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
  let result = 2
  if (unit === 'm3') result = 3
  if (unit === 'm2') result = 2
  if (unit === 'szt') result = 1
  return result
})

const unitLabel = computed(() => {
  if (unit.match(/m3/)) return `m<sup>3</sup>`
  if (unit.match(/m2/)) return `m<sup>2</sup>`
  if (unit.match(/szt/)) return `szt`
  return ``
})
</script>

<template>
  <span> {{ quantity.toFixed(zeroFix) }}<small v-html="unitLabel"></small> </span>
</template>

<style scoped></style>
