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
    <i class="bi bi-book"></i>
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

    <button class="setPrevPage compact" @click="setPrevPage">
      <i class="bi bi-chevron-compact-left"></i>
    </button>

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
    <span>{{ ` /${usePageStore().pageCount}` }}</span>

    <button class="setNextPage compact" @click="setNextPage">
      <i class="bi bi-chevron-compact-right"></i>
    </button>
  </section>
</template>

<style scoped>
/* .product-pagination {
  gap: 0.8ch;
} */

i {
  font-size: 1.3rem;
}

.bi-book {
  margin-right: 0.8ch;
}

i,
span {
  place-self: center;
}

:is(#fakeid, button) {
  padding-inline: 0.6ch;
  /* border-radius: 0; */
}

/* i {
  font-size: 1.3rem;
} */
</style>
