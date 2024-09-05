<script setup lang="ts">
import { Modal } from 'jenesius-vue-modal'
const props = defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="dialog-backdrop">
    <div class="dialog">
      <h3>Weź to zrozum.</h3>
      <p v-html="props.text"></p>
      <button @click="$emit(Modal.EVENT_PROMPT, true)">
        <i class="bi bi-check-square"></i>
        <span>Aha Ok</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
h3 {
  width: 100%;
}
</style>
