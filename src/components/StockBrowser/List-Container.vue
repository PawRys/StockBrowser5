<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { usePageStore } from '@/stores/paginateStore'
import { useStockStore } from '@/stores/stockStore'
import { escapeNonword } from '@/exports/common_functions'

import ListItem from '@/components/StockBrowser/List-Item.vue'
import Paginate from '@/components/StockBrowser/List-Pagination.vue'
import ListSummary from '@/components/StockBrowser/List-Summary.vue'

const { pageStart, pageEnd } = storeToRefs(usePageStore())
const { items: stockItems } = storeToRefs(useStockStore())

const reactiveItems = computed(() =>
  (useStockStore().items as Plywood[])
    .slice(pageStart.value, pageEnd.value)
    .map((item) => ref(item))
)
</script>
<template>
  <section class="list-container">
    <div class="toolbar">
      <span class="filter-count">{{ `Wyników: ${stockItems.length}` }}</span>
      <Paginate :show="['setPage']" />
    </div>
    <ul class="product-list">
      <ListItem
        v-for="(item, index) in reactiveItems"
        :key="escapeNonword(item.value.id)"
        :item="item"
        :index="index + pageStart + 1"
      />
    </ul>
    <div class="toolbar">
      <Paginate :show="['setPage']" />
    </div>
    <ListSummary />
  </section>
</template>

<style scoped>
.list-container {
  padding: 1ch;
  border-radius: 1ch;
  margin: auto;
  width: min(100%, 70ch);
  background: var(--bg2-color);
}

ul {
  margin-inline: auto;
  margin-block: 0;
  padding: 0;
  background: var(--bg2-color);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1ch;
  margin-inline: auto;
  width: auto;
}

.filter-count {
  margin-right: auto;
  font-weight: 600;
}
</style>

<style>
:is(.prices, .inventory, .inventory-summary) {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5ch 0.5ch;
}

:is(.prices, .inventory, .inventory-summary) .field {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  padding: 0.2ch 0.6ch;
  text-align: right;
}

:is(.prices, .inventory, .inventory-summary) .field .bi {
  place-self: center;
  margin-right: 1ch;
  padding-right: 0.4ch;
}
</style>
