import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore(
  'SB5_preferences',
  () => {
    const activeWindow = ref('')
    const listView = ref('inventory')
    return { activeWindow, listView }
  },
  { persist: true }
)
