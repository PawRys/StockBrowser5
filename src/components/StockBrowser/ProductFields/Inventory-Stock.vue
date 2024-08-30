<script setup lang="ts">
import { computed, defineProps, toRefs } from 'vue'
import { storeToRefs } from 'pinia'

import { calcQuant } from '@/exports/common_functions'
import { usePreferencesStore } from '@/stores/preferencesStore'

const { listView } = storeToRefs(usePreferencesStore())

const props = defineProps<{
  item: Plywood
  unit: string
  quantityStatus: number
}>()
const { item, quantityStatus } = toRefs(props)
const { unit } = props

const stockNameList: { [key: number]: 'quantityCubicTotal' | 'quantityCubicAviable' } = {
  0: 'quantityCubicTotal',
  1: 'quantityCubicTotal',
  2: 'quantityCubicAviable'
}

const quantity = computed(() => {
  const whichStock =
    listView.value === 'prices' ? stockNameList[quantityStatus.value] : 'quantityCubicTotal'
  const m = listView.value === 'prices' ? 1 : -1
  return calcQuant(item.value.size, item.value[whichStock], 'm3', unit) * m
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
  <div class="inventory-stock field">
    <i v-if="quantityStatus === 0" class="bi bi-0-square"></i>
    <i v-if="quantityStatus === 1" class="bi bi-boxes"></i>
    <i v-if="quantityStatus === 2" class="bi bi-box"></i>
    {{ quantity.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
  </div>
</template>

<style scoped>
/* styles in List-Container.vue */

.inventory-stock {
  grid-row: 1 / 2;
}

.bi {
  color: var(--grey-color);
}
</style>
