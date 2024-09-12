<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h3>Inwentaryzacja</h3>

      <p>W ściąganych danych znajdują się wpisy inwentaryzacji. Co robić?</p>

      <div>
        <button @click="$emit(Modal.EVENT_PROMPT, 'local')" class="btn">
          <!-- <i class="bi bi-pc-display-horizontal"></i> -->
          <span><b>Pozostaw</b> bez zmian</span>
          <i class="bi bi-x-square"></i>
        </button>
      </div>

      <div>
        <button @click="$emit(Modal.EVENT_PROMPT, 'cloud')" class="btn">
          <!-- <i class="bi bi-cloud-arrow-down-fill"></i> -->
          <span><b>Zamień</b> na ściągane dane</span>
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div>
        <button @click="$emit(Modal.EVENT_PROMPT, 'merge')" class="btn">
          <!-- <i class="bi bi-pc-display-horizontal"></i> + <i class="bi bi-cloud-arrow-down-fill"></i> -->
          <span><b>Sumuj</b></span>
          <i class="bi bi-plus-square"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  display: block;
}

.btn {
  flex-wrap: wrap;
  margin: 10px;
  width: auto;
}
</style>
