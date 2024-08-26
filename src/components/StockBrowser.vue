<script setup lang="ts">
import { ref } from 'vue'
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import InventorySummary from '@/components/StockBrowser/InventorySummary.vue'
import ProductsList from '@/components/StockBrowser/ProductsList.vue'
import VatSwitch from '@/components/StockBrowser/VatSwitch.vue'
import Paginate from '@/components/StockBrowser/ProductsPagination.vue'
import Sorting from '@/components/StockBrowser/ProductsSorting.vue'
import Filter from '@/components/StockBrowser/ProductsFilter.vue'

const refreshComponent = ref(0)

function condition(): string {
  if (!localStorage.SB5_stockList || localStorage.SB5_stockList === '{}') return 'nodatabase'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter >= 2) return 'trymore'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 1) return 'tryzero'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 0) return 'notexist'
  return 'data'
}

function openDialogByID(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement
  if (dialog) {
    dialog.showModal()
  }
}

function closeDialog(ev: Event) {
  const button = ev.target as HTMLElement
  const closestDialog = button.closest('dialog')
  if (closestDialog) {
    closestDialog.close()
  }
}
</script>

<template>
  <section>
    <div class="notdata" v-if="condition() === 'nodatabase'">
      <h3>Baza danych jest pusta.</h3>
      <p>
        <button class="cta" @click="usePreferencesStore().activeWindow = 'StockUpdate'">
          <i class="bi bi-download"></i>
          <span>Dodaj</span>
        </button>
      </p>
    </div>

    <div class="notdata" v-if="condition() === 'trymore'">
      <h3>Nie znaleziono takiego produktu w stanach handlowych <i class="bi bi-box"></i></h3>
      <button class="" @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button class="" @click="useFilterStore().statusFilter = 1">
        <i class="bi bi-boxes"></i><span>Pokaż stan całkowity</span>
      </button>
      <button class="" @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div class="notdata" v-if="condition() === 'tryzero'">
      <h3>Nie znaleziono takiego produktu w stanach całkowitych <i class="bi bi-boxes"></i></h3>
      <button class="" @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button class="" @click="useFilterStore().statusFilter = 0">
        <i class="bi bi-0-circle"></i><span>Pokaż stan zerowy</span>
      </button>
      <button class="" @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div class="notdata notexist" v-if="condition() === 'notexist'">
      <h3>Wygląda na to, że taka sklejka nie istnieje 🤔</h3>
      <button class="light" @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button class="light" @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div v-show="condition() === 'data'">
      <Filter />
      <dialog id="listSettings">
        <header>
          <button @click="closeDialog"><i class="bi bi-x-square-fill"></i></button>
        </header>
        <section>
          <h4>Ilość wyników</h4>
          <span> <Paginate :show="['setPageSize']" /> na stronę </span>

          <h4>Sortowanie</h4>
          <Sorting />

          <h4>Doliczanie VATu</h4>
          <VatSwitch />
        </section>
      </dialog>
      <div class="toolbar">
        <Paginate id="main-pagination" :show="['setPage']" />
        <button @click="openDialogByID('listSettings')" class="compact">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <ProductsList :key="refreshComponent" />
      <div class="toolbar">
        <Paginate :show="['setPage']" />
      </div>
      <InventorySummary @refresh="refreshComponent++" />
    </div>
  </section>
</template>

<style scoped>
.notdata {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1ch;

  margin: auto;
  padding: 1rem;
  width: min(100%, 40rem);
  text-align: center;
}

.notdata h3 {
  font-size: 1.7rem;
  font-weight: 600;
}

.notdata button {
  font-size: 1.2rem;
}
.notdata .toned {
  margin-inline: 2rem;
}

.notexist {
  display: block;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1ch;
  margin-inline: auto;
  width: min(100%, 65ch);
  background: var(--bg2-color);
}

.toolbar:first-of-type {
  padding: 1ch 1ch 0 1ch;
  border-radius: 1.5ch 1.5ch 0 0;
}

.toolbar:last-of-type {
  padding: 0 1ch 1ch 1ch;
  border-radius: 0 0 1.5ch 1.5ch;
}

.toolbar > * {
  display: inline-flex;
  /* margin-inline: 1ch; */
}

#listSettings > section {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0 1ch;
}
#listSettings > section > h4::after {
  content: ':';
}
</style>
