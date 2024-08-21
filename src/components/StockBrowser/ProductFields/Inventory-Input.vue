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

const unitLabel = computed(() => {
  if (unit.match(/m3/)) return `m<sup>3</sup>`
  if (unit.match(/m2/)) return `m<sup>2</sup>`
  if (unit.match(/szt/)) return `szt`
  return ``
})

const cssClassList = () => {
  return { 'bi written': item.value.inventory?.[unit as keyof typeof item.value.inventory] }
}
</script>

<template>
  <span class="inventory-input" :class="{ isEdited: isEdited }">
    <span v-if="!isEdited" :class="cssClassList()" @focus="isEdited = true" contenteditable="true">
      {{ itemInvSumAll.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
    </span>
    <span class="input-wrap" v-else>
      <input
        type="text"
        v-model="userInput"
        @blur="isEdited = false"
        @focus="($event.target as HTMLInputElement).select()"
        @keydown.esc="($event.target as HTMLInputElement).blur()"
        @keydown.enter="($event.target as HTMLInputElement).select()"
        @vue:mounted="$el.querySelector('input')?.focus()"
      />
      <span class="subSum">
        {{ ` = ${evalMath(userInput).toFixed(zeroFix)}` }}<small v-html="unitLabel"></small>
      </span>
    </span>
  </span>
</template>

<style scoped>
.inventory-input {
  grid-row: 2 / 3;
}

.isEdited {
  position: absolute;
  z-index: 1;
  grid-column: 1 / -1;
  width: 100%;
  background-color: var(--bg-color);
}

.input-wrap {
  display: flex;
}

.input-wrap input {
  flex-grow: 1;
  padding: 0;
  min-width: 10ch;
}
.subSum {
  text-wrap: nowrap;
}

.written {
  align-items: baseline;
}

.written::before {
  content: '\F72D';
  color: var(--accent-color-normal);
}
</style>
