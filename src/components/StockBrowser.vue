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

function hasReservations() {
  const x = JSON.parse(localStorage.SB5_stockList).reduce((acc: number, item: Plywood) => {
    return acc + (item.aviableStock ? 1 : 0)
  }, 0)
  return x ? true : false
}
</script>

<template>
  <section>
    <div class="notdata" v-if="condition() === 'nodatabase'">
      <h3>Baza danych jest pusta.</h3>
      <p>
        <button class="toned" @click="usePreferencesStore().activeWindow = 'StockUpdate'">
          <i class="bi bi-download"></i>
          <span>Dodaj</span>
          <i class="bi bi-arrow-right-short"></i>
        </button>
      </p>
    </div>

    <div class="notdata" v-if="condition() === 'trymore'">
      <h3 v-if="hasReservations()">Nie znaleziono takiego produktu.</h3>
      <h3 v-else>W bazie nie ma danych o rezerwacjach towarów.</h3>
      <button @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button
        class="toned"
        v-if="!hasReservations()"
        @click="usePreferencesStore().activeWindow = 'StockUpdate'"
      >
        <i class="bi bi-download"></i>
        <span>Uzupełnij dane</span>
        <i class="bi bi-arrow-right-short"></i>
      </button>
      <button @click="useFilterStore().statusFilter = 1">
        <i class="bi bi-boxes"></i><span>Pokaż stan całkowity</span>
      </button>
      <button @click="useFilterStore().statusFilter = 0">
        <i class="bi bi-0-circle"></i><span>Pokaż stan zerowy</span>
      </button>
      <button @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div class="notdata" v-if="condition() === 'tryzero'">
      <h3>Nie znaleziono takiego produktu.</h3>
      <button @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button @click="useFilterStore().statusFilter = 0">
        <i class="bi bi-0-circle"></i><span>Pokaż stan zerowy</span>
      </button>
      <button @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div class="notdata notexist" v-if="condition() === 'notexist'">
      <h3>Wygląda na to, że taka sklejka nie istnieje 🤔</h3>
      <button class="toned" @click="useFilterStore().prevFilter">
        <i class="bi bi-arrow-counterclockwise"></i><span>Cofnij</span>
      </button>
      <button class="toned" @click="useFilterStore().resetAllFilters">
        <i class="bi bi-trash3"></i><span>Resetuj filtry</span>
      </button>
    </div>

    <div v-show="condition() === 'data'">
      <Filter />
      <Sorting />
      <VatSwitch />
      <Paginate id="main-pagination" />
      <ProductsList :key="refreshComponent" />
      <Paginate />
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
</style>
