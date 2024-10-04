<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
const props = defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <p class="red-font" v-html="props.text"></p>
      <h3>Czy jesteś pewien?</h3>
      <div class="button-bar">
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
  </div>
</template>

<style scoped>
h3 {
  width: 100%;
}

.button-bar {
  display: flex;
  justify-content: space-evenly;
}
</style>
