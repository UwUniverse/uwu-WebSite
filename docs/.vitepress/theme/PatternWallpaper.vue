<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

type PaletteColor = { hex: string; rgb: string }
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

// Sampled from the pale blue panel in bamberga.png.
const lightPalette: PaletteColor[] = [
  { hex: '#6F9FE5', rgb: '111 159 229' },
  { hex: '#5D8FD1', rgb: '93 143 209' },
  { hex: '#8E93EC', rgb: '142 147 236' },
  { hex: '#7D8FDB', rgb: '125 143 219' },
  { hex: '#A5BEFF', rgb: '165 190 255' },
  { hex: '#6D7BCC', rgb: '109 123 204' }
]

const color = ref<PaletteColor>(lightPalette[0])
const root = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()

const particles: Particle[] = []
const particleCount = 42
const gridColumns = 7
const gridRows = particleCount / gridColumns
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
let spawnIndex = 0

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function gridCoordinate(index: number, count: number) {
  return (index + .5 + randomBetween(-.22, .22)) / count
}

function resetParticle(particle: Particle, index: number, fromEdge: boolean) {
  const slot = index % particleCount
  const column = slot % gridColumns
  const row = Math.floor(slot / gridColumns)
  particle.x = fromEdge ? randomBetween(-.14, -.05) : gridCoordinate(column, gridColumns)
  particle.y = gridCoordinate(row, gridRows)
  // Keep depth random when recycling. A fixed depth here made every later
  // particle smaller because the projected size is size / z.
  particle.z = randomBetween(.72, 1.65)
  particle.size = randomBetween(24, 54)
  particle.rotation = randomBetween(-Math.PI, Math.PI)
  particle.spin = randomBetween(-.0007, .0007)
  particle.speed = randomBetween(.00013, .00025)
  particle.phase = randomBetween(0, Math.PI * 2)
  particle.sway = randomBetween(.05, .11)
}

function createParticle(index: number): Particle {
  const particle = {
    x: 0,
    y: 0,
    z: 1,
    size: 0,
    rotation: 0,
    spin: 0,
    speed: 0,
    phase: 0,
    sway: 0
  }
  resetParticle(particle, index, false)
  return particle
}

function recycleParticle(particle: Particle) {
  resetParticle(particle, spawnIndex++, true)
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
    for (let i = 0; i < particleCount; i++) particles.push(createParticle(i))
    spawnIndex = particles.length
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
  const shouldRun = visible
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
  if (event.pointerType === 'touch') return
  const rootElement = root.value || document.querySelector<HTMLElement>('.uwu-pattern-wallpaper')
  const box = rootElement?.getBoundingClientRect()
  if (!box || !box.width || !box.height) return
  pointerX = (event.clientX - box.left) / box.width * 2 - 1
  pointerY = (event.clientY - box.top) / box.height * 2 - 1
}

onMounted(async () => {
  color.value = lightPalette[Math.floor(Math.random() * lightPalette.length)]
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
    aria-hidden="true"
  >
    <canvas ref="canvas" />
  </div>
</template>

<style>
.uwu-pattern-wallpaper {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  opacity: .34;
  overflow: hidden;
  transition: opacity 180ms ease;
}

.uwu-pattern-wallpaper canvas {
  position: absolute;
  inset: -5%;
  display: block;
  width: 110%;
  height: 110%;
  will-change: contents;
}

.dark .uwu-pattern-wallpaper {
  opacity: .16;
}

@media (prefers-reduced-motion: reduce) {
  .uwu-pattern-wallpaper { transition: none; }
}
</style>
