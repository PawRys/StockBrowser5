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
const itemName = item.value.name.replace(/(\d+([,.]\d+)?x\d{2,4}x\d{2,4})/i, '<b>$1</b>')
const roundedPurchase = Math.ceil((item.value.purchase || 0) / 10) * 10
const itemPurchase = `<b>${roundedPurchase.toFixed(0)}<small>zł/m<sup>3</sup></small></b>`
const basePrice: Ref<number> = ref(item.value.purchase || 0)
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

      <div class="header--item-name" v-html="`${itemPurchase} - ${itemName}`"></div>
    </header>

    <section class="prices" v-if="listView === 'prices'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :quantityStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :quantityStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :quantityStatus="statusFilter" />
      <Price class="price" :item="item" :unit="'m3'" />
      <Price class="price" :item="item" :unit="'m2'" />
      <Price class="price" :item="item" :unit="'szt'" />
      <Price class="price" :item="item" :unit="'purchase'" />
      <Price class="price" :item="item" :unit="'marg'" />
      <Price class="price" :item="item" :unit="'perc'" />
    </section>

    <section class="inventory" v-if="listView === 'inventory'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :quantityStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :quantityStatus="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :quantityStatus="statusFilter" />
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
  grid-template-columns: auto auto 1fr;
  grid-template-areas:
    'indx  info'
    'indx  name';
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

.header--item-purchase {
  grid-area: prch;
  font-size: 0.9em;
  color: var(--grey-color);
}

.header--item-name {
  grid-area: name;
  font-size: 0.9em;
  color: var(--grey-color);
}
</style>

<style>
.header--item-name u {
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
}
</style>
