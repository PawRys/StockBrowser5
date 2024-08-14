<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { container as WidgetContainerModal } from 'jenesius-vue-modal'

import StockBrowser from '@/components/StockBrowser.vue'
import StockUpdate from '@/components/StockUpdate.vue'
import StockShare from '@/components/StockShare.vue'
import StockManager from '@/components/StockManager.vue'
import DataStats from '@/components/StockBrowser/DataStats.vue'

onMounted(() => {
  document.querySelectorAll('[tabindex]').forEach((item) => {
    ;(item as HTMLElement).addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault()
        ;(ev.target as HTMLElement).click()
      }
    })
  })
})

const appWindowsList = {
  StockBrowser: { component: StockBrowser, label: 'Lista', icon: '', intro: 'Lista produktów' },
  StockUpdate: { component: StockUpdate, label: 'Wczytaj', icon: '', intro: 'Wczytaj bazę danych' },
  StockShare: {
    component: StockShare,
    label: 'Udostępnij',
    icon: '',
    intro: 'Udostępnij bazę danych'
  },
  StockManager: {
    component: StockManager,
    label: 'Zarządzaj',
    icon: '',
    intro: 'Zarządzaj bazą danych'
  }
}

const activeWindow = computed(() => {
  const activeWindowIndex =
    usePreferencesStore().activeWindow in appWindowsList
      ? usePreferencesStore().activeWindow
      : Object.keys(appWindowsList)[0]
  return appWindowsList[activeWindowIndex as keyof typeof appWindowsList]
})
</script>

<template>
  <header>
    <h1>Przeglądarka Stanów 5</h1>
    <DataStats />

    <button
      v-for="(tab, id) in appWindowsList"
      class="switch"
      :class="{ active: usePreferencesStore().activeWindow === id }"
      :key="id"
      @click="usePreferencesStore().activeWindow = id"
    >
      {{ tab.label }}
    </button>
  </header>

  <main>
    <h2>{{ activeWindow.intro }}</h2>
    <Suspense>
      <component :is="activeWindow.component"></component>
    </Suspense>
  </main>

  <footer>
    <p>Wszelkie prawa zastrzeżone.</p>
  </footer>
  <widget-container-modal />
</template>

<style scoped>
.switch {
  font-size: 1.1rem;
  /* text-transform: uppercase; */
}
</style>
