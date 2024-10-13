<script setup lang="ts">
import { watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { closeModal } from 'jenesius-vue-modal'

import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'

import { escapeNonword } from '@/exports/common_functions'

import QuantityStatus from '@/components/StockBrowser/QuantityStatusSwitch.vue'

const filterStore = useFilterStore()
const { items: stockItems } = storeToRefs(useStockStore())
const collator = new Intl.Collator(undefined, {
  usage: 'sort',
  numeric: true
})

const attrSets = {
  sizeT: new Set() as Set<string>,
  sizeA: new Set() as Set<string>,
  sizeB: new Set() as Set<string>,
  sizeAB: new Set() as Set<string>,
  color: new Set() as Set<string>,
  footSize: new Set() as Set<string>,
  glueType: new Set() as Set<string>,
  woodType: new Set() as Set<string>,
  faceType: new Set() as Set<string>,
  faceGroup: new Set() as Set<string>
}

const attrLabels = {
  faceGroup: 'Grupa',
  glueType: 'Klej',
  footSize: 'Rozmiar',
  sizeT: 'Grubość',
  color: 'Kolor',
  faceType: 'Klasa',
  sizeA: 'Wym A',
  sizeB: 'Wym B',
  // sizeAB: 'Wymiar',
  woodType: 'Gatunek'
}

watch(
  stockItems,
  () => {
    attrSets.sizeT.clear()
    attrSets.sizeA.clear()
    attrSets.sizeB.clear()
    attrSets.color.clear()
    attrSets.sizeAB.clear()
    attrSets.footSize.clear()
    attrSets.glueType.clear()
    attrSets.woodType.clear()
    attrSets.faceType.clear()
    attrSets.faceGroup.clear()

    stockItems.value.forEach((el: Plywood) => {
      if (el.attr.sizeT) el.attr.sizeT.split(' ').map((el) => attrSets.sizeT.add(el))
      if (el.attr.sizeA) el.attr.sizeA.split(' ').map((el) => attrSets.sizeA.add(el))
      if (el.attr.sizeB) el.attr.sizeB.split(' ').map((el) => attrSets.sizeB.add(el))
      if (el.attr.color) el.attr.color.split(' ').map((el) => attrSets.color.add(el))
      if (el.attr.sizeAB) el.attr.sizeAB.split(' ').map((el) => attrSets.sizeAB.add(el))
      if (el.attr.footSize) el.attr.footSize.split(' ').map((el) => attrSets.footSize.add(el))
      if (el.attr.glueType) el.attr.glueType.split(' ').map((el) => attrSets.glueType.add(el))
      if (el.attr.woodType) el.attr.woodType.split(' ').map((el) => attrSets.woodType.add(el))
      if (el.attr.faceType) el.attr.faceType.split(' ').map((el) => attrSets.faceType.add(el))
      if (el.attr.faceGroup) el.attr.faceGroup.split(' ').map((el) => attrSets.faceGroup.add(el))
    })
  },
  { immediate: true }
)

function getAttrFilterList(e: Event) {
  e.preventDefault()
  const formElement = e.target as HTMLFormElement
  const formData = new FormData(formElement)
  filterStore.attrFilter = Object.fromEntries(
    Array.from(formData.keys()).map((key) => [key, formData.getAll(key)])
  )
}

function formSubmit(id: string) {
  const form = document.getElementById(id) as HTMLFormElement
  form.requestSubmit()
}

function isChecked(filterName: string, filterValue: string) {
  const id = filterName as keyof typeof filterStore.attrFilter
  const check = filterStore.attrFilter[id]?.indexOf(filterValue) ?? -1
  return check >= 0 ? true : false
}

function checkSibling(ev: Event): void {
  const target = ev.currentTarget as HTMLInputElement
  const prevSibling = target?.previousElementSibling as HTMLFormElement
  const firstChild = prevSibling.firstElementChild as HTMLInputElement
  if (!firstChild?.checked) {
    firstChild.checked = !firstChild.checked
  } else if (!prevSibling?.checked) {
    prevSibling.checked = !prevSibling.checked
  }
  // firstChild.checked = !firstChild.checked
  // prevSibling.checked = !prevSibling.checked
}

const appliedFiltersCount = computed(() => {
  return Object.keys(filterStore.attrFilter ?? {}).reduce((acc, item) => {
    return (
      acc + (filterStore.attrFilter?.[item as keyof typeof filterStore.attrFilter]?.length ?? 0)
    )
  }, 0)
})
</script>

<template>
  <div class="dialog-backdrop">
    <div id="main-filter" class="dialog">
      <header class="dialog__header">
        <div>
          <!-- empty div -->
        </div>
        <QuantityStatus />
        <button class="close-button compact" @click="closeModal()">
          <i class="bi bi-x-square-fill"></i>
        </button>
      </header>
      <div class="main-filter__search-input--wrapper">
        <input
          class="main-filter__search-input"
          type="search"
          name="textSearch"
          placeholder="Szukane słowo"
          @keypress.enter="($event.target as HTMLInputElement).blur()"
          v-model="filterStore.textFilter"
        />
      </div>

      <form
        id="main-filter__attr-fieldsets"
        class="main-filter__attr-fieldsets"
        @submit.prevent="getAttrFilterList"
      >
        <template v-for="(attrLabel, attrKey) in attrLabels" :key="`fieldset--${attrKey}`">
          <fieldset class="fieldset" :class="`fieldset--${attrKey}`">
            <hr />
            <div class="fieldset__scroll-track">
              <div
                class="fieldset__item"
                v-for="item of Array.from(attrSets[attrKey]).sort(collator.compare)"
                :key="`${attrKey}-${escapeNonword(item)}`"
              >
                <label class="button compact">
                  <input
                    type="checkbox"
                    :value="item"
                    :name="attrKey"
                    :checked="isChecked(attrKey, item)"
                    :id="`${attrKey}-${escapeNonword(item)}`"
                  />
                </label>
                <button class="compact" @click="checkSibling">
                  <span>{{ item }}</span>
                </button>
              </div>
            </div>
            <button
              class="transparent"
              v-if="filterStore.attrFilter[attrKey]"
              @click="[filterStore.resetAttrFilter(attrKey)]"
            >
              <i class="bi bi-trash3"></i><span>Usuń</span>
            </button>
          </fieldset>
        </template>
      </form>
      <footer class="dialog__footer">
        <button @click="filterStore.prevFilter" :disabled="filterStore.currentFilterIndex <= 0">
          <i class="bi bi-arrow-counterclockwise"></i>
          <span>{{ filterStore.currentFilterIndex }}</span>
        </button>
        <button
          @click="filterStore.nextFilter"
          :disabled="filterStore.currentFilterIndex >= filterStore.filterHistory.length - 1"
        >
          <i class="bi bi-arrow-clockwise"></i>
          <span>{{ filterStore.filterHistory.length - 1 - filterStore.currentFilterIndex }}</span>
        </button>
        <button type="reset" @click="filterStore.resetAllFilters" :disabled="!appliedFiltersCount">
          <i class="bi bi-trash3"></i>
          <span>{{ appliedFiltersCount }}</span>
        </button>
        <button
          class="cta"
          type="submit"
          @click="[formSubmit('main-filter__attr-fieldsets'), closeModal()]"
        >
          <i class="bi bi-search"></i>
          <span>{{ stockItems.length }}</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<style>
body:has(dialog[open]) {
  overflow: hidden;
}
</style>

<style scoped>
.dialog {
  display: grid;
  justify-items: center;
  place-content: center;
  grid-template-rows: auto auto 1fr auto;

  position: fixed;
  z-index: 999;
  inset: 0;
  margin: 0;
  padding: 1ch;
  width: 100dvw;
  height: 100dvh;
  max-width: 100dvw;
  max-height: 100dvh;
  background-color: var(--bg-color);
}

.dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1ch;
  width: 100%;
}

