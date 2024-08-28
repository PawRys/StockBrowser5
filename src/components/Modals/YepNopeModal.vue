<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h3>Czy jesteś pewien?</h3>
      <button @click="$emit(Modal.EVENT_PROMPT, true)">
        <i class="bi bi-check-square"></i>
        <span>Tak</span>
      </button>
      <button @click="$emit(Modal.EVENT_PROMPT, false)">
        <i class="bi bi-x-square"></i>
        <span>Nie</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  z-index: 999999;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: grid;
  place-items: center;
  backdrop-filter: blur(4px);
}

.dialog {
  padding: 1rem;
  width: min(35ch, 100%);
  border: solid 1px var(--bg2-color);
  background-color: var(--bg-color);
  text-align: center;
}

.btn {
  margin: 10px;
}
</style>
