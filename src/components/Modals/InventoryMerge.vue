<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog">
    <div class="center">
      <h3>Wybierz, które dane zapisać</h3>

      <p>
        W danych, które importujesz istnieje spis z natury (inwentaryzacja).<br />
        Wybierz, które dane zapisać na urządzeniu:
      </p>

      <p>
        <button @click="$emit(Modal.EVENT_PROMPT, 'local')" class="btn">
          <span>Lokalne</span>
          <span><i class="bi bi-database"></i></span>
        </button>
        - pozostaw dane lokalne <i class="bi bi-database"></i>, ignoruj dane z chmury
        <i class="bi bi-cloud-slash-fill"></i>
      </p>

      <p>
        <button @click="$emit(Modal.EVENT_PROMPT, 'cloud')" class="btn">
          <span>Chmura</span>
          <span><i class="bi bi-cloud"></i></span>
        </button>
        - usuń dane lokalne <i class="bi bi-database-fill-slash"></i>, zapisz dane z chmury
        <i class="bi bi-cloud"></i>
      </p>

      <p>
        <button @click="$emit(Modal.EVENT_PROMPT, 'merge')" class="btn">
          <span>Sumuj</span>
          <span><i class="bi bi-database"></i> + <i class="bi bi-cloud"></i></span>
        </button>
        - sumuj dane lokalne <i class="bi bi-database"></i> i dane z chmury
        <i class="bi bi-cloud"></i>
      </p>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
}

.center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
}

.btn {
  margin: 10px;
}
</style>
