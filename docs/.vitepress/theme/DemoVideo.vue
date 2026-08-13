<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  caption: string
  label: string
  src: string
}>()

const videoSource = withBase(props.src)
const videoElement = ref<HTMLVideoElement | null>(null)
const isInView = ref(false)
const instanceId = `uwu-demo-video-${Math.random().toString(36).slice(2)}`
let observer: IntersectionObserver | undefined

const playVideo = async () => {
  const video = videoElement.value

  if (!video) return

  window.dispatchEvent(
    new CustomEvent('uwu-demo-video-play', { detail: instanceId })
  )

  try {
    await video.play()
  } catch {
    // Browsers can still reject playback when the page is backgrounded.
  }
}

const pauseOutsideViewport = () => {
  if (!isInView.value) videoElement.value?.pause()
}

const handleOtherVideoPlay = (event: Event) => {
  const customEvent = event as CustomEvent<string>

  if (customEvent.detail !== instanceId) videoElement.value?.pause()
}

onMounted(() => {
  const video = videoElement.value

  if (!video) return

  observer = new IntersectionObserver(
    ([entry]) => {
      isInView.value = entry.isIntersecting && entry.intersectionRatio >= 0.5

      if (isInView.value) {
        void playVideo()
      } else {
        video.pause()
      }
    },
    { threshold: [0, 0.5, 1] }
  )

  observer.observe(video)
  window.addEventListener('uwu-demo-video-play', handleOtherVideoPlay)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('uwu-demo-video-play', handleOtherVideoPlay)
})
</script>

<template>
  <figure class="uwu-demo-video-card">
    <video
      ref="videoElement"
      class="uwu-demo-video"
      loop
      muted
      playsinline
      preload="metadata"
      :aria-label="props.label"
      @mouseenter="playVideo"
      @mouseleave="pauseOutsideViewport"
    >
      <source :src="videoSource" type="video/mp4" />
    </video>
    <figcaption>{{ props.caption }}</figcaption>
  </figure>
</template>
