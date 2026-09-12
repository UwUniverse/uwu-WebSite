<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

type Pattern = 'checker' | 'stripes' | 'particles'
type PaletteColor = { hex: string; rgb: string }
type DriftDirection = { x: number; y: number }
type Particle = {
  x: number
  y: number
  z: number
  size: number
  rotation: number
  spin: number
  speed: number
  phase: number
  sway: number
}

const patterns: Pattern[] = ['checker', 'stripes', 'particles']
const driftDirections: DriftDirection[] = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
]

// Sampled from the pale blue panel in bamberga.png.
const lightPalette: PaletteColor[] = [
  { hex: '#6F9FE5', rgb: '111 159 229' },
  { hex: '#5D8FD1', rgb: '93 143 209' },
  { hex: '#8E93EC', rgb: '142 147 236' },
  { hex: '#7D8FDB', rgb: '125 143 219' },
  { hex: '#A5BEFF', rgb: '165 190 255' },
  { hex: '#6D7BCC', rgb: '109 123 204' }
]

const pattern = ref<Pattern>('checker')
const color = ref<PaletteColor>(lightPalette[0])
const driftDirection = ref<DriftDirection>(driftDirections[0])
const root = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const styleVars = computed(() => ({
  '--uwu-pattern-light-rgb': color.value.rgb,
  '--uwu-pattern-checker-x': `${driftDirection.value.x * 104}px`,
  '--uwu-pattern-checker-y': `${driftDirection.value.y * 104}px`,
  '--uwu-pattern-stripes-x': `${driftDirection.value.x * 90}px`,
  '--uwu-pattern-stripes-y': `${driftDirection.value.y * 90}px`
}))

const particles: Particle[] = []
let context: CanvasRenderingContext2D | undefined
let animationFrame = 0
let resizeObserver: ResizeObserver | undefined
let visibilityObserver: IntersectionObserver | undefined
let media: MediaQueryList | undefined
let visible = true
let running = false
let lastFrame = 0
let width = 0
let height = 0
let pointerX = 0
let pointerY = 0

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function createParticle(): Particle {
  return {
    x: randomBetween(-.05, 1.05),
    y: randomBetween(.04, .96),
    z: randomBetween(.55, 2.2),
    size: randomBetween(14, 48),
    rotation: randomBetween(-Math.PI, Math.PI),
    spin: randomBetween(-.0007, .0007),
    speed: randomBetween(.00013, .00025),
    phase: randomBetween(0, Math.PI * 2),
    sway: randomBetween(.05, .11)
  }
}

function recycleParticle(particle: Particle) {
  particle.x = randomBetween(-.14, -.05)
  particle.y = randomBetween(.04, .96)
  particle.z = 2.2
  particle.size = randomBetween(14, 48)
  particle.rotation = randomBetween(-Math.PI, Math.PI)
  particle.spin = randomBetween(-.0007, .0007)
  particle.speed = randomBetween(.00013, .00025)
  particle.phase = randomBetween(0, Math.PI * 2)
  particle.sway = randomBetween(.05, .11)
}

function resizeCanvas() {
  const rootElement = root.value || document.querySelector<HTMLElement>('.uwu-pattern-wallpaper')
  const element = canvas.value || rootElement?.querySelector<HTMLCanvasElement>('canvas')
  const box = rootElement?.getBoundingClientRect()
  if (!element || !box || !box.width || !box.height) return
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  width = box.width
  height = box.height
  element.width = Math.ceil(width * pixelRatio)
  element.height = Math.ceil(height * pixelRatio)
  context = element.getContext('2d') || undefined
  context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  if (!particles.length) {
    for (let i = 0; i < 42; i++) particles.push(createParticle())
  }
  draw(0, true)
}

function draw(timestamp: number, force = false) {
  if (!context || !width || !height) return
  const elapsed = lastFrame ? Math.min(80, timestamp - lastFrame) : 0
  if (!force && lastFrame && elapsed < 33) return
  lastFrame = timestamp
  context.clearRect(0, 0, width, height)
  context.fillStyle = document.documentElement.classList.contains('dark')
    ? '#EBEFF4'
    : color.value.hex
  const focalLength = Math.min(width, height) * .72
  const driftX = pointerX * 28
  const driftY = pointerY * 20
  const ambientTime = timestamp * .00055

  particles.forEach(particle => {
    if (!force) {
      particle.x += elapsed * particle.speed
      particle.rotation += elapsed * particle.spin
      if (particle.x > 1.08) recycleParticle(particle)
    }
    const swayX = Math.sin(ambientTime + particle.phase) * particle.sway
    const swayY = Math.cos(ambientTime * .82 + particle.phase) * particle.sway * .72
    const x = particle.x * width + swayX * focalLength + driftX / particle.z
    const y = particle.y * height + swayY * focalLength + driftY / particle.z
    const size = particle.size / particle.z
    const alpha = Math.min(.82, Math.max(.24, (2.2 - particle.z) * .48))
    if (x < -size || x > width + size || y < -size || y > height + size) return
    context!.save()
    context!.translate(x, y)
    context!.rotate(particle.rotation + pointerX * .035)
    context!.globalAlpha = alpha
    const arm = size * .16
    const half = size * .5
    context!.beginPath()
    context!.moveTo(-arm, -half)
    context!.lineTo(arm, -half)
    context!.lineTo(arm, -arm)
    context!.lineTo(half, -arm)
    context!.lineTo(half, arm)
    context!.lineTo(arm, arm)
    context!.lineTo(arm, half)
    context!.lineTo(-arm, half)
    context!.lineTo(-arm, arm)
    context!.lineTo(-half, arm)
    context!.lineTo(-half, -arm)
    context!.lineTo(-arm, -arm)
    context!.closePath()
    context!.fill()
    context!.restore()
  })
}

