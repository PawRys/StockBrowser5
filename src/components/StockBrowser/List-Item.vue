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
      <span class="header--item-index">{{ `${index}. ` }}</span>

      <div class="header--item-info">
        <span>
          <b>{{ `${item.id}` }}</b>
        </span>
        <span>{{ `${item.attr.glueType}` }}</span>
        <span>{{ `${item.attr.footSize}` }}</span>
        <span>{{ `${item.attr.faceGroup}` }}</span>
      </div>

      <div class="header--item-name">{{ item.name }}</div>
    </header>

    <section class="prices" v-if="listView === 'prices'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :stockStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :stockStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :stockStatus="statusFilter" />
      <Price class="price" :item="item" :unit="'m3'" />
      <Price class="price" :item="item" :unit="'m2'" />
      <Price class="price" :item="item" :unit="'szt'" />
      <Price class="price" :item="item" :unit="'purchase'" />
      <Price class="price" :item="item" :unit="'marg'" />
      <Price class="price" :item="item" :unit="'perc'" />
    </section>

    <section class="inventory" v-if="listView === 'inventory'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :stockStatus="1" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :stockStatus="1" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :stockStatus="1" />
      <InventoryInput class="quantity" :item="item" :unit="'m3'" />
      <InventoryInput class="quantity" :item="item" :unit="'m2'" />
      <InventoryInput class="quantity" :item="item" :unit="'szt'" />
      <InventoryDiff class="quantity" :item="item" :unit="'m3'" />
      <InventoryDiff class="quantity" :item="item" :unit="'m2'" />
      <InventoryDiff class="quantity" :item="item" :unit="'szt'" />
    </section>
  </li>
</template>

<style scoped>
header {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'indx info'
    'indx name';
  gap: 0.1ch 1ch;

  margin-bottom: 2ch;
}

.header--item-index {
  grid-area: indx;
}

.header--item-info {
  grid-area: info;
}

.header--item-info span:not(:first-child)::before {
  content: ' - ';
}

.header--item-name {
  grid-area: name;
  font-size: 0.9em;
  color: var(--grey-color);
}
</style>
