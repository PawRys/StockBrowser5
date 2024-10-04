<script setup lang="ts">
import { closeModal } from 'jenesius-vue-modal'
import VatSwitch from '@/components/StockBrowser/VatSwitch.vue'
import Sorting from '@/components/StockBrowser/List-Sorting.vue'
import Paginate from '@/components/StockBrowser/List-Pagination.vue'
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
        <h4>Ilość wyników</h4>
        <section class="toolbar">
          <Paginate :show="['setPageSize']" /><span class="pagination-label">na stronę</span>
        </section>

        <h4>Sortowanie</h4>
        <Sorting class="toolbar" />

        <h4>Doliczanie VATu</h4>
        <VatSwitch class="toolbar" />
      </section>
    </div>
  </div>
</template>

<style scoped>
#listSettings > section {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0 1ch;
}
#listSettings > section > h4::after {
  content: ':';
}

.pagination-label {
  padding: 0.5ch;
}
</style>
