<script setup lang="ts">
import { scrollTo } from '@/exports/common_functions'
import { usePageStore } from '@/stores/paginateStore'

const pageSizeOptions = [1, 10, 20, 50, 100]
const scrollTarget = '#main-pagination'
const remOffset = -2

function setPrevPage() {
  if (usePageStore().activePage > 1) {
    usePageStore().activePage--
  }
  scrollTo(scrollTarget, remOffset)
}
function setNextPage() {
  if (usePageStore().activePage < usePageStore().pageCount) {
    usePageStore().activePage++
  }
  scrollTo(scrollTarget, remOffset)
}
function setPageNum(e: Event) {
  const target = e.target as HTMLSelectElement
  usePageStore().activePage = Number(target.value)
  scrollTo(scrollTarget, remOffset)
}
</script>

<template>
  <section class="product-pagination">
    <button class="setPrevPage" @click="setPrevPage">prev</button>

    <select class="setPageNum" @change="setPageNum">
      <option
        v-for="page in usePageStore().pageCount"
        :key="`pageCount-${page}`"
        :value="page"
        :selected="page === usePageStore().activePage"
      >
        {{ page }}
      </option>
    </select>
    / {{ usePageStore().pageCount }}

    <button class="setNextPage" @click="setNextPage">next</button>

    <select class="setPageSize" v-model="usePageStore().pageSize">
      <option
        v-for="size of pageSizeOptions"
        :key="`pageSize-${size}`"
        :value="size"
        :selected="size === usePageStore().pageSize"
      >
        {{ size }}
      </option>
    </select>
  </section>
</template>

<style scoped></style>
