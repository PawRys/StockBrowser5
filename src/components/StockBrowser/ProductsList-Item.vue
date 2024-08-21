<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, defineProps, provide, toRefs } from 'vue'

import Price from '@/components/StockBrowser/ProductFields/PriceField.vue'
import InventoryDiff from '@/components/StockBrowser/ProductFields/Inventory-Diff.vue'
import InventoryInput from '@/components/StockBrowser/ProductFields/Inventory-Input.vue'
import Quantity from '@/components/StockBrowser/ProductFields/QuantityField.vue'

const props = defineProps<{
  item: Ref<Plywood>
  index: number
}>()
const { item, index } = toRefs(props)
const basePrice: Ref<number> = ref(item.value.price || 0)
provide('basePrice', basePrice)
</script>

<template>
  <li class="listItem" :title="item.name">
    <!-- <header>
      <span class="item-index">{{ `${index}.` }}</span>
      <span class="item-id">{{ item.id }}</span>
    </header>

    <div class="item-name">{{ item.name }}</div>

    <section class="item-info">
      <div>{{ `${item.size} (${item.attr.footSize}) ` }}</div>
      <div>{{ `${item.attr.faceGroup} ${item.attr.faceType} ${item.attr.color}` }}</div>
      <div>{{ `${item.attr.woodType} ${item.attr.glueType}` }}</div>
    </section> -->

    <!-- <section class="prices">
      <Price class="price m3" :item="item" :unit="'m3'" />
      <Price class="price m2" :item="item" :unit="'m2'" />
      <Price class="price szt" :item="item" :unit="'szt'" />
      <Price class="price purchase" :item="item" :unit="'purchase'" />
      <Price class="price marg" :item="item" :unit="'marg'" />
      <Price class="price perc" :item="item" :unit="'perc'" />
    </section> -->

    <section class="inventory">
      <Quantity :stockName="'totalStock'" :item="item" :unit="'m3'" />
      <Quantity :stockName="'totalStock'" :item="item" :unit="'m2'" />
      <Quantity :stockName="'totalStock'" :item="item" :unit="'szt'" />
      <InventoryInput :item="item" :unit="'m3'" />
      <InventoryInput :item="item" :unit="'m2'" />
      <InventoryInput :item="item" :unit="'szt'" />
      <InventoryDiff :item="item" :unit="'m3'" />
      <InventoryDiff :item="item" :unit="'m2'" />
      <InventoryDiff :item="item" :unit="'szt'" />
    </section>
  </li>
</template>

<style scoped>
li {
  display: grid;
  /* grid-template-columns: 25% 1fr 1fr; */
  gap: 0 2ch;
  /* margin: 5px; */
  padding: 0;
  list-style: none;
}

header {
  display: inline-flex;
  justify-content: space-between;
  gap: 1ch;
  /* grid-column: 1 / span 3; */
}

.item-id {
  font-weight: 700;
}

.item-name {
  grid-column: 2 / span 2;
}

.item-info {
  text-align: end;
}

.prices,
.inventory {
  display: grid;
  justify-items: end;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>

<style>
[contenteditable='true'] {
  cursor: pointer;
  /* color: navy; */
  font-style: italic;
  border: dotted 1px var(--accent-color-normal);
  padding-inline: 1ch;
}
</style>
