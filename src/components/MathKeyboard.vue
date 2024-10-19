<script setup lang="ts">
const emit = defineEmits(['keyboardPress']) // Define the event

const emitValue = (value: unknown) => {
  emit('keyboardPress', value) // Emit event with a value
}

const buttons = [
  { value: '7', html: '7' },
  { value: '8', html: '8' },
  { value: '9', html: '9' },
  { value: '/', html: '/' },
  { value: 'Backspace', html: '<i class="bi bi-backspace"></i>' },

  { value: '4', html: '4' },
  { value: '5', html: '5' },
  { value: '6', html: '6' },
  { value: '*', html: '*' },
  { value: 'ArrowLeft', html: '<i class="bi bi-arrow-left-short"></i>' },

  { value: '1', html: '1' },
  { value: '2', html: '2' },
  { value: '3', html: '3' },
  { value: '-', html: '-' },
  { value: 'ArrowRight', html: '<i class="bi bi-arrow-right-short"></i>' },

  { value: '0', html: '0' },
  { value: '.', html: '.' },
  { value: '(', html: '(' },
  { value: '+', html: '+' },
  { value: ')', html: ')' }
]
</script>

<template>
  <section id="keyboard">
    <template v-for="button in buttons" :key="`button-${button.value}`">
      <button @pointerdown.prevent="emitValue(button.value)" v-html="button.html"></button>
    </template>
  </section>
</template>

<style scoped>
#keyboard {
  grid-column: 1/4;
  /* grid-row: 4/5; */
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5ch;

  place-self: center;
  /* position: fixed; */
  bottom: 1ch;

  background-color: var(--bg-color);
  padding: 0.5ch;
  border-radius: 1ch;
}

#keyboard button {
  width: 100%;
}
</style>
