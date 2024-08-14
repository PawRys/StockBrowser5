import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSortingStore = defineStore(
  'SB5_sortingStore',
  () => {
    const sortParam = ref('id')
    const sortDir = ref(1)
    const sortCol = ref('id')
    const sortUnit = ref('')
    watch(sortParam, () => (sortDir.value = 1))

    return { sortParam, sortDir, sortUnit, sortCol }
  },
  { persist: false }
)
