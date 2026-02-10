<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, provide, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { useFilterStore } from '@/stores/filterStore'

const { listView, listDetails } = storeToRefs(usePreferencesStore())
const { statusFilter } = storeToRefs(useFilterStore())

import Price from '@/components/StockBrowser/ProductFields/PriceField.vue'
import InvDiff from '@/components/StockBrowser/ProductFields/Inventory-Diff.vue'
import InvInput from '@/components/StockBrowser/ProductFields/Inventory-Input.vue'
import InvStock from '@/components/StockBrowser/ProductFields/Inventory-Stock.vue'

const props = defineProps<{
  item: Ref<Plywood>
  index: number
}>()
const { item, index } = toRefs(props)
const roundedPurchase = Math.ceil((item.value.purchase || 0) / 10) * 10
const itemPurchase = `<b>${roundedPurchase.toFixed(0)}<small>zł/m<sup>3</sup></small></b>`
// const itemName = item.value.name.replace(/(\d+([,.]\d+)?x\d{2,4}x\d{2,4})/i, '<b>$1</b>')
// const itemHeading = `${item.value.id} ${item.value.attr.footSize} ${item.value.attr.glueType} <b>${item.value.size}</b> ${item.value.attr.faceType}
//       ${item.value.attr.color}`
// const itemInfo = `${item.value.attr.footSize} ${item.value.attr.glueType} <b>${item.value.size}</b> ${item.value.attr.faceType}
//       ${item.value.attr.color}`
const basePrice: Ref<number> = ref(item.value.purchase || 0)
provide('basePrice', basePrice)

function applyFocus(el: HTMLElement) {
  document.querySelector('.focused')?.classList.remove('focused')
  el.classList.add('focused')
}
</script>

<template>
  <li :class="['list-item', listDetails]" :id="`list-item-${index}`" @click="applyFocus($el)">
    <span class="item-heading" :title="`${item.name}`">
      <span class="grey-font">{{ index }}.</span>
      <span>{{ item.attr.glueType }}</span>
      <b>{{ item.size }}</b>
      <span>{{ item.attr.faceType }}</span>
      <span>{{ item.attr.color }}</span>
      <b>{{ item.attr.footSize }}</b>
      <span class="grey-font item-id">{{ item.id }}</span>
      <span
        class="price-purchase"
        v-html="`${itemPurchase}`"
        v-if="listView === 'inventory'"
      ></span>
    </span>
    <!-- <span class="item-name grey-font">{{ item.id }}</span> -->

    <InvStock class="inv-stock-m3" :item="item" :unit="'m3'" :statusFilter="statusFilter" />
    <InvStock class="inv-stock-m2" :item="item" :unit="'m2'" :statusFilter="statusFilter" />
    <InvStock class="inv-stock-szt" :item="item" :unit="'szt'" :statusFilter="statusFilter" />
    <InvInput class="inv-input-m3" :item="item" :unit="'m3'" v-if="listView === 'inventory'" />
    <InvInput class="inv-input-m2" :item="item" :unit="'m2'" v-if="listView === 'inventory'" />
    <InvInput class="inv-input-szt" :item="item" :unit="'szt'" v-if="listView === 'inventory'" />
    <InvDiff class="inv-diff-m3" :item="item" :unit="'m3'" v-if="listView === 'inventory'" />
    <InvDiff class="inv-diff-m2" :item="item" :unit="'m2'" v-if="listView === 'inventory'" />
    <InvDiff class="inv-diff-szt" :item="item" :unit="'szt'" v-if="listView === 'inventory'" />
    <Price class="price-m3" :item="item" :unit="'m3'" v-if="listView === 'prices'" />
    <Price class="price-m2" :item="item" :unit="'m2'" v-if="listView === 'prices'" />
    <Price class="price-szt" :item="item" :unit="'szt'" v-if="listView === 'prices'" />
    <!-- <Price class="price-purchase" :item="item" :unit="'purchase'" v-if="listView === 'prices'" /> -->
    <span class="price-purchase" v-html="`${itemPurchase}`" v-if="listView === 'prices'"></span>
    <Price class="price-marg" :item="item" :unit="'marg'" v-if="listView === 'prices'" />
    <Price class="price-perc" :item="item" :unit="'perc'" v-if="listView === 'prices'" />

    <div class="item-warn" v-if="item.size === '(?)'">
      <span>
        ❗ Brak rozmiaru w opisie sklejki. Popraw opis w Symfonii wg schematu:
        <b>[grubość]</b>x<b>[wymiar_A]</b>x<b>[wymiar_B]</b> bez spacji!
      </span>
    </div>
  </li>
</template>

<style>
:is(html, body):has(.listItem:focus-within) {
  overflow: clip;
}

.header--item-name u {
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
}

.list-item .bi {
  display: inline;
}
</style>

<style scoped>
.list-item {
  list-style: none;
  margin-block: 1ch;
  background-color: var(--bg-color);
  padding: 1ch 1ch;
  border-radius: 1ch;
  text-align: end;

  display: grid;
  gap: 1ch;

  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas:
    'H1 H1 H1'
    'H2 H2 H2'
    'A1 B1 C1'
    'A2 B2 C2'
    'A3 B3 C3';
}

.list-item:hover {
  box-shadow: inset 0 0 0 2px var(--cta-color);
}

.list-item:has(:focus-within) {
  box-shadow:
    inset 0 0 0 2px var(--accent-lighter),
    0 0 0 100vmax color-mix(in srgb, var(--accent-lightest), transparent 5%);
  z-index: 999;
}

.list-item:focus-within::after {
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
  background-color: var(--accent-lighter);
  border-radius: 5px;

  position: absolute;
  top: 0;
  right: 0;
  z-index: 9;
  padding: 9px;
}

.item-id {
  font-size: 0.9em;
}

.item-heading {
  grid-area: H1;
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5ch;
}
.item-name {
  grid-area: H2;
  text-align: left;
}

.inv-stock-m3 {
  grid-area: A1;
}
.inv-stock-m2 {
  grid-area: B1;
}
.inv-stock-szt {
  grid-area: C1;
}

.inv-input-m3 {
  grid-area: A2;
}
.inv-input-m2 {
  grid-area: B2;
}
.inv-input-szt {
  grid-area: C2;
}

.inv-diff-m3 {
  grid-area: A3;
}
.inv-diff-m2 {
  grid-area: B3;
}
.inv-diff-szt {
  grid-area: C3;
}

.price-m3 {
  grid-area: A2;
}
.price-m2 {
  grid-area: B2;
}
.price-szt {
  grid-area: C2;
}
.price-purchase {
  grid-area: A3;
  margin-left: auto;
}
.price-marg {
  grid-area: B3;
}
.price-perc {
  grid-area: C3;
}

.item-warn {
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

.item-warn b {
  display: inline;
}
</style>
