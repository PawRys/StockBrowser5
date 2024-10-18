<script setup lang="ts">
import { ref } from 'vue'
</script>

<template>
  <section id="keyboard">
    <button><i class="bi bi-arrow-left-short"></i></button>
    <button><i class="bi bi-arrow-right-short"></i></button>
    <button>&lpar;</button>
    <button>&rpar;</button>

    <button>7</button>
    <button>8</button>
    <button>9</button>
    <button>/</button>

    <button>4</button>
    <button>5</button>
    <button>6</button>
    <button>*</button>

    <button>1</button>
    <button>2</button>
    <button>3</button>
    <button>-</button>

    <button>0</button>
    <button>&comma;</button>
    <button><i class="bi bi-backspace"></i></button>
    <button>+</button>
  </section>
</template>

<style scoped>
#keyboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  position: fixed;
  bottom: 0;

  background-color: chartreuse;
  padding: 1rem;
  border: solid 1px red;
}
</style>
