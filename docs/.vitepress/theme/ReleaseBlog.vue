<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{
  locale: 'zh-CN' | 'zh-TW' | 'en-US'
  mode: 'index' | 'article'
}>()

const copy = {
  'zh-CN': {
    eyebrow: 'uwuAOSP · 更新日志',
    indexTitle: '项目进展',
    indexIntro: '关于新版本、系统体验和构建工具的更新。',
    title: 'uwuAOSP 17.0.100',
    summary: '更自由的桌面与外观设置，细致的应用控制，以及让设备维护者少等一会的构建工具。',
    date: '2026 年 9 月 25 日',
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
    eyebrow: 'uwuAOSP · 更新日誌',
    indexTitle: '專案進展',
    indexIntro: '關於新版本、系統體驗與建置工具的更新。',
    title: 'uwuAOSP 17.0.100',
    summary: '更自由的桌面與外觀設定、更細緻的應用程式控制，以及讓裝置維護者少等一會兒的建置工具。',
    date: '2026 年 9 月 25 日',
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
    eyebrow: 'uwuAOSP · Blog',
    indexTitle: 'What’s new',
    indexIntro: 'Updates on releases, the everyday experience, and the tools behind uwuAOSP.',
    title: 'uwuAOSP 17.0.100',
    summary: 'A more flexible home screen, more control over apps, and build tools that help device maintainers spend less time waiting.',
    date: 'September 25, 2026',
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
        <p class="uwu-release-hero__summary">{{ text.summary }}</p>
        <nav class="uwu-release-toc" :aria-label="text.indexTitle">
          <a v-for="([label, id], index) in text.sections" :key="id" :href="mode === 'index' ? `${articleHref}#${id}` : `#${id}`">
            <span class="uwu-release-toc__number">[{{ index + 1 }}]</span>
            <span class="uwu-release-toc__label">{{ label }}</span>
          </a>
        </nav>
      </div>
      <a v-if="mode === 'index'" class="uwu-release-hero__more" :href="articleHref">{{ text.action }} <span aria-hidden="true">↗</span></a>
      <span v-else class="uwu-release-hero__more">{{ text.scroll }} <span aria-hidden="true">↓</span></span>
    </header>
    <section v-if="mode === 'index'" class="uwu-blog-index__content">
      <p class="uwu-blog-eyebrow">{{ text.eyebrow }}</p>
      <h2>{{ text.indexTitle }}</h2>
      <p>{{ text.indexIntro }}</p>
      <a :href="articleHref">{{ text.title }} <span aria-hidden="true">↗</span></a>
    </section>
  </div>
</template>
