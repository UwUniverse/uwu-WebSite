<script setup lang="ts">
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
const tocLineBudget = 17 + Array.from('剪贴板权限').length
const sectionLeader = (label: string) => '—'.repeat(Math.max(0, tocLineBudget - Array.from(label).length))
const prefix = props.locale === 'zh-CN' ? '' : props.locale === 'zh-TW' ? '/zh-tw' : '/en'
const indexHref = withBase(`${prefix}/blog/`)
const articleHref = withBase(`${prefix}/blog/uwu-17.0.100/`)
const imageSrc = withBase('/images/uwu-17.0.100-hero.png')
</script>

<template>
  <div :class="['uwu-release-page', { 'uwu-release-page--index': mode === 'index' }]">
    <header class="uwu-release-hero">
      <img class="uwu-release-hero__art" :src="imageSrc" alt="" />
      <div class="uwu-release-hero__inner">
        <a v-if="mode === 'article'" class="uwu-release-hero__back" :href="indexHref">← {{ text.back }}</a>
        <p class="uwu-release-hero__date">{{ text.date }}</p>
        <h1><span>uwuAOSP</span><span>17.0.100</span></h1>
        <nav class="uwu-release-toc" :aria-label="text.indexTitle">
          <a v-for="([label, id], index) in text.sections" :key="id" :href="mode === 'index' ? `${articleHref}#${id}` : `#${id}`">
            <span class="uwu-release-toc__number">[{{ index + 1 }}]</span>
            <span class="uwu-release-toc__leader" aria-hidden="true">{{ sectionLeader(label) }}</span>
            <span class="uwu-release-toc__label">{{ label }}</span>
          </a>
        </nav>
      </div>
      <a v-if="mode === 'index'" class="uwu-release-hero__more" :href="articleHref">{{ text.action }} <span aria-hidden="true">↗</span></a>
      <span v-else class="uwu-release-hero__more">{{ text.scroll }} <span aria-hidden="true">↓</span></span>
    </header>
  </div>
</template>
