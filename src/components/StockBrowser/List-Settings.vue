<script setup lang="ts">
import { openDialogByID, closeDialog } from '@/exports/dialogsExports'

import VatSwitch from '@/components/StockBrowser/VatSwitch.vue'
import Sorting from '@/components/StockBrowser/List-Sorting.vue'
import Paginate from '@/components/StockBrowser/List-Pagination.vue'
</script>

<template>
  <button @click="openDialogByID('listSettings')" class="compact">
    <i class="bi bi-three-dots-vertical"></i>
  </button>

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
</style>
