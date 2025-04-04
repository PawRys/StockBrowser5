<script setup lang="ts">
import _ from 'lodash'
import { ref, computed, defineProps, watch, toRefs } from 'vue'
import { useStockStore } from '@/stores/stockStore'
import { setInventoryStatus, setQuantityStatus } from '@/exports/stockUpdateExports'
import { evalMath, calcQuant, scrollTo } from '@/exports/common_functions'

import MathKeyboard from '@/components/MathKeyboard.vue'

const props = defineProps<{
  item: Plywood
  unit: string
}>()
const { item } = toRefs(props)
const { unit } = props

const userInput = ref(item.value.inventory?.[unit as keyof typeof item.value.inventory] || '')
const isEdited = ref(false)
const saving = ref(false)

const totalInventoryCubicSum = computed(() => {
  const cub = calcQuant(item.value.size, evalMath(item.value.inventory?.m3 || '0'), 'm3', 'm3')
  const sqr = calcQuant(item.value.size, evalMath(item.value.inventory?.m2 || '0'), 'm2', 'm3')
  const pcs = calcQuant(item.value.size, evalMath(item.value.inventory?.szt || '0'), 'szt', 'm3')
  return cub + sqr + pcs
})

const itemInventoryUnitSum = computed(() => {
  return calcQuant(item.value.size, totalInventoryCubicSum.value, 'm3', unit)
})

const debouncedUpdate = _.debounce((item, userInput) => {
  _.merge(item.value, { inventory: { [unit]: userInput.value || '' } })
  _.merge(item.value, { inventoryCubicSum: totalInventoryCubicSum.value || 0 })
  _.merge(item.value, { inventoryStatus: setInventoryStatus(item.value) })
  _.merge(item.value, { quantityStatus: setQuantityStatus(item.value) })
  useStockStore().updateItem(item.value)
  saving.value = false
}, 500)

watch(userInput, () => {
  saving.value = true
  debouncedUpdate(item, userInput)
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

const isFilledWithExpr = () => {
  return item.value.inventory?.[unit as keyof typeof item.value.inventory] ? true : false
}

async function reduceUserInput(event: Event) {
  const removeChar = (event as InputEvent).inputType.match(
    /deleteContentBackward|deleteContentForward/
  )
    ? true
    : false
  const target = event.target as HTMLInputElement
  const normalExpr = target.value
  const resultExpr = removeChar
    ? target.value
    : target.value
        .replace(/ {1,}/gi, '')
        .replace(/([-+][0-9])/gi, ' $1')
        .replace(/([0-9])([(])/gi, '$1*$2')
        .replace(/([)])([0-9])/gi, '$1*$2')
        .replace(/([)])([(])/gi, '$1*$2')

  // const resultExpr = isBacksapce
  //   ? target.value
  //   : prettierExpression(target.value)
  //       .replace(/ {1,}/gi, '')
  //       .replace(/([-+]+[0-9])/gi, ' $1')

  // const resultExpr = normalExpr

  const offset = normalExpr.length - resultExpr.length
  const caretPosition = (target.selectionStart || 0) - offset
  await Promise.resolve((userInput.value = resultExpr))
  target.setSelectionRange(caretPosition, caretPosition)
}

async function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement
  await Promise.resolve((target.style.height = 'auto'))
  target.style.height = target.scrollHeight + 3 + 'px'
  target.scrollTop = target.scrollHeight
}

function scrollToParent(event: Event) {
  const evTarget = event.target as HTMLTextAreaElement
  const targetsParent = evTarget.closest('.listItem') as HTMLElement
  const floatingToolbar = document.querySelector('#floating-toolbar')
  const targetsParentMarginTop = window
    .getComputedStyle(targetsParent)
    .marginTop.replace(/[^0-9,.]/g, '')
    .replace(',', '.')

  const offset = -1 * (floatingToolbar?.clientHeight || 0) - Number(targetsParentMarginTop)
  scrollTo(`#${targetsParent?.id}`, offset)
}
</script>

<template :id="`listItem-${escapeNonword(item.id)}`">
  <div
    class="inventory-display field"
    v-if="!isEdited"
    @focus="isEdited = true"
    contenteditable="true"
  >
    <i class="bi bi-pencil-square" v-if="isFilledWithExpr()"></i>
    {{ itemInventoryUnitSum.toFixed(zeroFix) }}<small v-html="unitLabel"></small>
  </div>

  <div class="inventory-input" v-else>
    <textarea
      rows="1"
      inputmode="none"
      class="user-input"
      v-model="userInput"
      @input="[autoResize($event), reduceUserInput($event)]"
      @focus="[autoResize($event), scrollToParent($event)]"
      @keydown.esc="($event.target as HTMLInputElement).blur()"
      @keydown.prevent.enter="($event.target as HTMLInputElement).select()"
      @vue:mounted="$el.querySelector('.user-input')?.focus()"
      @blur="isEdited = false"
    />
    <span class="input-summary">
      <i v-if="saving" class="bi bi-floppy2-fill saving"></i>
      <span>{{ ` = ` }}</span>
      {{ evalMath(userInput as string).toFixed(zeroFix) }}
      <small v-html="unitLabel"></small>
    </span>
    <MathKeyboard v-if="isEdited" />
  </div>
</template>

<style scoped>
/* styles in List-Container.vue */

:is(.inventory-display, .inventory-input) {
  grid-row: 2/3;
}

.inventory-display:nth-child(4) {
  grid-column: 1/2;
}

.inventory-display:nth-child(5) {
  grid-column: 2/3;
}

.inventory-display:nth-child(6) {
  grid-column: 3/4;
}

.inventory-display .bi {
  color: var(--accent-light);
}

.inventory-input {
  grid-column: 1 / -1;
  z-index: 1;

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1ch;

  background-color: var(--bg-color);
}

.user-input {
  width: 100%;
  min-height: fit-content;
  text-align: right;
  max-height: 6rem;
  overflow: auto;

  white-space: pre-wrap; /* Keep spacing and allow wrapping */
  word-wrap: break-word; /* Allow breaking inside long words */
  overflow-wrap: break-word;
}

.saving {
  /* place-self: center; */
  position: absolute;
  right: 0.5ch;
  z-index: 1;
  background-color: var(--bg-color);
  color: var(--accent-light);
}

.input-summary {
  text-wrap: nowrap;
  font-weight: 500;
  padding-right: 0.5ch;
  place-self: center;
}
</style>
