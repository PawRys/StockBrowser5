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

const formColumns = {
  col_1: { faceGroup: 'Grupa', footSize: 'Rozmiar', color: 'Kolor', glueType: 'Klej' },
  col_2: { sizeT: 'Grubość' },
  col_3: { faceType: 'Klasa' },
  col_4: { sizeA: 'Wym A' },
  col_5: { sizeB: 'Wym B' },
  col_6: { woodType: 'Gatunek' }
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
  const textFilterCount = filterStore.textFilter.length > 0 ? 1 : 0
  const attrFilterCount = Object.keys(filterStore.attrFilter ?? {}).reduce((acc, item) => {
    return (
      acc + (filterStore.attrFilter?.[item as keyof typeof filterStore.attrFilter]?.length ?? 0)
    )
  }, 0)

  return textFilterCount + attrFilterCount
})
</script>

<template>
  <div class="dialog-backdrop">
    <div id="main-filter" class="dialog">
      <header class="dialog__header">
        <!-- empty div -->
        <!-- <div>
        </div> -->
        <div class="text-filter--wrapper">
          <input
            class="text-filter"
            type="text"
            name="textSearch"
            placeholder="Szukaj tekstowo"
            @keypress.enter="($event.target as HTMLInputElement).blur()"
            v-model="filterStore.textFilter"
          />
          <button
            class="transparent"
            v-if="filterStore.textFilter !== ''"
            @click="filterStore.textFilter = ''"
          >
            <i class="bi bi-trash3"></i>
          </button>
        </div>

        <button class="close-button compact" @click="closeModal()">
          <i class="bi bi-x-square-fill"></i>
        </button>
      </header>

      <form
        id="attribute-filter"
        class="attribute-filter--off form"
        @submit.prevent="getAttrFilterList"
      >
        <div class="form-column" v-for="(colValue, colKey) in formColumns" :key="`form-${colKey}`">
          <fieldset
            class="form-fieldset"
            :class="`form-fieldset--${fieldsetKey}`"
            v-for="(fieldsetLabel, fieldsetKey) in colValue"
            :key="`fieldset-${fieldsetKey}`"
          >
            <h4 class="form-fieldset__h4">{{ fieldsetLabel }}</h4>

            <div
              class="form-fieldset__item"
              v-for="item of Array.from(attrSets[fieldsetKey] as Iterable<string>).sort(
                collator.compare
              )"
              :key="`${fieldsetKey}-${escapeNonword(item)}`"
            >
              <label class="button compact">
                <input
                  type="checkbox"
                  :value="item"
                  :name="fieldsetKey"
                  :checked="isChecked(fieldsetKey, item)"
                  :id="`${fieldsetKey}-${escapeNonword(item)}`"
                />
              </label>
              <button class="compact" @click="checkSibling">
                <span>{{ item }}</span>
              </button>
            </div>

            <button
              class="transparent"
              v-if="filterStore.attrFilter[fieldsetKey]"
              @click="[filterStore.resetAttrFilter(fieldsetKey)]"
            >
              <i class="bi bi-trash3"></i><span>Usuń</span>
            </button>
          </fieldset>
        </div>
      </form>

      <footer class="dialog__footer">
        <QuantityStatus />
        <div>
          <button @click="filterStore.prevFilter" :disabled="filterStore.currentFilterIndex <= 0">
            <i class="bi bi-arrow-counterclockwise"></i>
            <!-- <span>{{ filterStore.currentFilterIndex }}</span> -->
          </button>
          <button
            @click="filterStore.nextFilter"
            :disabled="filterStore.currentFilterIndex >= filterStore.filterHistory.length - 1"
          >
            <i class="bi bi-arrow-clockwise"></i>
            <!-- <span>{{ filterStore.filterHistory.length - 1 - filterStore.currentFilterIndex }}</span> -->
          </button>
          <button
            type="reset"
            @click="filterStore.resetAllFilters"
            :disabled="!appliedFiltersCount"
          >
            <i class="bi bi-trash3"></i>
            <span>{{ appliedFiltersCount }}</span>
          </button>
          <button class="cta" type="submit" @click="[formSubmit('attribute-filter'), closeModal()]">
            <i class="bi bi-search"></i>
            <span>{{ stockItems.length }}</span>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  display: grid;
  justify-items: center;
  justify-content: center;
  grid-template-rows: auto 1fr auto;

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
  display: grid;
  justify-items: center;
  gap: 1ch;

  margin-block: 1rem 1rem;
}

.text-filter--wrapper {
  margin-block: 0.5rem;
  width: min(100%, 60ch);
  height: 4ch;
  display: flex;
  justify-content: flex-end;
}

.text-filter {
  flex-grow: 1;
}

.form {
  display: grid;
  grid-template-columns: repeat(6, min-content);
  width: 100%;
  overflow-x: scroll;
}

.form-column {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  height: 100%;
  overflow-y: auto;
}

.form-fieldset {
  margin: 0;
  border: none;
  padding: 0.5ch;
}

.form-fieldset__h4 {
  margin: 0;
  font-size: 0.9em;
  position: sticky;
  z-index: 1;
  top: 0;
  background-color: var(--bg-color);
}

.form-fieldset__item {
  display: flex;
}
</style>
