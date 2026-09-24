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
    summary: '更自由的桌面与外观设置，更细致的应用控制，以及让设备维护者少等一会儿的构建工具。',
    date: '2026 年 9 月 24 日',
    action: '阅读更新',
    back: '返回更新日志',
    toc: '本文内容',
    sections: [
      ['日常使用', 'daily-use'],
      ['隐私与控制', 'privacy-and-control'],
      ['给设备维护者', 'for-maintainers'],
      ['感谢与参与', 'thanks-and-contributing']
    ]
  },
  'zh-TW': {
    eyebrow: 'uwuAOSP · 更新日誌',
    indexTitle: '專案進展',
    indexIntro: '關於新版本、系統體驗與建置工具的更新。',
    title: 'uwuAOSP 17.0.100',
    summary: '更自由的桌面與外觀設定、更細緻的應用程式控制，以及讓裝置維護者少等一會兒的建置工具。',
    date: '2026 年 9 月 24 日',
    action: '閱讀更新',
    back: '返回更新日誌',
    toc: '本文內容',
    sections: [
      ['日常使用', 'daily-use'],
      ['隱私與控制', 'privacy-and-control'],
      ['給裝置維護者', 'for-maintainers'],
      ['感謝與參與', 'thanks-and-contributing']
    ]
  },
  'en-US': {
    eyebrow: 'uwuAOSP · Blog',
    indexTitle: 'What’s new',
    indexIntro: 'Updates on releases, the everyday experience, and the tools behind uwuAOSP.',
    title: 'uwuAOSP 17.0.100',
    summary: 'A more flexible home screen, more control over apps, and build tools that help device maintainers spend less time waiting.',
    date: 'September 24, 2026',
    action: 'Read the update',
    back: 'Back to the blog',
    toc: 'In this post',
    sections: [
      ['Everyday experience', 'daily-use'],
      ['Privacy and control', 'privacy-and-control'],
      ['For device maintainers', 'for-maintainers'],
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
  <section v-if="mode === 'index'" class="uwu-blog-index">
    <div class="uwu-blog-index__heading">
      <p class="uwu-blog-eyebrow">{{ text.eyebrow }}</p>
      <h1>{{ text.indexTitle }}</h1>
      <p>{{ text.indexIntro }}</p>
    </div>
    <a class="uwu-blog-card" :href="articleHref">
      <div class="uwu-blog-card__copy">
        <span class="uwu-blog-card__date">{{ text.date }}</span>
        <h2>{{ text.title }}</h2>
        <p>{{ text.summary }}</p>
        <span class="uwu-blog-card__link">{{ text.action }} <span aria-hidden="true">↗</span></span>
      </div>
      <div class="uwu-blog-card__image"><img :src="imageSrc" alt="" /></div>
    </a>
  </section>

  <div v-else class="uwu-release-hero">
    <a class="uwu-release-hero__back" :href="indexHref">← {{ text.back }}</a>
    <p class="uwu-blog-eyebrow">{{ text.eyebrow }} <span aria-hidden="true">/</span> {{ text.date }}</p>
    <h1>{{ text.title }}</h1>
    <p class="uwu-release-hero__summary">{{ text.summary }}</p>
    <figure class="uwu-release-hero__image"><img :src="imageSrc" alt="" /></figure>
    <nav class="uwu-release-toc" :aria-label="text.toc">
      <span>{{ text.toc }}</span>
      <a v-for="[label, id] in text.sections" :key="id" :href="`#${id}`">{{ label }}</a>
    </nav>
  </div>
</template>
