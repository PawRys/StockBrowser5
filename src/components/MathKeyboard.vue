<script setup lang="ts">
import { ref } from 'vue'

const buttons = [
  { value: '', html: '', cls: 'empty' },
  { value: '', html: '', cls: 'empty' },
  { value: 'Clear', html: 'C', cls: 'clear' },
  { value: 'Backspace', html: '<i class="bi bi-backspace"></i>', cls: 'backspace' },

  { value: '7', html: '7', cls: 'digit' },
  { value: '8', html: '8', cls: 'digit' },
  { value: '9', html: '9', cls: 'digit' },
  { value: '/', html: '/', cls: 'action' },

  { value: '4', html: '4', cls: 'digit' },
  { value: '5', html: '5', cls: 'digit' },
  { value: '6', html: '6', cls: 'digit' },
  { value: '*', html: '*', cls: 'action' },

  { value: '1', html: '1', cls: 'digit' },
  { value: '2', html: '2', cls: 'digit' },
  { value: '3', html: '3', cls: 'digit' },
  { value: '-', html: '-', cls: 'action' },

  { value: '', html: '', cls: 'empty' },
  { value: '0', html: '0', cls: 'digit' },
  { value: '.', html: '.' },
  { value: '+', html: '+', cls: 'action' },

  { value: '(', html: '(' },
  { value: ')', html: ')' },

  { value: 'ArrowLeft', html: '←' },
  { value: 'ArrowRight', html: '→' }
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

    if (key === 'Clear') {
      el.value = ''
    }

    if (key === 'Exit') {
      el.blur()
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
  <div id="keyboard">
    <template v-for="button in buttons" :key="`button-${button.value}`">
      <span
        :class="['button', button.cls]"
        @animationend="removeAnimation"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="handleTouchEnd($event, button.value)"
        @mousedown.prevent="handleTouchEnd($event, button.value)"
        v-html="button.html"
      ></span>
    </template>
  </div>
</template>

<style scoped>
#keyboard {
  grid-column: 1/4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: stretch;
  justify-items: stretch;
  gap: 0.5ch;

  position: absolute;
  place-self: end center;
  top: 5rem;
  /* translate: 0 calc(100% + 2rem); */

  padding-block: 1rem;
  border-radius: 1ch;
  width: min(100svw - 2ch, 25rem);

  z-index: 1;
}

#keyboard .button {
  width: auto;
  height: 50px;
  font-size: 1.5em;
  line-height: 1;
  background-color: var(--accent-lighter);
}

#keyboard .digit {
  background-color: var(--cta-color);
}

#keyboard .action {
  background-color: var(--accent-light);
}

#keyboard .zero {
  grid-column: span 2;
}

#keyboard .clear {
  margin-bottom: 1ch;
}

#keyboard .exit {
  grid-column: span 2;
}
#keyboard .empty {
  visibility: hidden;
}

#keyboard .button.clicked {
  z-index: 999;
}

#keyboard .button::after {
  content: '';
  position: absolute;
  z-index: 999;
  inset: 0;
  border-radius: 1ch;
}

#keyboard .button.clicked::after {
  animation-name: noticable-click;
  animation-duration: 150ms;
}

@keyframes noticable-click {
  100% {
    border: 2px solid var(--accent-lighter);
    inset: -0.5rem;
  }
}
</style>
