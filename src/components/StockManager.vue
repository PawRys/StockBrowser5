<script setup lang="ts">
import { ref } from 'vue'
import { calcQuant } from '@/exports/common_functions'
import CryptoJS from 'crypto-js'
import { downloadFile } from '@/exports/common_functions'

import { promptModal } from 'jenesius-vue-modal'
import YepNopeModal from '@/components/Modals/YepNopeModal.vue'

import { useStockStore } from '@/stores/stockStore'
const { updateData } = useStockStore()

const messageBox = ref('')

function passClickTo(query: string) {
  const element = document.querySelector(query) as HTMLElement
  element.click()
}

function exportDB() {
  const file = `StockBrowserBackup-${new Date().toJSON().split('T')[0]}.json`
  const stockData = {
    stockDate: localStorage.getItem('SB5_stockDate') || '',
    stockWarehause: localStorage.getItem('SB5_stockWarehause') || '',
    stockList: JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
  }

  const stockDataString = JSON.stringify(stockData)

  const type = 'application/json; charset=UTF-8'
  const encryptedData = CryptoJS.AES.encrypt(
    stockDataString,
    localStorage.getItem('SB5_UUID') as string
  ).toString()
  console.log(encryptedData)

  try {
    downloadFile(file, encryptedData, type)
  } catch (error) {
    console.error(`**exportIDB()**`, error)
    messageBox.value = `❌ Błąd podczas zapisywania bazy danych.`
  }
}

function importDB(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()

  reader.onload = (event) => {
    try {
      const encryptedData = event.target?.result || ''
      const encryptedString =
        typeof encryptedData === 'string' ? encryptedData : new TextDecoder().decode(encryptedData)
      const decryptedData = CryptoJS.AES.decrypt(
        encryptedString,
        localStorage.getItem('SB5_UUID') as string
      ).toString(CryptoJS.enc.Utf8)
      const result = JSON.parse(decryptedData)
      updateData(result)
      messageBox.value = `Baza danych została przywrócona pomyślnie ✔️`
    } catch (error: unknown) {
      console.error('**importIDB()**', error)
      if (error instanceof Error) {
        messageBox.value = `Błąd podczas przywracania bazy danych ❌`
        if (error.message.match(/Malformed UTF-8 data/)) {
          messageBox.value = `Błąd. Kopia zapasowa może zostać przywrócona tylko w przeglądarce, w której została utworzona ❌`
        }
      } else {
        messageBox.value = `Nieznany błąd ❌`
      }
    }
  }
  // readAsText() is triggering onload event
  reader.readAsText(file)
}

async function dropDB() {
  const msg = `Usuniesz wszystkie dane, łącznie z listą produktów!`
  const answer = await promptModal(YepNopeModal, { text: msg })
  if (answer === false) return

  Object.keys(localStorage).forEach((key) => {
    if (key.match(/SB5_UUID/i)) return
    if (key.match(/SB5_/i)) localStorage.removeItem(key)
    updateData({ stockList: [], stockDate: '', stockWarehause: '' })
  })

  messageBox.value = `Baza danych została usunięta ❗`
}

const csvData = () => {
  const header = [
    'Kod',
    'Status',
    'Symfonia ma [m3]',
    'Magazyn ma [m3]',
    'Różnica [m3]',

    'Symfonia ma [m2]',
    'Magazyn ma [m2]',
    'Różnica [m2]',

    'Symfonia ma [szt]',
    'Magazyn ma [szt]',
    'Różnica [szt]'
  ].join('\t')

  const items = localStorage.getItem('SB5_stockList') || '[]'

  const result = JSON.parse(items).map((item: Plywood) => {
    const quantCub = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'm3')
    const quantSqr = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'm2')
    const quantPcs = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'szt')
    const invCub = calcQuant(item.size, item.inventory?.cubicSum, 'm3', 'm3')
    const invSqr = calcQuant(item.size, item.inventory?.cubicSum, 'm3', 'm2')
    const invPcs = calcQuant(item.size, item.inventory?.cubicSum, 'm3', 'szt')
    return [
      item.id,
      item.inventoryStatus,
      `-${quantCub.toFixed(2)}`,
      `${invCub.toFixed(2)}`,
      `${(invCub - quantCub).toFixed(2)}`,

      `-${quantSqr.toFixed(4)}`,
      `${invSqr.toFixed(4)}`,
      `${(invSqr - quantSqr).toFixed(4)}`,

      `-${quantPcs.toFixed(1)}`,
      `${invPcs.toFixed(1)}`,
      `${(invPcs - quantPcs).toFixed(1)}`
    ].join('\t')
  })
  result.unshift(header)
  return result.join('\n')
}

function downloadCSV(filename: string, csvData: string) {
  const blob = new Blob([csvData], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section id="stock-manager">
    <h2>Zarządzaj bazą danych</h2>
    <button class="" @click="exportDB()">
      <i class="bi bi-floppy2-fill"></i>
      <span>Utwórz kopię zapasową</span>
    </button>

    <button class="" @click="passClickTo('#import-backup')">
      <i class="bi bi-file-earmark-arrow-down-fill"></i>
      <span>Wczytaj kopię zapasową</span>
    </button>

    <input hidden type="file" name="import-backup" id="import-backup" @change="importDB($event)" />

    <button class="" @click="downloadCSV('file.csv', csvData())">
      <i class="bi bi-file-earmark-spreadsheet"></i>
      <span>Arkusz inwentaryzacji</span>
    </button>

    <button class="red-font" @click="dropDB">
      <i class="bi bi-file-earmark-x"></i>
      <span>Przywróć ustawienia fabryczne</span>
    </button>

    <p class="messageBox">{{ messageBox }}</p>
  </section>
</template>

<style scoped>
#stock-manager {
  display: grid;
  justify-content: center;
  gap: 2ch;
}

button {
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
</style>
