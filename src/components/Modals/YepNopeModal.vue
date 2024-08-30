<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
const props = defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h3>Czy jesteś pewien?</h3>
      <p class="red-font" v-html="props.text"></p>
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;

  padding: 1rem;
  padding-bottom: 3rem;
  border: solid 1px var(--bg2-color);
  width: min(45ch, 100%);
  background-color: var(--bg-color);
  text-align: center;
}

.btn {
  margin: 10px;
}
</style>