function tick(timestamp: number) {
  animationFrame = 0
  if (!running) return
  draw(timestamp)
  animationFrame = requestAnimationFrame(tick)
}

function updateRunning() {
  const shouldRun = pattern.value === 'particles'
    && visible
    && !document.hidden
    && !media?.matches
  if (shouldRun && !running) {
    running = true
    lastFrame = 0
    animationFrame = requestAnimationFrame(tick)
  } else if (!shouldRun && running) {
    running = false
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = 0
    draw(0, true)
  }
}

function handlePointer(event: PointerEvent) {
  if (event.pointerType === 'touch' || pattern.value !== 'particles') return
  const rootElement = root.value || document.querySelector<HTMLElement>('.uwu-pattern-wallpaper')
  const box = rootElement?.getBoundingClientRect()
  if (!box || !box.width || !box.height) return
  pointerX = (event.clientX - box.left) / box.width * 2 - 1
  pointerY = (event.clientY - box.top) / box.height * 2 - 1
}

onMounted(async () => {
  pattern.value = patterns[Math.floor(Math.random() * patterns.length)]
  color.value = lightPalette[Math.floor(Math.random() * lightPalette.length)]
  driftDirection.value = driftDirections[Math.floor(Math.random() * driftDirections.length)]
  if (pattern.value !== 'particles') return
  await nextTick()
  media = matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', updateRunning)
  resizeObserver = new ResizeObserver(resizeCanvas)
  if (root.value) resizeObserver.observe(root.value)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    resizeCanvas()
    updateRunning()
  }, { threshold: .01 })
  if (root.value) visibilityObserver.observe(root.value)
  document.addEventListener('visibilitychange', updateRunning)
  window.addEventListener('pointermove', handlePointer, { passive: true })
  window.addEventListener('resize', resizeCanvas)
  window.requestAnimationFrame(() => {
    resizeCanvas()
    updateRunning()
  })
})

onUpdated(() => {
  if (pattern.value !== 'particles') return
  resizeCanvas()
  updateRunning()
})

onBeforeUnmount(() => {
  running = false
  if (animationFrame) cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  visibilityObserver?.disconnect()
  media?.removeEventListener('change', updateRunning)
  document.removeEventListener('visibilitychange', updateRunning)
  window.removeEventListener('pointermove', handlePointer)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div
    class="uwu-pattern-wallpaper"
    :class="`uwu-pattern-wallpaper--${pattern}`"
    :style="styleVars"
    aria-hidden="true"
  >
    <canvas v-if="pattern === 'particles'" ref="canvas" />
  </div>
</template>

<style>
.uwu-pattern-wallpaper {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  opacity: .26;
  --uwu-pattern-rgb: var(--uwu-pattern-light-rgb);
  overflow: hidden;
  transition: opacity 180ms ease;
}

.uwu-pattern-wallpaper::before {
  position: absolute;
  inset: -12%;
  content: '';
  background-repeat: repeat;
  will-change: transform;
}

.uwu-pattern-wallpaper--checker::before {
  background-image:
    linear-gradient(45deg, rgb(var(--uwu-pattern-rgb) / .34) 25%, transparent 25%, transparent 75%, rgb(var(--uwu-pattern-rgb) / .34) 75%),
    linear-gradient(45deg, rgb(var(--uwu-pattern-rgb) / .34) 25%, transparent 25%, transparent 75%, rgb(var(--uwu-pattern-rgb) / .34) 75%);
  background-position: 0 0, 52px 52px;
  background-size: 104px 104px;
  animation: uwu-checker-drift 16s linear infinite;
}

.uwu-pattern-wallpaper--stripes::before {
  background-image: repeating-linear-gradient(
    135deg,
    rgb(var(--uwu-pattern-rgb) / .38) 0,
    rgb(var(--uwu-pattern-rgb) / .38) 32px,
    transparent 32px,
    transparent 64px
  );
  animation: uwu-stripes-drift 18s linear infinite;
}

.uwu-pattern-wallpaper--particles::before {
  display: none;
}

.uwu-pattern-wallpaper--particles canvas {
  position: absolute;
  inset: -5%;
  display: block;
  width: 110%;
  height: 110%;
  will-change: contents;
}

.uwu-pattern-wallpaper--particles {
  opacity: .34;
}

@keyframes uwu-checker-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--uwu-pattern-checker-x), var(--uwu-pattern-checker-y), 0); }
}

@keyframes uwu-stripes-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--uwu-pattern-stripes-x), var(--uwu-pattern-stripes-y), 0); }
}

.dark .uwu-pattern-wallpaper {
  --uwu-pattern-rgb: 235 239 244;
  opacity: .16;
}

.dark .uwu-pattern-wallpaper--particles {
  opacity: .2;
}

@media (prefers-reduced-motion: reduce) {
  .uwu-pattern-wallpaper { transition: none; }
  .uwu-pattern-wallpaper::before { animation: none; }
}
</style>
