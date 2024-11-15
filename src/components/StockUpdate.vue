<script setup lang="ts">
import _ from 'lodash'
import { ref, watch } from 'vue'
import { useStockStore } from '@/stores/stockStore'
import {
  defineDataType,
  convertToArray,
  removeGarbage,
  convertToObject,
  fetchRemoteData,
  mergeStocks
} from '@/exports/stockUpdateExports'

import PasteButton from '@/components/StockUpdate/PasteButton.vue'

const messagebox = ref('')
const datatype = ref()
const textbox = ref('')

watch(textbox, () => {
  const { message, data } = defineDataType(textbox.value)
  datatype.value = data
  messagebox.value = message
})

async function paste(data: Promise<string>) {
  textbox.value = await data
}

function clear() {
  textbox.value = ''
}

async function submit(e: Event): Promise<void> {
  console.time('/// total submit time')

  messagebox.value = 'Zapisuję...'
  const form = e.target as HTMLFormElement
  const formTextbox = form.elements.namedItem('textBox') as HTMLInputElement
  const formData = formTextbox.value
  const localData = JSON.parse(localStorage.getItem('SB5_stockList') || '[]') as Plywood[]

  const serverMessages = {
    bad_JSON: 'Problem ze strukturą danych ❌',
    data_not_exist: 'Kod jest przedawniony ❌',
    connection_error: 'Problem z połączeniem ❌',
    data_transmitted: 'Pobrano dane z chmury ✔️'
  }
  const localMessages = {
    stocks: 'Zaktualizowano stany ✔️',
    reservations: 'Zaktualizowano rezerwacje ✔️'
  }

  if (datatype.value === 'code') {
    const { message, data } = await fetchRemoteData(formData.trim())
    if (data && message === 'data_transmitted') {
      const incomingData = JSON.parse(data) as DBSchema
      incomingData.stockList = await mergeStocks(incomingData.stockList, localData, datatype.value)
      useStockStore().updateData(incomingData)
    }
    messagebox.value = serverMessages[message as keyof typeof serverMessages] || message
  } else {
    let incomingData = []
    incomingData = convertToArray(formData)
    incomingData = removeGarbage(incomingData, datatype.value)
    incomingData = convertToObject(incomingData, datatype.value)

    const today = new Date().toJSON().split('T')[0]
    const data: DBSchema = {
      stockList: await mergeStocks(incomingData, localData, datatype.value),
      stockDate: formData.match(/\d\d\d\d-\d\d-\d\d/)?.[0] || today,
      stockWarehause:
        _.trim(formData.match(/magazyny? ([A-ZĄĘŚĆŻŹÓŁŃ, ]+)/)?.[1], ' ,') || 'Wszystkie'
    }
    useStockStore().updateData(data)
    messagebox.value = localMessages[datatype.value as keyof typeof localMessages] || datatype.value
  }

  console.timeEnd('/// total submit time')
}
</script>

<template>
  <section id="stock-update" class="stock-update--backdrop">
    <h2>Wczytywanie danych</h2>
    <form id="myform" @submit.prevent="submit">
      <textarea
        class="text-box"
        name="textBox"
        v-model="textbox"
        placeholder="Wpisz tutaj"
      ></textarea>
      <input type="text" class="message-box" name="message-box" v-model="messagebox" disabled />
      <div class="buttonbar">
        <button type="button" @click="clear">
          <span>Wyczyść</span>
          <i class="bi bi-backspace"></i>
        </button>
        <PasteButton @clipboard-paste="paste">
          <span>Wklej ze schowka</span>
          <i class="bi bi-save"></i>
        </PasteButton>
        <button type="submit" class="cta" :disabled="!datatype">
          <span>Zatwierdź</span>
          <i class="bi bi-check2"></i>
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
#stock-update {
  padding: 1ch;
}
form {
  display: grid;
  gap: 1ch;
}

.text-box {
  padding: 0.6ch 1ch;
  width: 100%;
  height: 5rem;
}

.message-box {
  border: none;
  width: 100%;
  background-color: transparent;
  cursor: default;

  display: grid;
  grid-template-rows: 0fr;
  transition-property: grid-template-rows;
  transition-duration: 200ms;
}

.message-box > * {
  overflow: hidden;
}
.message-box.active {
  grid-template-rows: 2fr;
}
</style>
