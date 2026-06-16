<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, computed, inject, toRefs } from 'vue'
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

const vatStore = useVatStore()
type VatKey = 'm3' | 'm2' | 'szt'

const vat_key = (unit.match(/m3|m2|szt/)?.[0] || 'm3') as VatKey
const vat = vatStore[vat_key] ? vatStore.vatValue : 1

const computedPrice = computed(() => {
  let result = 0

  if (unit.match(/purchase/)) {
    result = purchase
  }

  if (unit.match(/m3|m2|szt/)) {
    result = calcPrice(item.value.size, basePrice.value, 'm3', unit) * vat
  }

  if (unit.match(/marg_m3|marg_m2|marg_szt/)) {
    const marg_unit = unit.match(/m3|m2|szt/)![0]
    result = calcPrice(item.value.size, basePrice.value - purchase, 'm3', marg_unit) * vat
  }

  if (unit.match(/perc/)) {
    result = ((basePrice.value - purchase) / purchase) * 100
  }

  if (isNaN(result) || !isFinite(result)) {
    result = 0
  }
  return result
})

function updateBasePrice(event: Event) {
  const target = event.target as HTMLInputElement
  const inputVal = target.value.replace(',', '.')
  userInput.value = inputVal

  if (unit.match(/m3|m2|szt/)) {
    basePrice.value = calcPrice(item.value.size, Number(inputVal), unit, 'm3') / vat
  }

  if (unit.match(/marg_m3|marg_m2|marg_szt/)) {
    const marg_unit = unit.match(/m3|m2|szt/)![0]
    const calculation = calcPrice(item.value.size, Number(inputVal), marg_unit, 'm3')
    basePrice.value = calculation / vat + purchase
    console.log(vat)
  }

  if (unit.match(/perc/)) {
    basePrice.value = (Number(inputVal) / 100 + 1) * purchase
  }
}

const preFix = computed(() => {
  if (unit.match(/marg|perc/) && computedPrice.value >= 0) return '+'
  return ''
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
  if (unit.match(/perc/)) return 1
  return 2
})

function keyguard(event: KeyboardEvent): void {
  if (!event.key.match(/\d|,|\.|-|tab|enter|escape|backspace|delete/i)) {
    event.preventDefault()
  }
}

function fontColor(): string {
  const threshold = 1
  const priceDiff = basePrice.value - purchase
  // if (unit.match(/marg|perc/)) {
  if (priceDiff >= threshold) return 'green-font'
  if (priceDiff <= threshold * -1) return 'red-font'
  // }
  return ''
}

function vatApplied(): string {
  return vatStore[vat_key] ? 'vat-applied' : ''
}
</script>

<template>
  <div
    class="price-display field"
    v-if="!isEdited || unit.match(/marg/)"
    :contenteditable="!unit.match(/marg/)"
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
