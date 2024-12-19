<script setup lang="ts">
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import ListContainer from '@/components/StockBrowser/List-Container.vue'
import FloatingToolbar from '@/components/StockBrowser/FloatingToolbar.vue'

function condition(): string {
  if (!localStorage.getItem('SB5_stockList') || localStorage.getItem('SB5_stockList') === '[]')
    return 'nodatabase'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter >= 2) return 'trymore'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 1) return 'tryzero'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 0) return 'notexist'
  return 'data'
}
</script>

<template>
  <section id="stock-list">
    <div class="notdata" v-if="condition() !== 'data'">
      <FloatingToolbar v-if="condition() !== 'nodatabase'" />

      <h3 v-if="condition() === 'nodatabase'">Baza danych jest pusta.</h3>
      <h3 v-if="condition() === 'trymore'">
        Nie znaleziono takiego produktu w stanach handlowych <i class="bi bi-box"></i>
      </h3>
      <h3 v-if="condition() === 'tryzero'">
        Nie znaleziono takiego produktu w stanach całkowitych <i class="bi bi-boxes"></i>
      </h3>
      <h3 v-if="condition() === 'notexist'">Wygląda na to, że taka sklejka nie istnieje 🤔</h3>

      <p>
        <button
          v-if="condition() === 'nodatabase'"
          class="cta"
          @click="usePreferencesStore().activeWindow = 'StockUpdate'"
        >
          <i class="bi bi-download"></i>
          <span>Dodaj</span>
        </button>

        <!-- <button v-if="condition().match(//)" @click="useFilterStore().prevFilter">
          <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij filtr</span>
        </button> -->

        <!-- <button v-if="condition().match(/trymore/)" @click="useFilterStore().statusFilter = 1">
          <i class="bi bi-boxes"></i><span>Pokaż stan całkowity</span>
        </button> -->

        <!-- <button v-if="condition().match(/tryzero/)" @click="useFilterStore().statusFilter = 0">
          <i class="bi bi-0-circle"></i><span>Pokaż stan zerowy</span>
        </button> -->

        <!-- <button v-if="condition() !== 'nodatabase'" @click="useFilterStore().resetAllFilters">
          <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
        </button> -->
      </p>
    </div>

    <div v-show="condition() === 'data'" id="scrolltoptarget">
      <FloatingToolbar />
      <ListContainer />
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
</style>
