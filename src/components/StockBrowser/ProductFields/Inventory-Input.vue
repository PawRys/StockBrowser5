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

const notNull = () => {
  return item.value.inventory?.[unit as keyof typeof item.value.inventory] ? true : false
}
</script>

<template>
  <div class="inventory-display" v-if="!isEdited" @focus="isEdited = true" contenteditable="true">
    <i class="bi bi-pencil-square" v-if="notNull()"></i>
    <!-- <i class="bi bi-clipboard-plus-fill" :class="{ 'not-null': notNull() }"></i> -->
    {{ itemInvSumAll.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
  </div>

  <div class="inventory-input" v-else>
    <input
      type="text"
      v-model="userInput"
      @blur="isEdited = false"
      @focus="($event.target as HTMLInputElement).select()"
      @keydown.esc="($event.target as HTMLInputElement).blur()"
      @keydown.enter="($event.target as HTMLInputElement).select()"
      @vue:mounted="$el.querySelector('input')?.focus()"
    />
    <span class="input-summary">
      {{ `= ${evalMath(userInput).toFixed(zeroFix)}` }}<small v-html="unitLabel"></small>
    </span>
  </div>
</template>

<style scoped>
:is(.inventory-display, .inventory-input) {
  grid-row: 2/3;
}

.inventory-display {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  padding-inline: 0.4ch;
  border: dotted 1px var(--accent-lighter);
  width: 100%;
  cursor: pointer;
}

.inventory-display .bi {
  margin-right: auto;
  padding-right: 0.4ch;
  place-self: center;
  font-size: 0.9em;
  color: var(--accent-light);
}

.inventory-input input {
  text-align: right;
}

.inventory-input {
  grid-column: 1 / -1;
  position: absolute;
  z-index: 1;

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1ch;
  width: 100%;

  background-color: var(--bg-color);
}

.input-summary {
  text-wrap: nowrap;
  font-weight: 600;
  padding-right: 0.4ch;
}
</style>
