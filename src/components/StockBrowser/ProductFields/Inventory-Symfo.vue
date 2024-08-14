<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue'
import { calcQuant } from '@/exports/common_functions'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const symfoInventory = computed(() => {
  return calcQuant(item.value.size, item.value.totalStock, 'm3', unit) * -1
})

const zeroFix = computed(() => {
  let result = 2
  if (unit === 'm3') result = 3
  if (unit === 'm2') result = 2
  if (unit === 'szt') result = 1
  return result
})
</script>

<template>
  <span>
    {{ symfoInventory.toFixed(zeroFix) }}
  </span>
</template>

<style scoped></style>
