<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  locale: 'zh-CN' | 'zh-TW' | 'en-US'
  mode: 'index' | 'article'
}>()

const copy = {
  'zh-CN': {
    indexTitle: '目录',
    date: '2026-09',
    action: '阅读更新',
    back: '返回更新日志',
    scroll: '向下阅读',
    sections: [
      ['隐私与安全', 'privacy-and-control'],
      ['更多个性化', 'daily-use'],
      ['构建优化', 'for-maintainers'],
      ['感谢与参与', 'thanks-and-contributing']
    ]
  },
  'zh-TW': {
    indexTitle: '目錄',
    date: '2026-09',
    action: '閱讀更新',
    back: '返回更新日誌',
    scroll: '向下閱讀',
    sections: [
      ['隱私與安全', 'privacy-and-control'],
      ['更多個人化', 'daily-use'],
      ['建置優化', 'for-maintainers'],
      ['感謝與參與', 'thanks-and-contributing']
    ]
  },
  'en-US': {
    indexTitle: 'Contents',
    date: '2026-09',
    action: 'Read the update',
    back: 'Back to the blog',
    scroll: 'Scroll to read',
    sections: [
      ['Privacy & security', 'privacy-and-control'],
      ['More personalization', 'daily-use'],
      ['Build optimization', 'for-maintainers'],
      ['Contributors', 'thanks-and-contributing']
    ]
  }
} as const

const text = copy[props.locale]
const referenceEntry = '[1]———————————————隐私与安全'
const referenceDashes = referenceEntry.match(/—+/)?.[0].length ?? 15
const sectionLeaders = ref(text.sections.map(() => '—'.repeat(referenceDashes)))
const sectionLeaderStyles = ref(text.sections.map(() => ({ letterSpacing: '0px' })))
const tocEntryWidth = ref('')
const tocElement = ref<HTMLElement | null>(null)
let tocResizeObserver: ResizeObserver | undefined
let tocResizeFrame = 0

const createTextMeasurer = (source: HTMLElement) => {
  const computed = window.getComputedStyle(source)
  const probe = document.createElement('span')
  probe.style.position = 'fixed'
  probe.style.left = '-10000px'
  probe.style.top = '0'
  probe.style.display = 'inline-block'
  probe.style.width = 'max-content'
  probe.style.visibility = 'hidden'
  probe.style.whiteSpace = 'pre'
  probe.style.fontFamily = computed.fontFamily
  probe.style.fontSize = computed.fontSize
  probe.style.fontWeight = computed.fontWeight
  probe.style.fontStyle = computed.fontStyle
  probe.style.fontStretch = computed.fontStretch
  probe.style.fontKerning = computed.fontKerning
  probe.style.fontFeatureSettings = computed.fontFeatureSettings
  probe.style.fontVariantNumeric = computed.fontVariantNumeric
  probe.style.textTransform = computed.textTransform
  const baseLetterSpacing = computed.letterSpacing === 'normal' ? 0 : Number.parseFloat(computed.letterSpacing) || 0
  document.body.append(probe)

  return {
    baseLetterSpacing,
    measure(value: string, extraSpacing = 0) {
      probe.style.letterSpacing = `${baseLetterSpacing + extraSpacing}px`
      probe.textContent = value
      return probe.getBoundingClientRect().width
    },
    dispose() {
      probe.remove()
    }
  }
}

