<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, computed, defineProps, inject, toRefs } from 'vue'
import { useVatStore } from '@/stores/vatStore'
import { calcPrice } from '@/exports/common_functions'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const purchase = item.value.purchase || 0
const basePrice = inject<Ref<number>>('basePrice')!
const isEdited = ref(false)
const userInput = ref()

type VatStoreKeys = 'm3' | 'm2' | 'szt' | 'vatValue'
const isVatStoreKey = (key: string): key is VatStoreKeys =>
  ['m3', 'm2', 'szt', 'vatValue'].includes(key)

const computedPrice = computed(() => {
  const vat = isVatStoreKey(unit) && useVatStore()[unit] ? useVatStore().vatValue : 1
  let result = 0
  if (unit.match(/purchase/)) result = purchase
  if (unit.match(/m3|m2|szt/))
    result = calcPrice(item.value.size, basePrice.value, 'm3', unit) * vat
  if (unit.match(/marg/)) result = basePrice.value - purchase
  if (unit.match(/perc/)) result = ((basePrice.value - purchase) / purchase) * 100
  if (isNaN(result) || !isFinite(result)) result = 0
  return result
})

function updateBasePrice(event: Event) {
  const vat = isVatStoreKey(unit) && useVatStore()[unit] ? useVatStore().vatValue : 1
  const target = event.target as HTMLInputElement
  const inputVal = target.value.replace(',', '.')
  userInput.value = inputVal
  if (unit.match(/m3|m2|szt/))
    basePrice.value = calcPrice(item.value.size, Number(inputVal), unit, 'm3') / vat
  if (unit.match(/marg/)) basePrice.value = Number(inputVal) + purchase
  if (unit.match(/perc/)) basePrice.value = (Number(inputVal) / 100 + 1) * purchase
}

const preFix = computed(() => {
  let result = ''
  if (unit.match(/marg|perc/) && computedPrice.value > 0) result = '+'
  return result
})

const unitLabel = computed(() => {
  if (unit.match(/m3|purchase/)) return `zł/m<sup>3</sup>`
  if (unit.match(/m2/)) return `zł/m<sup>2</sup>`
  if (unit.match(/szt/)) return `zł/szt`
  if (unit.match(/marg/)) return `zł`
  if (unit.match(/perc/)) return `%`
  return ``
})

const zeroFix = computed(() => {
  let result = 2
  if (unit.match(/perc/)) result = 1
  return result
})

function keyguard(event: KeyboardEvent): void {
  if (!event.key.match(/\d|,|\.|-|tab|enter|escape|backspace|delete/i)) {
    event.preventDefault()
  }
}

function fontColor(): string {
  const threshold = 1
  const priceDiff = basePrice.value - purchase
  if (unit.match(/purchase/)) return ''
  if (priceDiff >= threshold) return 'green-font'
  if (priceDiff <= threshold * -1) return 'red-font'
  return ''
}

function vatApplied(): string {
  return isVatStoreKey(unit) && useVatStore()[unit] ? 'vat-applied' : ''
}
</script>

<template>
  <div
    class="price-display field"
    v-if="!isEdited || unit.match(/purchase/)"
    :contenteditable="!unit.match(/purchase/)"
    :class="[fontColor(), vatApplied()]"
    @focus="isEdited = true"
  >
    {{ preFix }}{{ computedPrice.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
  </div>
  <div class="input-wrapper" v-else>
    <input
      class="input"
      type="number"
      :value="userInput ?? computedPrice.toFixed(zeroFix)"
      @input="updateBasePrice"
      @blur="[(isEdited = false), (userInput = null)]"
      @focus="($event.target as HTMLInputElement).select()"
      @keydown="keyguard"
      @keydown.esc="($event.target as HTMLInputElement).blur()"
      @keydown.enter="($event.target as HTMLInputElement).select()"
      @vue:mounted="$el.querySelector('input')?.focus()"
    />
  </div>
</template>

<style scoped>
.input-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1ch;
  width: 100%;
  height: 100%;

  background-color: var(--bg-color);
}

.input {
  position: absolute;
  z-index: 1;
  inset: 0;
  text-align: right;
}

/* Hide arrows in WebKit browsers (Chrome, Safari, Edge) */
.input::-webkit-outer-spin-button,
.input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide arrows in Firefox */
.input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.vat-applied {
  font-weight: 700;
}
</style>
