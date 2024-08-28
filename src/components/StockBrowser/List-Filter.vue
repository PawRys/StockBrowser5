<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { closeDialog } from '@/exports/dialogsExports'
import { escapeNonword } from '@/exports/common_functions'

import StockStatus from '@/components/StockBrowser/StockStatus-Filter.vue'

const refreshComponent = ref(0)
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
  faceType: 'Klasa',
  sizeT: 'Grubość',
  footSize: 'Rozmiar',
  sizeA: 'Wym A',
  sizeB: 'Wym B',
  // sizeAB: 'Wymiar',
  color: 'Kolor',
  woodType: 'Gatunek',
  glueType: 'Klej'
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

function toggleCheck(id: string) {
  const toggler = document.getElementById(id) as HTMLInputElement
  toggler.checked = !toggler.checked
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
  <dialog id="list-filter" class="filter-window" :key="refreshComponent">
    <header class="filter-window__header">
      <div>
        <!-- empty div -->
      </div>
      <StockStatus />
      <button class="compact" @click="closeDialog">
        <i class="close-button bi bi-x-square-fill"></i>
      </button>
    </header>

    <div class="filter__text-filter--wrapper">
      <input
        class="filter__text-filter"
        type="search"
        name="textSearch"
        placeholder="Szukane słowo"
        v-model="filterStore.textFilter"
      />
    </div>

    <form id="filter__attr-list" class="filter__attr-list" @submit.prevent="getAttrFilterList">
      <fieldset
        class="filter__attr-set"
        v-for="(attrLabel, attrKey) in attrLabels"
        :class="`setKey-${attrKey}`"
        :key="`setKey-${attrKey}`"
      >
        <!-- <h4>{{ attrLabel }}</h4> -->
        <hr />
        <div class="scroll-track">
          <div
            class="filter__attr-item"
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
    </form>

    <footer class="filter-window__footer">
      <button
        class=""
        @click="filterStore.prevFilter"
        :disabled="filterStore.currentFilterIndex <= 0"
      >
        <i class="bi bi-arrow-counterclockwise"></i>
        <span>{{ filterStore.currentFilterIndex }}</span>
      </button>

      <button
        class=""
        @click="filterStore.nextFilter"
        :disabled="filterStore.currentFilterIndex >= filterStore.filterHistory.length - 1"
      >
        <i class="bi bi-arrow-clockwise"></i>
        <span>{{ filterStore.filterHistory.length - 1 - filterStore.currentFilterIndex }}</span>
      </button>

      <button
        class=""
        type="reset"
        @click="filterStore.resetAllFilters"
        :disabled="!appliedFiltersCount"
      >
        <i class="bi bi-trash3"></i>
        <span>{{ `(${appliedFiltersCount})` }}</span>
      </button>

      <button
        class="cta"
        type="submit"
        @click="[formSubmit('filter__attr-list'), closeDialog($event)]"
      >
        <i class="bi bi-search"></i>
        <span>({{ stockItems.length }})</span>
      </button>
    </footer>
  </dialog>
</template>

<style>
body:has(dialog[open]) {
  overflow: hidden;
}
</style>

<style scoped>
dialog[open] {
  display: grid;
  justify-items: center;
  place-content: center;
  grid-template-rows: auto auto 1fr auto;

  inset: 0;
  margin: 0;
  padding: 1ch;
  width: 100svw;
  height: 100svh;
  max-width: 100svw;
  max-height: 100svh;
  background-color: var(--bg-color);
}

.filter-window__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1ch;
  width: 100%;
}

.filter-window__header .close-button {
  font-size: 1.5rem;
  cursor: pointer;
}

.filter-window__footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.4ch;

  margin-block: 1rem 1rem;
}

.filter__text-filter--wrapper {
  margin-block: 1rem;
  width: min(100%, 60ch);
  height: 4ch;
}

.filter__text-filter {
  position: absolute;
  inset: 0;
}

.filter__attr-list {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: auto auto 1fr;
  width: 100%;
  overflow-x: scroll;
}

.scroll-track {
  overflow-x: clip;
  overflow-y: auto;
  /* margin-bottom: 1rem; */
}

.filter__attr-set {
  grid-row: 1 / 4;
  display: flex;
  flex-direction: column;

  margin: 0;
  border: none;
  padding: 0 1ch;
}

.setKey-faceGroup {
  grid-row: 1 / 2;
}
.setKey-glueType {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}
.setKey-woodType {
  grid-row: 3 / 4;
  grid-column: 1 / 2;
  overflow: auto;
}

.filter__attr-set h4 {
  margin: 1ch auto;
}

.filter__attr-set > button,
.filter__attr-set > .button {
  margin-inline: auto;
  width: 100%;
}

.filter__attr-item {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  width: 100%;
}
</style>
