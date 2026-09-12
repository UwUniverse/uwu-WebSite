<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const route = useRoute()
let observer: IntersectionObserver | undefined
let media: MediaQueryList | undefined
let mounted = false
let scrollFrame: number | undefined
let titleMeasureFrame: number | undefined
let titleOverlay: HTMLElement | undefined

async function observeSections() {
  observer?.disconnect()
  await nextTick()
  if (!mounted) return
  document.querySelectorAll('.uwu-reveal').forEach(el => {
    el.classList.remove('uwu-reveal', 'is-visible')
  })
  if (media?.matches) return
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.05 })
  document.querySelectorAll('[data-uwu-reveal], .vp-doc > div > h2, .vp-doc > div > h3').forEach(el => {
    // Above-the-fold content stays immediately readable, including anchor landings.
    if (el.getBoundingClientRect().top < window.innerHeight) return
    el.classList.add('uwu-reveal')
    observer?.observe(el)
  })
}

function updateScrollProgress() {
  scrollFrame = undefined
  const root = document.documentElement
  const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight)
  const scrollTop = window.scrollY || root.scrollTop
  const progress = maxScroll === 0 ? 0 : Math.min(1, Math.max(0, scrollTop / maxScroll))
  root.style.setProperty('--uwu-scroll-progress', progress.toFixed(4))
}

function scheduleScrollProgress() {
  if (scrollFrame === undefined) scrollFrame = window.requestAnimationFrame(updateScrollProgress)
}

function mountTitleOverlay() {
  const title = document.querySelector<HTMLElement>('.VPNavBarTitle > .title')
  if (!title) return
  const findSource = () => Array.from(title.children).find(el =>
    el instanceof HTMLElement && el.tagName === 'SPAN' && !el.classList.contains('uwu-nav-title-inverse'),
  ) as HTMLElement | undefined
  const source = findSource()
  const titleText = source?.textContent?.trim() || title.textContent?.replace(/uwuAOSP$/, '').trim() || 'uwuAOSP'
  if (titleOverlay?.parentElement !== title) {
    titleOverlay?.remove()
    titleOverlay = document.createElement('span')
    titleOverlay.className = 'uwu-nav-title-inverse'
    titleOverlay.setAttribute('aria-hidden', 'true')
    titleOverlay.textContent = titleText
    title.append(titleOverlay)
  }
  const measure = () => {
    const rect = findSource()?.getBoundingClientRect() || title.getBoundingClientRect()
    title.style.setProperty('--uwu-title-width', `${Math.ceil(rect.width)}px`)
    title.style.setProperty('--uwu-title-height', `${Math.ceil(rect.height)}px`)
  }
  measure()
  if (titleMeasureFrame !== undefined) window.cancelAnimationFrame(titleMeasureFrame)
  titleMeasureFrame = window.requestAnimationFrame(() => {
    titleMeasureFrame = undefined
    measure()
  })
  document.fonts?.ready.then(() => {
    if (mounted && title.isConnected) measure()
  })
}

function handleResize() {
  mountTitleOverlay()
  scheduleScrollProgress()
}

watch(() => route.path, observeSections, { flush: 'post' })
watch(() => route.path, () => nextTick(() => {
  mountTitleOverlay()
  scheduleScrollProgress()
}), { flush: 'post' })
onMounted(() => {
  mounted = true
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', observeSections)
  window.addEventListener('scroll', scheduleScrollProgress, { passive: true })
  window.addEventListener('resize', handleResize)
  observeSections()
  mountTitleOverlay()
  scheduleScrollProgress()
})
onBeforeUnmount(() => {
  mounted = false
  observer?.disconnect()
  media?.removeEventListener('change', observeSections)
  window.removeEventListener('scroll', scheduleScrollProgress)
  window.removeEventListener('resize', handleResize)
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame)
  if (titleMeasureFrame !== undefined) window.cancelAnimationFrame(titleMeasureFrame)
  titleOverlay?.remove()
  document.documentElement.style.removeProperty('--uwu-scroll-progress')
})
</script>

<template><DefaultTheme.Layout /></template>
