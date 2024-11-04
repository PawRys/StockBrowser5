<script setup lang="ts">
import * as XLSX from 'xlsx'
import { ref } from 'vue'
import { calcQuant } from '@/exports/common_functions'
import CryptoJS from 'crypto-js'
import { downloadFile } from '@/exports/common_functions'
import { setRandomUUID } from '@/exports/common_functions'

import { promptModal } from 'jenesius-vue-modal'
import YepNopeModal from '@/components/Modals/YepNopeModal.vue'
// import AhaOKModal from '@/components/Modals/AhaOKModal.vue'

import { useStockStore } from '@/stores/stockStore'
const { updateData } = useStockStore()

const messageBox = ref('')

function passClickTo(query: string) {
  const element = document.querySelector(query) as HTMLElement
  element.click()
}

async function exportDB() {
  // const msg = `W ciasteczkach zostanie zapisany unikalny dla tego urządzenia klucz.
  // Usunięcie ciasteczek spowoduje brak możliwości przywracania kopii zapasowych.`
  // await promptModal(AhaOKModal, { text: msg })
  setRandomUUID()

  const file = `StanyBackup-${new Date().toJSON().split('T')[0]}.txt`
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
          messageBox.value = `Błąd. Kopia zapasowa może zostać przywrócona tylko na urządzeniu, na którym została utworzona ❌`
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
  const msg = `Usuniesz wszystkie dane (m.in. stany magazynowe), z wyjątkiem klucza potrzebnego do przywracania kopii zapasowej.`
  const answer = await promptModal(YepNopeModal, { text: msg })
  if (answer === false) return

  Object.keys(localStorage).forEach((key) => {
    if (key.match(/SB5_UUID/i)) return
    if (key.match(/SB5_/i)) localStorage.removeItem(key)
    updateData({ stockList: [], stockDate: '', stockWarehause: '' })
  })

  messageBox.value = `Baza danych została usunięta ❗`
}

function downloadSpreadsheet() {
  const data = prepareData()
  saveToXLSX(data)
}

function prepareData() {
  return JSON.parse(localStorage.getItem('SB5_stockList') || '[]').map((item: Plywood) => {
    const quantCub = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'm3')
    const quantSqr = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'm2')
    const quantPcs = calcQuant(item.size, item.quantityCubicTotal, 'm3', 'szt')
    const invCub = calcQuant(item.size, item.inventoryCubicSum, 'm3', 'm3')
    const invSqr = calcQuant(item.size, item.inventoryCubicSum, 'm3', 'm2')
    const invPcs = calcQuant(item.size, item.inventoryCubicSum, 'm3', 'szt')

    return {
      Kod: item.id,
      Grupa: item.attr.faceGroup,
      Grubość: item.attr.sizeT,
      Klasa: item.attr.faceType,
      Rozmiar: item.attr.footSize,

      Status: item.inventoryStatus,

      'Symfonia ma [m3]': quantCub.toFixed(3),
      'Magazyn ma [m3]': invCub.toFixed(3),
      'Różnica [m3]': (invCub - quantCub).toFixed(3),

      'Symfonia ma [m2]': quantSqr.toFixed(4),
      'Magazyn ma [m2]': invSqr.toFixed(4),
      'Różnica [m2]': (invSqr - quantSqr).toFixed(4),

      'Symfonia ma [szt]': quantPcs.toFixed(1),
      'Magazyn ma [szt]': invPcs.toFixed(1),
      'Różnica [szt]': (invPcs - quantPcs).toFixed(1)
    }
  })
}

function saveToXLSX(data: any[]) {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data)
  const workbook: XLSX.WorkBook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inwentaryzacja')
  XLSX.writeFile(workbook, `Inwentaryzacja-${new Date().toJSON().split('T')[0]}.xlsx`)
}
</script>

<template>
  <section id="stock-manager">
    <h2>Zarządzaj bazą danych</h2>

    <div class="button-container">
      <button class="" @click="exportDB()">
        <i class="bi bi-floppy2-fill"></i>
        <span>Utwórz kopię zapasową</span>
      </button>

      <button class="" @click="passClickTo('#import-backup')">
        <i class="bi bi-file-earmark-arrow-down-fill"></i>
        <span>Wczytaj kopię zapasową</span>
      </button>
      <input
        hidden
        type="file"
        name="import-backup"
        id="import-backup"
        @change="importDB($event)"
      />

      <!-- <button class="" @click="downloadCSV('file.csv', csvData())"> -->
      <button class="blue-font" @click="downloadSpreadsheet()">
        <i class="bi bi-file-earmark-spreadsheet"></i>
        <span>Arkusz inwentaryzacji</span>
      </button>

      <button class="red-font" @click="dropDB()">
        <i class="bi bi-file-earmark-x"></i>
        <span>Przywróć ustawienia fabryczne</span>
      </button>
    </div>

    <p class="messageBox">{{ messageBox }}</p>
    <!-- <div v-html="downloadSpreadsheet()"></div> -->
  </section>
</template>

<style scoped>
#stock-manager {
  padding: 1ch;
}

.button-container {
  display: grid;
  justify-content: start;
  gap: 2ch;
}

button {
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}
</style>
