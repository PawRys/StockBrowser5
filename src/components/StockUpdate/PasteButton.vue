<script setup lang="ts">
import { ref } from 'vue'

const clipboardPerrmisionTest = ref(true)

await navigator.permissions
  .query({ name: 'clipboard-read' as PermissionName })
  .then((permissionStatus) => {
    permissionStatus.addEventListener('change', () => {
      if (permissionStatus.state.match(/denied/)) {
        clipboardPerrmisionTest.value = false
      }
      if (permissionStatus.state.match(/granted|pending/)) {
        clipboardPerrmisionTest.value = true
      }
    })
  })
  .catch((err) => {
    console.log('/** Browser permission issue. **/', err)
    clipboardPerrmisionTest.value = false
  })

async function clipboardPaste() {
  let result = ''

  await navigator.clipboard
    .readText()
    .then((text) => (result = text))
    .catch((reason) => console.log('/** Clipboard issue **/', reason))

  return result
}
</script>

<template>
  <button
    type="button"
    v-if="clipboardPerrmisionTest"
    @click="$emit('clipboardPaste', clipboardPaste())"
  >
    <slot></slot>
  </button>
</template>

<style scoped></style>
