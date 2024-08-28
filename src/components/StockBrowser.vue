<script setup lang="ts">
import { useStockStore } from '@/stores/stockStore'
import { useFilterStore } from '@/stores/filterStore'
import { usePreferencesStore } from '@/stores/preferencesStore'

import ListContainer from '@/components/StockBrowser/List-Container.vue'
import Filter from '@/components/StockBrowser/List-Filter.vue'
import FloatingToolbar from '@/components/StockBrowser/Floating-Toolbar.vue'

function condition(): string {
  if (!localStorage.SB5_stockList || localStorage.SB5_stockList === '{}') return 'nodatabase'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter >= 2) return 'trymore'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 1) return 'tryzero'
  if (useStockStore().items.length < 1 && useFilterStore().statusFilter === 0) return 'notexist'
  return 'data'
}
</script>

<template>
  <section id="stock-list">
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

    <div v-show="condition() === 'data'" id="scrolltoptarget">
      <FloatingToolbar />
      <Filter />
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
