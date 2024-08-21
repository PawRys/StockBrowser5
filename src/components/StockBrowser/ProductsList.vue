<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { usePageStore } from '@/stores/paginateStore'
import { useStockStore } from '@/stores/stockStore'
import { escapeNonword } from '@/exports/common_functions'
import ListItem from '@/components/StockBrowser/ProductsList-Item.vue'

const { pageStart, pageEnd } = storeToRefs(usePageStore())

const reactiveItems = computed(() =>
  (useStockStore().items as Plywood[])
    .slice(pageStart.value, pageEnd.value)
    .map((item) => ref(item))
)
</script>
<template>
  <ul class="product-list">
    <ListItem
      v-for="(item, index) in reactiveItems"
      :key="escapeNonword(item.value.id)"
      :item="item"
      :index="index + pageStart + 1"
    />
  </ul>
</template>

<style scoped>
ul {
  margin-inline: auto;
  padding: 0;
  width: fit-content;
}
</style>
