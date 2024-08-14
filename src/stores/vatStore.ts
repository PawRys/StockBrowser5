import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useVatStore = defineStore(
  'SB5_vatStore',
  () => {
    const vatValue = ref(1.23)
    const m3 = ref(false)
    const m2 = ref(false)
    const szt = ref(true)

    return { vatValue, m3, m2, szt }
  },
  {
    persist: false
  }
)
