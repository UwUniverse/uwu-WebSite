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
      ['剪贴板权限', 'privacy-and-control'],
      ['桌面与外观', 'daily-use'],
      ['构建与维护', 'for-maintainers'],
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
      ['剪貼簿權限', 'privacy-and-control'],
      ['桌面與外觀', 'daily-use'],
      ['建置與維護', 'for-maintainers'],
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
      ['Clipboard access', 'privacy-and-control'],
      ['Desktop and appearance', 'daily-use'],
      ['Builds and maintenance', 'for-maintainers'],
      ['Thanks and contributions', 'thanks-and-contributing']
    ]
  }
} as const

const text = copy[props.locale]
const prefix = props.locale === 'zh-CN' ? '' : props.locale === 'zh-TW' ? '/zh-tw' : '/en'
const indexHref = withBase(`${prefix}/about/`)
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
            <span class="uwu-release-toc__leader" aria-hidden="true">—————————————————</span>
            <span class="uwu-release-toc__label">{{ label }}</span>
          </a>
        </nav>
      </div>
      <a v-if="mode === 'index'" class="uwu-release-hero__more" :href="articleHref">{{ text.action }} <span aria-hidden="true">↗</span></a>
      <span v-else class="uwu-release-hero__more">{{ text.scroll }} <span aria-hidden="true">↓</span></span>
    </header>
  </div>
</template>
