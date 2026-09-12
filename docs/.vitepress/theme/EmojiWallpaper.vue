<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Tile = { x: number; y: number; size: number; angle: number; src: string }
const emojis = [
  '1fae0', '1f422', '1f48a', '1f9ea', '2697', '1f47e', '1f60b', '1f97a',
  '2728', '1f31f', '1f4ab', '2b50', '1f4a1', '1f388', '1f38a', '1f38f',
  '1f390', '1f397', '1fa84'
].map(code => `/emoji/emoji_u${code}.svg`)
const patterns = ['mosaic', 'lotus', 'stacked', 'scattered', 'prism'] as const
const tiles = ref<Tile[]>([])
const pattern = ref<string>('')
const root = ref<HTMLElement>()
let frame = 0
let observer: IntersectionObserver | undefined
let media: MediaQueryList | undefined
let visible = false
let pointer = { x: 0, y: 0 }

function reset() {
  cancelAnimationFrame(frame)
  frame = 0
  root.value?.querySelectorAll<SVGElement>('.emoji-wallpaper__motion').forEach(el => {
    el.style.transform = 'rotate(0deg)'
  })
}

function move(event: PointerEvent) {
  if (!visible || document.hidden || media?.matches || event.pointerType === 'touch') return
  pointer = { x: event.clientX, y: event.clientY }
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    const box = root.value?.getBoundingClientRect()
    if (!box || !box.width || !box.height) return
    const cursorX = (pointer.x - box.left) / box.width * 1440
    const cursorY = (pointer.y - box.top) / box.height * 420
    root.value?.querySelectorAll<SVGElement>('.emoji-wallpaper__motion').forEach(el => {
      const index = Number(el.getAttribute('data-index'))
      const tile = tiles.value[index]
      if (!tile) return
      const dx = cursorX - tile.x
      const dy = cursorY - tile.y
      const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 340)
      el.style.transform = `rotate(${Math.max(-7, Math.min(7, dx / 24)) * influence}deg)`
    })
  })
}

onMounted(() => {
  const chosen = [...emojis].sort(() => Math.random() - .5).slice(0, 3 + Math.floor(Math.random() * 3))
  const mode = patterns[Math.floor(Math.random() * patterns.length)]
  pattern.value = mode
  const result: Tile[] = []
  const add = (x: number, y: number, size: number, angle = 0, index = result.length) => {
    result.push({ x, y, size, angle, src: chosen[index % chosen.length] })
  }
  if (mode === 'lotus' || mode === 'prism') {
    for (let center = -1; center < 3; center++) {
      const cx = center * 340 + 160
      add(cx, 210, 40)
      for (let ring = 1; ring <= 2; ring++) {
        const count = mode === 'lotus' ? ring * 5 : ring * 4
        for (let i = 0; i < count; i++) {
          const angle = i * Math.PI * 2 / count + ring * .22
          const radius = ring * 53
          add(cx + Math.cos(angle) * radius, 210 + Math.sin(angle) * radius,
            mode === 'lotus' ? 28 + ring * 3 : 34, angle * 180 / Math.PI + 90, i + ring)
        }
      }
    }
  } else {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const scatter = mode === 'scattered'
        const stacked = mode === 'stacked'
        const x = col * 125 + (row % 2 ? 62 : 0) + (scatter ? Math.random() * 54 : 0)
        const y = row * 92 + (scatter ? Math.random() * 40 : 0)
        add(x, y, scatter ? 28 + Math.random() * 32 : stacked ? 62 : 48,
          scatter ? Math.random() * 70 - 35 : stacked ? (col % 2 ? 14 : -14) : 0)
      }
    }
  }
  tiles.value = result
  media = matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', reset)
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (!visible) reset()
  })
  if (root.value) observer.observe(root.value)
  window.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('pointerleave', reset)
  document.addEventListener('visibilitychange', reset)
})

onBeforeUnmount(() => {
  reset()
  observer?.disconnect()
  media?.removeEventListener('change', reset)
  window.removeEventListener('pointermove', move)
  document.removeEventListener('pointerleave', reset)
  document.removeEventListener('visibilitychange', reset)
})
</script>

<template>
  <div ref="root" class="emoji-wallpaper" :data-pattern="pattern" aria-hidden="true">
    <svg viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" focusable="false">
      <g v-for="(tile, index) in tiles" :key="index" :transform="`translate(${tile.x} ${tile.y}) rotate(${tile.angle})`">
        <g class="emoji-wallpaper__motion" :data-index="index">
          <image :href="tile.src" :x="-tile.size / 2" :y="-tile.size / 2" :width="tile.size" :height="tile.size" preserveAspectRatio="xMidYMid meet" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style>
.emoji-wallpaper {
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: .06;
}
.emoji-wallpaper svg { display: block; width: 100%; height: 100%; overflow: hidden; }
.emoji-wallpaper image { display: block; }
.dark .emoji-wallpaper { opacity: .055; }
.emoji-wallpaper__motion {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 650ms cubic-bezier(.2,.8,.2,1);
}
@media (prefers-reduced-motion: reduce) {
  .emoji-wallpaper__motion { transition: none; transform: none !important; }
}
</style>
