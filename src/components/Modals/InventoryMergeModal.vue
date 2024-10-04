<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <button class="close-button compact" @click="$emit(Modal.EVENT_PROMPT, 'local')">
        <i class="bi bi-x-square-fill"></i>
      </button>
      <h3>Inwentaryzacja</h3>

      <p>W ściąganych danych znajdują się wpisy inwentaryzacji. Co robić?</p>

      <button @click="$emit(Modal.EVENT_PROMPT, 'local')" class="btn">
        <span><b>Pozostaw</b> dane z tego urządzenia</span>
        <i class="bi bi-pc-display-horizontal"></i>
        <!-- <i class="bi bi-x-square"></i> -->
      </button>

      <button @click="$emit(Modal.EVENT_PROMPT, 'cloud')" class="btn">
        <span><b>Zamień</b> na dane z chmury</span>
        <i class="bi bi-cloud"></i>
        <!-- <i class="bi bi-arrow-clockwise"></i> -->
      </button>

      <button @click="$emit(Modal.EVENT_PROMPT, 'merge')" class="btn">
        <span><b>Sumuj</b> lokalne i chmurę</span>
        <i class="bi bi-pc-display-horizontal"></i>+<i class="bi bi-cloud"></i>
        <!-- <i class="bi bi-plus-square"></i> -->
      </button>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  display: grid;
  grid-template-columns: 1fr;
}

.btn {
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 10px;
  width: auto;
}

.close-button {
  margin-left: auto;
}

/* .btn > span {
  display: inline-flex;
  gap: 0.6ch;
} */

.btn :first-child {
  margin-right: auto;
}
</style>
