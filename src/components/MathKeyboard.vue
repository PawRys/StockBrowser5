<script setup lang="ts">
import { ref } from 'vue'

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
  { value: '(', html: '(' },

  { value: '1', html: '1' },
  { value: '2', html: '2' },
  { value: '3', html: '3' },
  { value: '-', html: '-' },
  { value: ')', html: ')' },

  { value: '0', html: '0' },
  { value: '.', html: '.' },
  { value: 'ArrowLeft', html: '<i class="bi bi-arrow-left-short"></i>' },
  { value: '+', html: '+' },
  { value: 'ArrowRight', html: '<i class="bi bi-arrow-right-short"></i>' }
]

function addAnimation(event: Event) {
  const button = event.target as HTMLElement
  button.classList.remove('clicked')
  void button.offsetWidth
  button.classList.add('clicked')
}

function removeAnimation(event: Event) {
  const button = event.target as HTMLElement
  button.classList.remove('clicked')
}

const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwipe = ref(false)
const SWIPE_THRESHOLD = 10

function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isSwipe.value = false
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0]
  const diffX = Math.abs(touch.clientX - touchStartX.value)
  const diffY = Math.abs(touch.clientY - touchStartY.value)

  if (diffX > SWIPE_THRESHOLD || diffY > SWIPE_THRESHOLD) {
    isSwipe.value = true
  }
}

function handleTouchEnd(event: Event, buttonValue: string) {
  if (!isSwipe.value) {
    insertCharacter(buttonValue)
    addAnimation(event)
  }
}

function insertCharacter(key: string) {
  const el = document.querySelector(':focus') as HTMLInputElement | HTMLTextAreaElement | null
  if (el && 'value' in el) {
    const text = el.value
    const caretStart = el.selectionStart || 0
    const caretEnd = el.selectionEnd || 0
    let dispatchInputType = ''

    if (key === 'ArrowLeft') {
      el.setSelectionRange(caretStart - 1, caretEnd - 1)
    }
    if (key === 'ArrowRight') {
      const pos = caretStart < text.length ? caretStart + 1 : 0
      el.setSelectionRange(pos, pos)
    }
    if (key === 'Backspace') {
      let removeStart = caretStart
      let removeEnd = caretEnd
      if (caretStart === caretEnd) {
        removeStart = caretStart - 1
        removeEnd = caretEnd
      }
      const textBeforeSelection = text.substring(0, removeStart)
      const textAfterSelection = text.substring(removeEnd)
      el.value = textBeforeSelection + textAfterSelection
      el.setSelectionRange(removeStart, removeEnd)
      dispatchInputType = 'deleteContentBackward'
    }
    if (key.match(/[-+*/,.0-9()]/)) {
      const textBeforeSelection = text.substring(0, caretStart)
      const textAfterSelection = text.substring(caretEnd)
      el.value = textBeforeSelection + key + textAfterSelection
      el.setSelectionRange(caretStart + key.length, caretEnd + key.length)
    }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: dispatchInputType }))
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: key }))
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: key }))
  }
}
</script>

<template>
  <section id="keyboard">
    <template v-for="button in buttons" :key="`button-${button.value}`">
      <button
        @animationend="removeAnimation"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd($event, button.value)"
        @mousedown.prevent="handleTouchEnd($event, button.value)"
        v-html="button.html"
      ></button>
    </template>
  </section>
</template>

<style scoped>
#keyboard {
  grid-column: 1/4;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5ch;

  place-self: center;
  bottom: 1ch;

  margin-top: 1rem;
  /* margin-inline: 3rem; */
  border-radius: 1ch;
  padding: 0.5ch;
  background-color: var(--bg-color);
  font-size: 1.1em;
}

/* #keyboard button:nth-child(5n + 1) {
  grid-column: 2/3;
} */

#keyboard button {
  width: 100%;
}

#keyboard button.clicked {
  z-index: 999;
}

#keyboard button::after {
  content: '';
  position: absolute;
  z-index: 999;
  inset: 0;
  border-radius: 1ch;
}

#keyboard button.clicked::after {
  animation-name: noticable;
  animation-duration: 150ms;
}

@keyframes noticable {
  100% {
    border: 2px solid var(--accent-lighter);
    inset: -0.5rem;
  }
}
</style>