const updateTocLeaders = () => {
  const toc = tocElement.value
  if (!toc) return

  const entries = Array.from(toc.querySelectorAll<HTMLElement>(':scope > a'))
  const firstNumber = entries[0]?.querySelector<HTMLElement>('.uwu-release-toc__number')
  const firstLeader = entries[0]?.querySelector<HTMLElement>('.uwu-release-toc__leader')
  const firstLabel = entries[0]?.querySelector<HTMLElement>('.uwu-release-toc__label')
  if (!firstNumber || !firstLeader || !firstLabel) return

  entries.forEach((entry) => {
    const leader = entry.querySelector<HTMLElement>('.uwu-release-toc__leader')
    if (leader) leader.style.letterSpacing = ''
  })

  const numberMeasure = createTextMeasurer(firstNumber)
  const leaderMeasure = createTextMeasurer(firstLeader)
  const labelMeasure = createTextMeasurer(firstLabel)
  const targetWidth = numberMeasure.measure('[1]')
    + leaderMeasure.measure('—'.repeat(referenceDashes))
    + labelMeasure.measure('隐私与安全')

  tocEntryWidth.value = `${targetWidth}px`
  const nextLeaderStyles = entries.map(() => ({ letterSpacing: '0px' }))
  const nextLeaders = entries.map((entry, index) => {
    const number = entry.querySelector<HTMLElement>('.uwu-release-toc__number')
    const label = entry.querySelector<HTMLElement>('.uwu-release-toc__label')
    const leader = entry.querySelector<HTMLElement>('.uwu-release-toc__leader')
    if (!number || !label || !leader) return ''

    const available = Math.max(0, targetWidth - numberMeasure.measure(number.textContent ?? '') - labelMeasure.measure(label.textContent ?? ''))
    let count = 0
    while (count < 64 && leaderMeasure.measure('—'.repeat(count + 1)) <= available) count += 1
    const dashes = '—'.repeat(count)
    const naturalWidth = leaderMeasure.measure(dashes)
    let extraSpacing = 0

    if (count > 1 && naturalWidth < available) {
      let low = 0
      let high = (available - naturalWidth) * 2 + 1
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const middle = (low + high) / 2
        if (leaderMeasure.measure(dashes, middle) <= available) low = middle
        else high = middle
      }
      extraSpacing = low
    }

    nextLeaderStyles[index] = {
      letterSpacing: `${leaderMeasure.baseLetterSpacing + extraSpacing}px`
    }
    return dashes
  })
  sectionLeaders.value = nextLeaders
  sectionLeaderStyles.value = nextLeaderStyles

  numberMeasure.dispose()
  leaderMeasure.dispose()
  labelMeasure.dispose()
}

const scheduleTocUpdate = () => {
  if (tocResizeFrame) cancelAnimationFrame(tocResizeFrame)
  tocResizeFrame = requestAnimationFrame(updateTocLeaders)
}

onMounted(async () => {
  await nextTick()
  await document.fonts.ready
  updateTocLeaders()
  if (tocElement.value && 'ResizeObserver' in window) {
    tocResizeObserver = new ResizeObserver(scheduleTocUpdate)
    tocResizeObserver.observe(tocElement.value)
  }
  window.addEventListener('resize', scheduleTocUpdate)
  document.fonts.addEventListener('loadingdone', scheduleTocUpdate)
})

onBeforeUnmount(() => {
  tocResizeObserver?.disconnect()
  window.removeEventListener('resize', scheduleTocUpdate)
  document.fonts.removeEventListener('loadingdone', scheduleTocUpdate)
  if (tocResizeFrame) cancelAnimationFrame(tocResizeFrame)
})

const prefix = props.locale === 'zh-CN' ? '' : props.locale === 'zh-TW' ? '/zh-tw' : '/en'
const indexHref = withBase(`${prefix}/blog/`)
const articleHref = withBase(`${prefix}/blog/uwu-17.0.100/`)
const imageSrc = withBase('/images/uwu-17.0.100-hero.png')
</script>

<template>
  <div :class="['uwu-release-page', `uwu-release-page--${locale}`, { 'uwu-release-page--index': mode === 'index' }]">
    <header class="uwu-release-hero">
      <img class="uwu-release-hero__art" :src="imageSrc" alt="" />
      <div class="uwu-release-hero__inner">
        <a v-if="mode === 'article'" class="uwu-release-hero__back" :href="indexHref">← {{ text.back }}</a>
        <p class="uwu-release-hero__date">{{ text.date }}</p>
        <h1><span>uwuAOSP</span><span>17.0.100</span></h1>
        <nav ref="tocElement" class="uwu-release-toc" :aria-label="text.indexTitle">
          <a v-for="([label, id], index) in text.sections" :key="id" :href="mode === 'index' ? `${articleHref}#${id}` : `#${id}`" :style="tocEntryWidth ? { width: tocEntryWidth } : undefined">
            <span class="uwu-release-toc__number">[{{ index + 1 }}]</span>
            <span class="uwu-release-toc__leader" :style="sectionLeaderStyles[index]" aria-hidden="true">{{ sectionLeaders[index] }}</span>
            <span class="uwu-release-toc__label">{{ label }}</span>
          </a>
        </nav>
      </div>
      <a v-if="mode === 'index'" class="uwu-release-hero__more" :href="articleHref">{{ text.action }} <span aria-hidden="true">↗</span></a>
      <span v-else class="uwu-release-hero__more">{{ text.scroll }} <span aria-hidden="true">↓</span></span>
    </header>
  </div>
</template>
