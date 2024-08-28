<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog">
    <div class="center">
      <h2>Czy jesteś pewien?</h2>
      <button @click="$emit(Modal.EVENT_PROMPT, true)" class="btn">
        <i class="bi bi-check-square"></i>
        <span>Tak</span>
      </button>
      <button @click="$emit(Modal.EVENT_PROMPT, false)" class="btn">
        <i class="bi bi-x-square"></i>
        <span>Nie</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dialog {
  position: fixed;
  z-index: 999999;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  backdrop-filter: blur(4px);
}

.center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  padding: 20px;
  border: solid 1px var(--bg2-color);
  background-color: var(--bg-color);
  text-align: center;
}

.btn {
  margin: 10px;
}
</style>
