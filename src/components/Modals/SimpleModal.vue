<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
</script>

<template>
  <div class="dialog">
    <div class="center">
      <!-- <p>{{ text }}</p> -->
      <button @click="$emit(Modal.EVENT_PROMPT, 'yep')" class="btn">YES</button>
      <button @click="$emit(Modal.EVENT_PROMPT, 'nope')" class="btn">NO</button>
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
