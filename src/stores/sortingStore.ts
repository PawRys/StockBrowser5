import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSortingStore = defineStore(
  'SB5_sortingStore',
  () => {
    const sortResetDir = ref('id')
    const sortCol = ref('id')
    const sortDir = ref(1)
    const sortUnit = ref(0)
    watch(sortResetDir, () => (sortDir.value = 1))

    return { sortResetDir, sortDir, sortUnit, sortCol }
  },
  { persist: false }
)
