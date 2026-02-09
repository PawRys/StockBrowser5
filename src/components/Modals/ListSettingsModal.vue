<script setup lang="ts">
import { closeModal } from 'jenesius-vue-modal'
import VatSwitch from '@/components/StockBrowser/VatSwitch.vue'
import Sorting from '@/components/StockBrowser/List-Sorting.vue'
import Paginate from '@/components/StockBrowser/List-Pagination.vue'

import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@/stores/preferencesStore'
const { listView, listDetails } = storeToRefs(usePreferencesStore())
</script>

<template>
  <div class="dialog-backdrop" @click.self="closeModal()">
    <div class="dialog" id="listSettings">
      <header>
        <button @click="closeModal()">
          <i class="bi bi-x-square-fill"></i>
        </button>
      </header>
      <section>
        <h4>Tryb wyświetlania</h4>
        <section>
          <button v-if="listView === 'prices'" @click="listView = 'inventory'">
            <i class="bi bi-coin"></i> <span>Kalkulator cen</span>
          </button>
          <button v-if="listView === 'inventory'" @click="listView = 'prices'">
            <i class="bi bi-calculator"></i> <span>Kalkulator stanów</span>
          </button>
        </section>

        <h4>Ilość wyników</h4>
        <section class="toolbar">
          <Paginate :show="['setPageSize']" /><span class="pagination-label">na stronę</span>
        </section>

        <h4>Sortowanie</h4>
        <Sorting class="toolbar" />

        <h4>Doliczanie VATu</h4>
        <VatSwitch class="toolbar" />

        <!-- <h4>Widok detali</h4>
        <section>
          <button v-if="listDetails === 'compact'" @click="listDetails = 'detailed'">
            <i class="bi bi-chevron-bar-contract"></i> <span>Detale zwinięte</span>
          </button>
          <button v-if="listDetails === 'detailed'" @click="listDetails = 'compact'">
            <i class="bi bi-chevron-bar-expand"></i> <span>Detale rozwinięte</span>
          </button>
        </section> -->
      </section>
    </div>
  </div>
</template>

<style scoped>
#listSettings > section {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  justify-items: left;
  gap: 0 1ch;
}

#listSettings > section > h4::after {
  content: ':';
}

#listSettings > section > h4 {
  justify-self: right;
}

.pagination-label {
  padding: 0.5ch;
}
</style>
