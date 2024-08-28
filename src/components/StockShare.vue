<script setup lang="ts">
import { ref } from 'vue'

const messagebox = ref()
const shareCode = ref()
const password = ref()

async function shareData() {
  messagebox.value = 'Wysyłanie danych...'
  const POST_data = {
    action: 'provide',
    password: password.value || '',
    stockData: {
      stockDate: localStorage.SB5_stockDate,
      stockWarehause: localStorage.SB5_stockWarehause,
      stockList: JSON.parse(localStorage.SB5_stockList)
    }
  }

  const fetchSettings = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(POST_data)
  }

  const url = 'https://bossman.hekko24.pl/stock_browser_server/server.php'
  // const url = 'http://localhost:3000/php_server/server.php'

  const fetchResponse = await fetch(url, fetchSettings).catch((err) => {
    console.error('Error fetching data:', err)
    messagebox.value = 'Problem z połączeniem ❌'
    return
  })

  if (fetchResponse) {
    const responseText = await fetchResponse.text()
    try {
      const { pincode, password_verify } = JSON.parse(responseText)
      shareCode.value = pincode
      messagebox.value = password_verify
        ? '🔑 Hasło prawidłowe. Udostępniasz wrażliwe dane.'
        : '🔒 Błędne hasło. Udostępniasz tylko bezpieczne dane.'
    } catch (err) {
      console.error('Error parsing JSON:', err)
      console.log('PHP error message: ', responseText)
      messagebox.value = 'Problem ze strukturą danych ❌'
    }
  }
}
</script>

<template>
  <section>
    <h2>Udostępnij</h2>
    <form action="javascript:void(0);">
      <input type="password" placeholder="Sekretne hasło" v-model="password" />
      <button class="cta" @click="shareData">Generuj kod</button>
    </form>
    <p>{{ shareCode }}</p>
    <p>{{ messagebox }}</p>
  </section>
</template>

<style scoped></style>
