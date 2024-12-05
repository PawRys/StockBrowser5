import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
export const useFilterStore = defineStore(
  'SB5_filterStore',
  () => {
    const currentFilterIndex = ref<number>(-1)
    const filterHistory = ref<string[]>([])

    const statusFilter = ref(1)
    const inventoryFilter = ref('')
    const textFilter = ref('')
    const attrFilter = ref({} as AttributeFilter)

    function resetAttrFilter(setName?: keyof AttributeFilter) {
      if (setName) delete attrFilter.value[setName]
      else attrFilter.value = {}
    }

    function resetAllFilters(): void {
      statusFilter.value = 1
      inventoryFilter.value = ''
      textFilter.value = ''
      attrFilter.value = {}
    }

    function applyFilters(filters: any) {
      filters = JSON.parse(filters)
      // statusFilter.value = filters[0]
      // inventoryFilter.value = filters[1]
      // textFilter.value = filters[2]
      // attrFilter.value = filters[3]
      textFilter.value = filters[0]
      attrFilter.value = filters[1]
    }

    function prevFilter() {
      if (currentFilterIndex.value > 0) {
        currentFilterIndex.value -= 1
        applyFilters(filterHistory.value[currentFilterIndex.value])
      }
    }

    function nextFilter() {
      if (currentFilterIndex.value < filterHistory.value.length - 1) {
        currentFilterIndex.value += 1
        applyFilters(filterHistory.value[currentFilterIndex.value])
      }
    }

    watch(
      // [statusFilter, inventoryFilter, textFilter, attrFilter],
      [textFilter, attrFilter],
      (filters) => {
        // To avoid pushing duplicates
        const lastFilter = filterHistory.value[currentFilterIndex.value]
        const currentFilter = JSON.stringify(filters)
        if (lastFilter !== currentFilter) {
          // Overwrite history from the current index if not at the end
          if (currentFilterIndex.value < filterHistory.value.length - 1) {
            filterHistory.value.splice(currentFilterIndex.value + 1)
          }
          // history.pushState(currentFilter, '', location.href)
          // console.log(history)
          filterHistory.value.push(currentFilter) // Push a deep copy to avoid reactivity issues
          currentFilterIndex.value = filterHistory.value.length - 1
        }
      },
      { immediate: true, deep: true }
    )

    return {
      currentFilterIndex,
      inventoryFilter,
      filterHistory,
      statusFilter,
      textFilter,
      attrFilter,
      resetAttrFilter,
      resetAllFilters,
      applyFilters,
      prevFilter,
      nextFilter
    }
  },
  { persist: false }
)
