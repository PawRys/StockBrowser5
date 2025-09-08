<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, defineProps, provide, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useFilterStore } from '@/stores/filterStore'

const { listView, listDetails } = storeToRefs(usePreferencesStore())
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

function applyFocus(el: HTMLElement) {
  if (!el.classList.contains('focused')) {
    document.querySelector('.focused')?.classList.remove('focused')
  }
  el.classList.toggle('focused')
}
</script>

<template>
  <li :class="['listItem', listDetails]" :id="`listItem-${index}`" @click="applyFocus($el)">
    <header class="itemHeader">
      <span class="header--item-index">{{ `${index}. ` }}</span>

      <span class="header--item-id">
        <b>{{ `${item.id}` }}</b>
      </span>

      <span class="header--item-quantity">
        <InventoryDiff class="quantity" :item="item" :unit="'szt'" />
        <!-- <InventoryStock class="quantity" :item="item" :unit="'szt'" :statusFilter="statusFilter" /> -->
      </span>

      <span class="header--item-purchase" v-html="`${itemPurchase}`"></span>

      <div class="header--item-info">
        <!-- <span> </span> -->

        <span>{{ `${item.attr.glueType}` }}</span>
        <span>{{ `${item.attr.footSize}` }}</span>
        <!-- <span>{{ `${item.attr.faceType}` }}</span> -->
      </div>

      <div class="header--item-name" v-html="`${itemName}`"></div>
    </header>
    <!-- <div class="header--item-name" v-html="`${itemPurchase} - ${itemName}`"></div> -->

    <section class="itemBody prices" v-if="listView === 'prices'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :statusFilter="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :statusFilter="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :statusFilter="statusFilter" />
      <Price class="price" :item="item" :unit="'m3'" />
      <Price class="price" :item="item" :unit="'m2'" />
      <Price class="price" :item="item" :unit="'szt'" />
      <Price class="price" :item="item" :unit="'purchase'" />
      <Price class="price" :item="item" :unit="'marg'" />
      <Price class="price" :item="item" :unit="'perc'" />
      <div v-if="item.size === '(?)'" class="warn">
        <span>
          ❗ Brak rozmiaru w opisie sklejki. Popraw opis w Symfonii wg schematu:
          <b>[grubość]</b>x<b>[wymiar_A]</b>x<b>[wymiar_B]</b> bez spacji!
        </span>
      </div>
    </section>

    <section class="itemBody inventory" v-if="listView === 'inventory'">
      <InventoryStock class="quantity" :item="item" :unit="'m3'" :statusFilter="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'m2'" :statusFilter="statusFilter" />
      <InventoryStock class="quantity" :item="item" :unit="'szt'" :statusFilter="statusFilter" />
      <InventoryInput class="quantity" :item="item" :unit="'m3'" />
      <InventoryInput class="quantity" :item="item" :unit="'m2'" />
      <InventoryInput class="quantity" :item="item" :unit="'szt'" />
      <InventoryDiff class="quantity" :item="item" :unit="'m3'" />
      <InventoryDiff class="quantity" :item="item" :unit="'m2'" />
      <InventoryDiff class="quantity" :item="item" :unit="'szt'" />
      <div v-if="item.size === '(?)'" class="warn">
        <span>
          ❗ Brak rozmiaru w opisie sklejki. Popraw opis w Symfonii wg schematu:
          <b>[grubość]</b>x<b>[wymiar_A]</b>x<b>[wymiar_B]</b> bez spacji!
        </span>
      </div>
    </section>
  </li>
</template>

<style>
:is(html, body):has(.listItem:focus-within) {
  overflow: clip;
}
</style>

<style scoped>
.warn {
  position: absolute;
  z-index: 0;
  inset: 0;

  display: grid;
  place-items: center;

  background-color: var(--bg-color);
  text-align: center;
  line-height: 1.5;
  font-size: 1.2rem;
}

.warn b {
  display: inline;
}

.listItem {
  list-style: none;
  margin-block: 1ch;
  background-color: var(--bg-color);
  padding: 1ch 1ch;
  border-radius: 1ch;
}

.listItem:hover {
  box-shadow: inset 0 0 0 2px var(--cta-color);
}

.listItem:has(:focus-within) {
  box-shadow:
    inset 0 0 0 2px var(--accent-lighter),
    0 0 0 100vmax color-mix(in srgb, var(--accent-lightest), transparent 5%);
  z-index: 999;
}

.listItem:focus-within::after {
  font-family: bootstrap-icons !important;
  font-style: normal;
  font-weight: 400 !important;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  vertical-align: -0.125em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  content: '\f628';

  position: absolute;
  top: 0;
  right: 0;
  z-index: 9;
  padding: 0.6rem;
}

.itemHeader {
  display: grid;
  grid-template-columns: min-content auto 1fr;
  grid-template-areas:
    'index  itemid  quantity'
    'name   name    purchase'
    'name   name    info';
  gap: 0.1ch 1ch;
}

.header--item-index {
  grid-area: index;
}

.header--item-id {
  grid-area: itemid;
  place-self: start;
}

.header--item-info {
  grid-area: info;
  place-self: baseline end;
  font-size: 0.9em;
  font-weight: 700;
  color: var(--grey-color);
}

.header--item-info span {
  /* display: block; */
  margin-left: 1ch;
  white-space: nowrap;
}

.header--item-quantity {
  grid-area: quantity;
  place-self: baseline end;
  font-size: 0.9em;
  /* color: var(--grey-color); */
  white-space: nowrap;
}
.header--item-purchase {
  grid-area: purchase;
  place-self: baseline end;
  font-size: 0.9em;
  color: var(--grey-color);
  white-space: nowrap;
}

.header--item-name {
  grid-area: name;
  font-size: 0.9em;
  color: var(--grey-color);
}

.itemBody {
  margin-top: 2ch;
}

.compact > .itemBody {
  display: none;
}

.compact.focused > .itemBody {
  display: grid;
}
</style>

<style>
.header--item-name u {
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
}
</style>