.dialog__header .close-button {
  font-size: 1.5rem;
  cursor: pointer;
}

.dialog__footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.4ch;

  margin-block: 1rem 1rem;
}

.main-filter__search-input--wrapper {
  margin-block: 0.5rem;
  width: min(100%, 60ch);
  height: 4ch;
}

.main-filter__search-input {
  position: absolute;
  inset: 0;
}

.main-filter__attr-fieldsets {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(autofit, 1fr);
  grid-template-rows: auto auto auto 1fr;
  width: 100%;
  overflow-x: scroll;
}

.fieldset {
  grid-row: 1 / 5;
  display: flex;
  flex-direction: column;

  margin: 0;
  padding: 0 1ch;
  border: none;
}

.fieldset > button,
.fieldset > .button {
  margin-inline: auto;
  width: 100%;
}

.fieldset__scroll-track {
  overflow-x: clip;
  overflow-y: auto;
}

.fieldset--faceGroup {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.fieldset--footSize {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}

.fieldset--glueType {
  grid-column: 1 / 2;
  grid-row: 3 / 4;
}

.fieldset__item {
  display: flex;
  align-items: center;
  width: 100%;
}

/** */
/* .main-filter__attr-fieldsets .bi {
  grid-row: 1/2;
  position: sticky;
  inset: 0rem;
  color: var(--accent-light);
  color: transparent;
  display: block;
  width: min-content;
} */

/* .main-filter__attr-fieldsets .bi:nth-of-type(9) {
  color: var(--accent-light);
} */
</style>
