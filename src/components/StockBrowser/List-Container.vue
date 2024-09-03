<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { usePageStore } from '@/stores/paginateStore'
import { useStockStore } from '@/stores/stockStore'
import { escapeNonword } from '@/exports/common_functions'

import ListItem from '@/components/StockBrowser/List-Item.vue'
import Paginate from '@/components/StockBrowser/List-Pagination.vue'
import InventorySummary from '@/components/StockBrowser/List-Summary.vue'

const { pageStart, pageEnd } = storeToRefs(usePageStore())
const { items: stockItems } = storeToRefs(useStockStore())

const refreshComponent = ref(0)

const reactiveItems = computed(() =>
  (useStockStore().items as Plywood[])
    .slice(pageStart.value, pageEnd.value)
    .map((item) => ref(item))
)
</script>
<template>
  <div class="toolbar">
    <span class="filter-count">{{ `Wyników: ${stockItems.length}` }}</span>
    <Paginate :show="['setPage']" />
  </div>

  <ul class="product-list" :key="refreshComponent">
    <ListItem
      v-for="(item, index) in reactiveItems"
      :key="escapeNonword(item.value.id)"
      :item="item"
      :index="index + pageStart + 1"
    />
  </ul>

  <div class="toolbar">
    <Paginate :show="['setPage']" />
    <InventorySummary @refresh="refreshComponent++" />
  </div>
</template>

<style scoped>
ul {
  margin-inline: auto;
  margin-block: 0;
  padding: 0.1ch 1ch;
  width: min(100%, 65ch);
  background: var(--bg2-color);
}

li {
  list-style: none;
  margin-block: 1ch;
  background-color: var(--bg-color);
  padding: 1ch 1ch;
  border-radius: 1ch;
}

li:hover {
  box-shadow: inset 0 0 0 2px var(--cta-color);
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
  border-radius: 1ch 1ch 0 0;
}

.toolbar:last-of-type {
  padding: 0 1ch 1ch 1ch;
  border-radius: 0 0 1ch 1ch;
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

:is(.prices, .inventory, .inventory-summary) .field[contenteditable='true'] {
  border: dotted 1px var(--accent-lighter);
}

:is(.prices, .inventory, .inventory-summary) .field .bi {
  place-self: center;
  margin-right: auto;
  padding-right: 0.4ch;
}
</style>
