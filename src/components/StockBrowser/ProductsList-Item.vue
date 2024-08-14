<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, defineProps, provide, toRefs } from 'vue'

import Price from '@/components/StockBrowser/ProductFields/PriceField.vue'
import InventoryDiff from '@/components/StockBrowser/ProductFields/Inventory-Diff.vue'
import InventoryInput from '@/components/StockBrowser/ProductFields/Inventory-Input.vue'
import InventorySymfo from '@/components/StockBrowser/ProductFields/Inventory-Symfo.vue'

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
    <span>{{ index }}</span>
    <span>{{ item.id }}</span>
    <span>{{ item.size }}</span>

    <section>
      <Price :item="item" :unit="'purchase'" />
      <Price :item="item" :unit="'marg'" />
      <Price :item="item" :unit="'perc'" />
      <Price :item="item" :unit="'m3'" />
      <Price :item="item" :unit="'m2'" />
      <Price :item="item" :unit="'szt'" />
    </section>

    <section>
      <div class="quant">
        <InventorySymfo :item="item" :unit="'m3'" />
        <InventorySymfo :item="item" :unit="'m2'" />
        <InventorySymfo :item="item" :unit="'szt'" />
      </div>
      <div class="quant">
        <InventoryInput :item="item" :unit="'m3'" />
        <InventoryInput :item="item" :unit="'m2'" />
        <InventoryInput :item="item" :unit="'szt'" />
      </div>
      <div class="quant">
        <InventoryDiff :item="item" :unit="'m3'" />
        <InventoryDiff :item="item" :unit="'m2'" />
        <InventoryDiff :item="item" :unit="'szt'" />
      </div>
    </section>
    <span>{{ item.inventoryStatus }}</span>
  </li>
</template>

<style scoped>
li {
  display: grid;
  gap: 2ch;
  grid-template-columns: repeat(6, minmax(0, auto));
}
li:hover {
  box-shadow: 0 0 0 2px rgb(100 100 100 /0.2);
}

.quant {
  display: grid;
  gap: 0.5ch;
  grid-template-columns: 1fr 1fr 1fr;
  text-align: right;
}
</style>

<style>
[contenteditable='true'] {
  cursor: pointer;
  color: navy;
  font-style: italic;
  border: dotted 1px lightblue;
  padding-inline: 1ch;
}
</style>
