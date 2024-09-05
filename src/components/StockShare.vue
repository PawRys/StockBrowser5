<script setup lang="ts">
import { ref } from 'vue'
import { php_server_url } from '@/exports/urls'

const messagebox = ref()
const shareCode = ref()
const password = ref()

async function shareData() {
  messagebox.value = 'Wysyłanie danych...'
  shareCode.value = ''
  const POST_data = {
    action: 'provide',
    password: password.value.trim() || '',
    stockData: {
      stockDate: localStorage.getItem('SB5_stockDate'),
      stockWarehause: localStorage.getItem('SB5_stockWarehause'),
      stockList: JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
    }
  }

  const fetchSettings = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(POST_data)
  }

  const fetchResponse = await fetch(php_server_url, fetchSettings).catch((err) => {
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
  <section id="stock-share" class="stock-shar--backdrop">
    <div class="stock-share--window">
      <h2>Udostępnij</h2>
      <form action="javascript:void(0);">
        <input type="password" placeholder="Hasło (opcjonalne)" v-model="password" />
        <button class="cta" @click="shareData">Generuj kod</button>
      </form>
      <p class="message-box">{{ messagebox }}</p>
      <p class="share-code">{{ shareCode }}</p>
    </div>
  </section>
</template>

<style scoped>
.stock-share--window {
  padding: 1ch;
}

.share-code {
  margin-block: 1ch;
  font-size: 5rem;
  font-weight: 500;
  text-align: center;
}

form {
  display: flex;
  gap: 1ch;

  padding: 1ch;
  border-radius: 1ch;
  width: fit-content;
  background-color: var(--bg2-color);
}

input {
  width: 20ch;
}
</style>
