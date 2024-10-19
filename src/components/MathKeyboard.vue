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
  { value: 'backspace', html: '<i class="bi bi-backspace"></i>' },

  { value: '4', html: '4' },
  { value: '5', html: '5' },
  { value: '6', html: '6' },
  { value: '*', html: '*' },
  { value: 'larrow', html: '<i class="bi bi-arrow-left-short"></i>' },

  { value: '1', html: '1' },
  { value: '2', html: '2' },
  { value: '3', html: '3' },
  { value: '+', html: '+' },
  { value: 'rarrow', html: '<i class="bi bi-arrow-right-short"></i>' },

  { value: '0', html: '0' },
  { value: '.', html: '.' },
  { value: '(', html: '(' },
  { value: '-', html: '-' },
  { value: ')', html: ')' }
]
</script>

<template>
  <section id="keyboard">
    <template v-for="button in buttons" :key="`button-${button.value}`">
      <button @click="emitValue(button.value)" v-html="button.html"></button>
    </template>
  </section>
</template>

<style scoped>
#keyboard {
  display: grid;
  grid-template-columns: repeat(5, 1fr);

  position: fixed;
  bottom: 0;

  background-color: chartreuse;
  padding: 1rem;
  border: solid 1px red;
}
</style>
