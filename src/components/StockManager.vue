<script setup lang="ts"></script>

<template>
  <div>
    <h2>StockManager</h2>

    <section></section>

    <section>
      <div class="color" style="background: var(--color-accent-100)"></div>
      <div class="color" style="background: var(--color-accent-150)"></div>
      <div class="color" style="background: var(--color-accent-200)"></div>
      <div class="color" style="background: var(--color-accent-250)"></div>
      <div class="color" style="background: var(--color-accent-300)"></div>
      <div class="color" style="background: var(--color-accent-350)"></div>
      <div class="color" style="background: var(--color-accent-400)"></div>
      <div class="color" style="background: var(--color-accent-450)"></div>
      <div class="color" style="background: var(--color-accent-500)"></div>
      <div class="color" style="background: var(--color-accent-550)"></div>
      <div class="color" style="background: var(--color-accent-600)"></div>
      <div class="color" style="background: var(--color-accent-650)"></div>
      <div class="color" style="background: var(--color-accent-700)"></div>
      <div class="color" style="background: var(--color-accent-750)"></div>
      <div class="color" style="background: var(--color-accent-800)"></div>
    </section>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-wrap: wrap;
}
.color {
  aspect-ratio: 1/1;
  width: 120px;
  background-color: aqua;
  margin: 5px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.color span {
  background-color: white;
  width: 100%;
  text-align: center;
}
</style>
