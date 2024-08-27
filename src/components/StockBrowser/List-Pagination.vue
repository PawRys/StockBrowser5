<script setup lang="ts">
import { scrollTo } from '@/exports/common_functions'
import { usePageStore } from '@/stores/paginateStore'

const pageSizeOptions = [1, 10, 20, 50, 100]
const scrollTarget = '#floating-toolbar'
const remOffset = -2

const props = defineProps<{
  show?: ('setPageSize' | 'setPage')[]
}>()
const { show } = props

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
  <div class="product-pagination">
    <template v-if="!show || show.indexOf('setPageSize') > -1">
      <!-- <i class="bi bi-book"></i> -->
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
    </template>

    <template v-if="!show || show.indexOf('setPage') > -1">
      <button class="setPrevPage compact" @click="setPrevPage">
        <i class="bi bi-chevron-left"></i>
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
      <span>{{ ` / ${usePageStore().pageCount}` }}</span>
      <button class="setNextPage compact" @click="setNextPage">
        <i class="bi bi-chevron-right"></i>
      </button>
    </template>
  </div>
</template>

<style scoped>
.product-pagination {
  display: inline-flex;
  gap: 1ch;
}

i {
  /* font-size: 1.3rem; */
  place-self: center;
}

span {
  /* margin-left: 1ch; */
  place-self: center;
}

.bi-book {
  margin-right: 0.8ch;
}

:is(#fakeid, button) {
  padding-inline: 0.6ch;
}
</style>
