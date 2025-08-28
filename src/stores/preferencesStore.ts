import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore(
  'SB5_preferences',
  () => {
    const activeWindow = ref('')
    const listView = ref('inventory')
    const listDetails = ref('detailed')
    return { activeWindow, listView, listDetails }
  },
  { persist: true }
)
