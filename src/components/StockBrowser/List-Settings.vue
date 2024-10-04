<script setup lang="ts">
// import { showModalByID, closeDialog } from '@/exports/dialogsExports'

import { promptModal } from 'jenesius-vue-modal'
import ListSettingsModal from '@/components/Modals/ListSettingsModal.vue'

// import VatSwitch from '@/components/StockBrowser/VatSwitch.vue'
// import Sorting from '@/components/StockBrowser/List-Sorting.vue'
// import Paginate from '@/components/StockBrowser/List-Pagination.vue'
</script>

<template>
  <button @click="promptModal(ListSettingsModal)">
    <i class="bi bi-three-dots-vertical"></i>
  </button>

  <!-- <dialog id="listSettings">
    <header>
      <button @click="closeDialog"><i class="bi bi-x-square-fill"></i></button>
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
  </dialog> -->
</template>

<style scoped>
/* #listSettings > section {
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
} */
</style>
