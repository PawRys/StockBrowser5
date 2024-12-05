<script setup lang="ts">
import { ref, computed, onMounted, provide, onUnmounted } from 'vue'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { container as WidgetContainerModal } from 'jenesius-vue-modal'
import { setRandomUUID } from '@/exports/common_functions'
setRandomUUID()

import StockStatistics from '@/components/StockStatistics.vue'
import StockBrowser from '@/components/StockBrowser.vue'
import StockUpdate from '@/components/StockUpdate.vue'
import StockShare from '@/components/StockShare.vue'
import StockManager from '@/components/StockManager.vue'
import DataStats from '@/components/StockBrowser/DataStats.vue'

/** PopState event = previous filter */
/** cant get it to work */
//
// import { useFilterStore } from '@/stores/filterStore'
// import { once } from 'lodash'
// const filterStore = useFilterStore()
// history.pushState(null, null, location.href)
// document.addEventListener('popstate', function () {
//   history.pushState(null, null, location.href)
//   alert('popstate')
//   filterStore.prevFilter
// })
/** PopState event END */

const refreshMainComponent = ref(0)
provide('refreshMainComponent', refreshMainComponent)

onMounted(() => {
  // window.addEventListener(
  //   'popstate',
  //   function (event) {
  //     useFilterStore().applyFilters(event.state)
  //   },
  //   { once: true }
  // )

  document.querySelectorAll('[tabindex]').forEach((item) => {
    ;(item as HTMLElement).addEventListener('keydown', (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault()
        ;(ev.target as HTMLElement).click()
      }
    })
  })
})

onUnmounted(() => {
  // window.removeEventListener('popstate')
})

const appWindowsList = {
  StockBrowser: { component: StockBrowser, label: 'Towary', icon: 'bi bi-box-seam' },
  StockUpdate: { component: StockUpdate, label: 'Wczytaj', icon: 'bi bi-cloud-arrow-down' },
  StockShare: { component: StockShare, label: 'Udostępnij', icon: 'bi bi-share' },
  StockStats: { component: StockStatistics, label: 'Statystyki', icon: 'bi bi-clipboard-data' },
  StockManager: { component: StockManager, label: 'Zarządzaj', icon: 'bi bi-gear' }
}

const activeWindow = computed(() => {
  const activeWindowIndex =
    usePreferencesStore().activeWindow in appWindowsList
      ? usePreferencesStore().activeWindow
      : Object.keys(appWindowsList)[0]
  return appWindowsList[activeWindowIndex as keyof typeof appWindowsList]
})

const fill = (id: string) => (usePreferencesStore().activeWindow === id ? '-fill' : '')
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
        <i :class="`${tab.icon}${fill(id)}`"></i>
        <span>{{ tab.label }}</span>
      </button>
    </div>
    <div class="top-header">
      <DataStats />
    </div>
  </header>

  <main :key="refreshMainComponent">
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
  flex-wrap: nowrap;
}

@media (max-width: 78ch) {
  .menu-bar {
    gap: 0.6ch;
  }
  .menu-bar button > span {
    display: none;
  }
}

header,
footer {
  padding: 1ch;
}
</style>

<style>
.modal-container {
  z-index: 999999;
}
</style>
