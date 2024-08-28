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
  StockBrowser: { component: StockBrowser, label: 'Lista', icon: '' },
  StockUpdate: { component: StockUpdate, label: 'Wczytaj', icon: '' },
  StockShare: { component: StockShare, label: 'Udostępnij', icon: '' },
  StockManager: { component: StockManager, label: 'Zarządzaj', icon: '' }
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
    <div class="menu-bar">
      <button
        v-for="(tab, id) in appWindowsList"
        class="switch"
        :class="{ active: usePreferencesStore().activeWindow === id }"
        :key="id"
        @click="usePreferencesStore().activeWindow = id"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="top-header">
      <DataStats />
    </div>
  </header>

  <main>
    <Suspense>
      <component :is="activeWindow.component"></component>
    </Suspense>
  </main>

  <footer>
    <p>Wszelkie prawa zastrzeżone - Paweł Ryszkowski</p>
    <p>
      Uwagi i pomoc techniczna - Paweł:
      <a href="mailto:pawrys.kontakt@gmail.com?subject=Pomoc%20Stock%20Browser%205" target="_blank"
        >pawrys.kontakt@gmail.com</a
      >
    </p>
  </footer>

  <widget-container-modal />
</template>

<style scoped>
.top-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1ch;
}
.top-header h1 {
  font-size: 1rem;
  margin: 0 1ch;
}

.menu-bar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

footer {
  padding: 1ch;
}
</style>
