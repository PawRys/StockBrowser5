<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, defineProps, provide, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useFilterStore } from '@/stores/filterStore'

const { listView } = storeToRefs(usePreferencesStore())
const { statusFilter } = storeToRefs(useFilterStore())

import Price from '@/components/StockBrowser/ProductFields/PriceField.vue'
import InventoryDiff from '@/components/StockBrowser/ProductFields/Inventory-Diff.vue'
import InventoryInput from '@/components/StockBrowser/ProductFields/Inventory-Input.vue'
import InventoryStock from '@/components/StockBrowser/ProductFields/Inventory-Stock.vue'

const props = defineProps<{
  item: Ref<Plywood>
  index: number
}>()
const { item, index } = toRefs(props)
const basePrice: Ref<number> = ref(item.value.price || 0)
provide('basePrice', basePrice)
</script>

<template>
  <li class="listItem">
    <header>
      <span class="item-index">{{ `${index}. ` }}</span>

      <div class="item-info" :title="item.name">
        <span class="bold">{{ `${item.id}` }}</span>
        <span>{{ `${item.attr.glueType}` }}</span>
        <span>{{ `${item.attr.footSize}` }}</span>
        <span>{{ `${item.attr.faceGroup}` }}</span>
      </div>

      <div class="item-name">{{ item.name }}</div>
    </header>

    <section class="prices" v-if="listView === 'prices'">
      <InventoryStock :item="item" :unit="'m3'" :stockStatus="statusFilter" />
      <InventoryStock :item="item" :unit="'m2'" :stockStatus="statusFilter" />
      <InventoryStock :item="item" :unit="'szt'" :stockStatus="statusFilter" />
      <Price class="price m3" :item="item" :unit="'m3'" />
      <Price class="price m2" :item="item" :unit="'m2'" />
      <Price class="price szt" :item="item" :unit="'szt'" />
      <Price class="price purchase" :item="item" :unit="'purchase'" />
      <Price class="price marg" :item="item" :unit="'marg'" />
      <Price class="price perc" :item="item" :unit="'perc'" />
    </section>

    <section class="inventory" v-if="listView === 'inventory'">
      <InventoryStock :item="item" :unit="'m3'" :stockStatus="1" />
      <InventoryStock :item="item" :unit="'m2'" :stockStatus="1" />
      <InventoryStock :item="item" :unit="'szt'" :stockStatus="1" />
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
  list-style: none;
  margin-block: 1ch;
  background-color: var(--bg-color);
  padding: 1ch 1.6ch;
  border-radius: 1ch;
}

li:hover {
  box-shadow: inset 0 0 0 2px var(--cta-color);
}

.item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6ch;
}

.item-info span {
  text-wrap: nowrap;
}
.item-info span:not(:first-child)::before {
  content: ' - ';
}

:is(.item-name, .item-attr) {
  font-size: 0.9em;
  color: var(--grey-color);
}

header {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'indx info'
    'indx name';
  gap: 0.1ch 1ch;

  margin-bottom: 2ch;
}
.item-index {
  grid-area: indx;
}
.item-info {
  grid-area: info;
}
.item-attr {
  grid-area: attr;
}
.item-name {
  grid-area: name;
}

.prices,
.inventory {
  display: grid;
  align-items: baseline;
  justify-items: end;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5ch 0.5ch;
}
</style>
