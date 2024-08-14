<script setup lang="ts">
import { ref, computed, defineProps, watch, toRefs } from 'vue'
import { useStockStore } from '@/stores/stockStore'
import { evalMath, calcQuant } from '@/exports/common_functions'
import { setInventoryStatus } from '@/exports/stockUpdateExports'
import _ from 'lodash'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const userInput = ref(item.value.inventory?.[unit as keyof typeof item.value.inventory] || '')
const isEdited = ref(false)

const itemInvSumAll = computed(() => {
  const cub = calcQuant(item.value.size, evalMath(item.value.inventory?.m3 || '0'), 'm3', unit)
  const sqr = calcQuant(item.value.size, evalMath(item.value.inventory?.m2 || '0'), 'm2', unit)
  const pcs = calcQuant(item.value.size, evalMath(item.value.inventory?.szt || '0'), 'szt', unit)
  return cub + sqr + pcs
})

watch(userInput, () => {
  _.merge(item.value, { inventory: { [unit]: userInput.value || '' } })
  _.merge(item.value, { inventoryStatus: setInventoryStatus(item.value) })
  useStockStore().updateItem(item.value)
})

const zeroFix = computed(() => {
  let result = 2
  if (unit === 'm3') result = 3
  if (unit === 'm2') result = 2
  if (unit === 'szt') result = 1
  return result
})

const cssClassList = () => {
  return { written: item.value.inventory?.[unit as keyof typeof item.value.inventory] }
}
</script>

<template>
  <span class="inventoryField" :class="{ isEdited: isEdited }">
    <span v-if="!isEdited" :class="cssClassList()" @focus="isEdited = true" contenteditable="true">
      {{ itemInvSumAll.toFixed(zeroFix) }}
    </span>
    <span v-else>
      <input
        type="text"
        v-model="userInput"
        @blur="isEdited = false"
        @focus="($event.target as HTMLInputElement).select()"
        @keydown.esc="($event.target as HTMLInputElement).blur()"
        @keydown.enter="($event.target as HTMLInputElement).select()"
        @vue:mounted="$el.querySelector('input')?.focus()"
      />
      <span> = {{ evalMath(userInput).toFixed(zeroFix) }}</span>
    </span>
  </span>
</template>

<style scoped>
/* .inventoryField {
  display: flex;
  flex-wrap: nowrap;
} */

.isEdited {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: white;
}

input {
  width: 100%;
  text-align: right;
}

.written::before {
  content: '*';
}
</style>
