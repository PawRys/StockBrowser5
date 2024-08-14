import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStockStore } from '@/stores/stockStore'

export const usePageStore = defineStore(
  'SB5_pageStore',
  () => {
    const pageSize = ref(10)
    const activePage = ref(1)
    const pageCount = computed(() => Math.ceil(useStockStore().items.length / pageSize.value))
    const pageStart = computed(() => pageSize.value * activePage.value - pageSize.value)
    const pageEnd = computed(() => pageSize.value * activePage.value)
    watch(pageCount, () => {
      if (activePage.value > pageCount.value) activePage.value = pageCount.value
      if (activePage.value < 1) activePage.value = 1
    })

    return { pageSize, activePage, pageCount, pageStart, pageEnd }
  },
  {
    persist: {
      paths: ['pageSize']
    }
  }
)
