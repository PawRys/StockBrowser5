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
  <ul>
    <ListItem
      v-for="(item, index) in reactiveItems"
      :key="escapeNonword(item.value.id)"
      :item="item"
      :index="index + pageStart + 1"
    />
  </ul>
</template>

<style scoped>
li {
  display: grid;
  gap: 2ch;
  grid-template-columns: repeat(6, minmax(0, auto));
}
</style>
