<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { escapeNonword } from '@/exports/common_functions'

import StockStatus from '@/components/StockBrowser/StockStatusFilter.vue'

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
  faceType: new Set() as Set<string>,
  footSize: new Set() as Set<string>,
  glueType: new Set() as Set<string>,
  woodType: new Set() as Set<string>,
  invStatus: new Set() as Set<string>
}

const attrLabels = {
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
    attrSets.sizeAB.clear()
    attrSets.color.clear()
    attrSets.faceType.clear()
    attrSets.footSize.clear()
    attrSets.glueType.clear()
    attrSets.woodType.clear()

    stockItems.value.forEach((el: Plywood) => {
      attrSets.sizeT.add(el.attr?.sizeT as string)
      attrSets.sizeA.add(el.attr?.sizeA as string)
      attrSets.sizeB.add(el.attr?.sizeB as string)
      attrSets.sizeAB.add(el.attr?.sizeAB as string)
      attrSets.faceType.add(el.attr?.faceType as string)
      attrSets.footSize.add(el.attr?.footSize as string)
      attrSets.glueType.add(el.attr?.glueType as string)
      el.attr?.color?.split(' ').map((el) => attrSets.color.add(el))
      el.attr?.woodType?.split(' ').map((el) => attrSets.woodType.add(el))
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
    firstChild.checked = true
  } else if (!prevSibling?.checked) {
    prevSibling.checked = true
  }
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
  <section class="product-filter" :key="refreshComponent">
    <section class="filter-window__controls">
      <button class="button cta" @click="toggleCheck('filter__toggle')">
        <i class="bi bi-search"></i>
        <span>Filtry</span>
      </button>

      <button
        v-if="Object.keys(filterStore.attrFilter).length || filterStore.textFilter"
        @click="filterStore.resetAllFilters"
      >
        <i class="bi bi-trash3"></i>
      </button>
      <span class="filter-count">{{ `Wyników: ${stockItems.length}` }}</span>
    </section>

    <section class="filter-window">
      <input id="filter__toggle" type="checkbox" hidden />

      <header class="filter-window__header">
        <div>
          <!-- empty div -->
        </div>
        <StockStatus />
        <button class="tight">
          <i class="close-button bi bi-x-square-fill" @click="toggleCheck('filter__toggle')"></i>
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
          :key="`setKey-${attrKey}`"
        >
          <h4>{{ attrLabel }}</h4>
          <div class="scroll-track">
            <div
              class="filter__attr-item"
              v-for="item of Array.from(attrSets[attrKey]).sort(collator.compare)"
              :key="`${attrKey}-${escapeNonword(item)}`"
            >
              <label class="button">
                <input
                  type="checkbox"
                  :value="item"
                  :name="attrKey"
                  :checked="isChecked(attrKey, item)"
                  :id="`${attrKey}-${escapeNonword(item)}`"
                />
              </label>
              <button class="tight" @click="checkSibling">
                <span>{{ item }}</span>
                <!-- <i class="bi bi-chevron-compact-left"></i> -->
              </button>
            </div>
          </div>

          <hr />

          <button type="submit">
            <i class="bi bi-funnel"></i><span>Filtruj</span>
            <!-- <i class="bi bi-chevron-compact-left"></i> -->
          </button>

          <button
            v-if="filterStore.attrFilter[attrKey]"
            @click="[filterStore.resetAttrFilter(attrKey)]"
          >
            <i class="bi bi-trash3"></i><span>Usuń</span>
          </button>
        </fieldset>
      </form>

      <footer class="filter-window__footer">
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

        <button type="reset" @click="filterStore.resetAllFilters">
          <i class="bi bi-trash3"></i>
          <!-- <span>{{ `(${filterStore.attrFilter})` }}</span> -->
          <span>{{ `(${appliedFiltersCount})` }}</span>
          <!-- <span>{{ `(${Object.keys(filterStore.attrFilter).length})` }}</span> -->
          <!-- <span>Usuń wszystkie</span> -->
        </button>

        <button
          class="cta"
          type="submit"
          @click="[formSubmit('filter__attr-list'), toggleCheck('filter__toggle')]"
        >
          <i class="bi bi-search"></i>
          <span>Pokaż wyniki ({{ stockItems.length }})</span>
        </button>
      </footer>
    </section>
  </section>
</template>

<style>
body:has(#filter__toggle:checked) {
  overflow: hidden;
}
body:has(#filter__toggle:checked) .product-filter ~ * {
  display: none;
}
</style>

<style scoped>
.filter-window {
  display: none;
}

.filter-window:has(#filter__toggle:checked) {
  position: fixed;
  z-index: 999999;
  inset: 0;
  overflow: auto;

  display: grid;
  justify-items: center;
  place-content: center;
  /* grid-template-rows: auto auto 1fr auto; */

  padding: 1ch;
  max-height: 100vh;
  max-height: 100svh;
  background-color: var(--bg-color);
}

.filter-window__controls {
  display: flex;
  align-items: center;
  gap: 0.5ch;
}

.filter-window__controls .filter-count {
  font-weight: 700;
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
  display: flex;
  width: 100%;
  overflow-x: scroll;
}

.scroll-track {
  overflow-x: clip;
  overflow-y: auto;
  /* margin-bottom: 1rem; */
}

.filter__attr-set {
  display: flex;
  flex-direction: column;

  margin: 0;
  border: none;
  padding: 1ch;
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
