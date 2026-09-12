import { defineConfig, type DefaultTheme } from 'vitepress'
import {
  upstreamDocsSidebars,
  upstreamManifestBranches
} from './generated-upstream-docs'

const githubUrl = 'https://github.com/UwUniverse'

function normalizeBase(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

const base = normalizeBase(process.env.VITEPRESS_BASE)

const docsSidebar = upstreamDocsSidebars

const soongOnlySidebarText = {
  en: {
    section: 'Soong-only',
    overview: 'Overview',
    buildFlow: 'Soong-only build flow',
    imageGeneration: 'Soong-only image generation',
    kernelConfiguration: 'uwu_kernel configuration reference',
    kernelIndex: 'uwu_kernel build system',
    kernelMigration: 'Migrating from Make kernel builds to uwu_kernel',
    kernelOutputs: 'uwu_kernel outputs and dependencies',
    kernelTroubleshooting: 'uwu_kernel troubleshooting',
    validation: 'Soong-only build validation'
  },
  'zh-tw': {
    section: 'Soong-only',
    overview: '概覽',
    buildFlow: 'Soong-only 建置流程',
    imageGeneration: 'Soong-only 映像檔生成',
    kernelConfiguration: 'uwu_kernel 設定參考',
    kernelIndex: 'uwu_kernel 建置系統',
    kernelMigration: '從 Make 核心建置遷移至 uwu_kernel',
    kernelOutputs: 'uwu_kernel 輸出與相依性',
    kernelTroubleshooting: 'uwu_kernel 疑難排解',
    validation: 'Soong-only 建置驗證'
  }
} as const

function localizeDocsSidebar(locale: 'en' | 'zh-tw') {
  const text = soongOnlySidebarText[locale]
  const prefix = `/${locale}`

  function visit(items: typeof docsSidebar): typeof docsSidebar {
    return items.map((item) => {
      const isSoongOnly = item.link?.startsWith('/docs/soong-only')
      const localizedLink = isSoongOnly ? `${prefix}${item.link}` : item.link

      if (!isSoongOnly && !item.items) return item

      const soongText = item.link === '/docs/soong-only'
        ? text.section
        : item.link === '/docs/soong-only/' && item.items
          ? text.section
          : item.link === '/docs/soong-only/'
          ? text.overview
          : item.link?.endsWith('/build-flow')
            ? text.buildFlow
            : item.link?.endsWith('/image-generation')
              ? text.imageGeneration
              : item.link?.endsWith('/uwu_kernel/configuration')
                ? text.kernelConfiguration
                : item.link?.endsWith('/uwu_kernel/index')
                  ? text.kernelIndex
                  : item.link?.endsWith('/uwu_kernel/migration')
                    ? text.kernelMigration
                    : item.link?.endsWith('/uwu_kernel/outputs')
                      ? text.kernelOutputs
                      : item.link?.endsWith('/uwu_kernel/troubleshooting')
                        ? text.kernelTroubleshooting
                        : item.link?.endsWith('/validation')
                          ? text.validation
                          : item.text

      return {
        ...item,
        text: isSoongOnly ? soongText : item.text,
        link: localizedLink,
        items: item.items ? visit(item.items as typeof docsSidebar) : item.items
      }
    })
  }

  return visit(docsSidebar)
}

const traditionalDocsSidebar = localizeDocsSidebar('zh-tw')
const englishDocsSidebar = localizeDocsSidebar('en')

const manifestItems = upstreamManifestBranches.map(({ text, file }) => ({
  text,
  link: `/guide/platform-manifests/${file}`
}))

const traditionalManifestItems = upstreamManifestBranches.map(({ text, file }) => ({
  text,
  link: `/zh-tw/guide/platform-manifests/${file}`
}))

const manifestSidebar = {
  text: 'platform_manifests',
  collapsed: false,
  items: manifestItems
}

const traditionalManifestSidebar = {
  text: 'platform_manifests',
  collapsed: false,
  items: traditionalManifestItems
}

const issueSidebar = {
  text: 'Issue',
  collapsed: false,
  items: [
    { text: 'WebSite-issue', link: '/issues/website/' },
    { text: 'Github issue', link: '/issues/github/' }
  ]
}

const traditionalIssueSidebar = {
  text: '議題',
  collapsed: false,
  items: [
    { text: 'WebSite-issue', link: '/zh-tw/issues/website/' },
    { text: 'Github issue', link: '/zh-tw/issues/github/' }
  ]
}

const englishIssueSidebar = {
  text: 'Issue',
  collapsed: false,
  items: [
    { text: 'WebSite-issue', link: '/en/issues/website/' },
    { text: 'Github issue', link: '/en/issues/github/' }
  ]
}

const baseTheme: DefaultTheme.Config = {
  siteTitle: 'uwuAOSP',
  socialLinks: [{ icon: 'github', link: githubUrl }],
  footer: {
    message: '<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noreferrer">GPL-3.0 Licensed</a>',
    copyright: 'Copyright © 2026 UwUniverse'
  },
  i18nRouting: true,
  sidebar: {
    '/guide/': [
      {
        text: '开始使用',
        items: [{ text: '快速开始', link: '/guide/' }]
      },
      manifestSidebar
    ],
    '/issues/': [issueSidebar]
  }
}

const simplifiedChineseTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: '关于项目', link: '/about/' },
    { text: '文档', link: '/docs/' },
    { text: '快速开始', link: '/guide/' },
    { text: '功能演示', link: '/demo/' },
    { text: '用户交流', link: '/community/' },
    { text: 'Issue', link: '/issues/website/' }
  ],
  langMenuLabel: '切换语言',
  darkModeSwitchLabel: '外观',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',
  sidebar: {
    '/guide/': [
      {
        text: '开始使用',
        items: [{ text: '快速开始', link: '/guide/' }]
      },
      manifestSidebar
    ],
    '/docs/': docsSidebar,
    '/docs/main/': docsSidebar,
    '/docs/moment/': docsSidebar,
    '/docs/uwuBackGroundManager/': docsSidebar,
    '/issues/': [issueSidebar]
  }
}

const traditionalChineseTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: '關於專案', link: '/zh-tw/about/' },
    { text: '文件', link: '/zh-tw/docs/' },
    { text: '快速開始', link: '/zh-tw/guide/' },
    { text: '功能展示', link: '/zh-tw/demo/' },
    { text: '使用者交流', link: '/zh-tw/community/' },
    { text: '議題', link: '/zh-tw/issues/website/' }
  ],
  langMenuLabel: '切換語言',
  darkModeSwitchLabel: '外觀',
  lightModeSwitchTitle: '切換到淺色模式',
  darkModeSwitchTitle: '切換到深色模式',
  sidebarMenuLabel: '選單',
  returnToTopLabel: '回到頂部',
  outlineTitle: '本頁目錄',
  sidebar: {
    '/zh-tw/guide/': [
      {
        text: '開始使用',
        items: [{ text: '快速開始', link: '/zh-tw/guide/' }]
      },
      traditionalManifestSidebar
    ],
    '/zh-tw/docs/': traditionalDocsSidebar,
    '/docs/main/': docsSidebar,
    '/docs/moment/': docsSidebar,
    '/docs/uwuBackGroundManager/': docsSidebar,
    '/zh-tw/issues/': [traditionalIssueSidebar]
  }
}

const englishTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: 'About', link: '/en/about/' },
    { text: 'Docs', link: '/en/docs/' },
    { text: 'Quick start', link: '/en/guide/' },
    { text: 'Feature demo', link: '/en/demo/' },
    { text: 'Community', link: '/en/community/' },
    { text: 'Issue', link: '/en/issues/website/' }
  ],
  langMenuLabel: 'Change language',
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light theme',
  darkModeSwitchTitle: 'Switch to dark theme',
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Return to top',
  sidebar: {
    '/en/guide/': [
      {
        text: 'Get started',
        items: [{ text: 'Quick start', link: '/en/guide/' }]
      },
      manifestSidebar
    ],
    '/en/docs/': englishDocsSidebar,
    '/docs/main/': docsSidebar,
    '/docs/moment/': docsSidebar,
    '/docs/uwuBackGroundManager/': docsSidebar,
    '/en/issues/': [englishIssueSidebar]
  }
}

export default defineConfig({
  base,
  title: 'uwuAOSP',
  description: 'uwuAOSP',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${base}turtle-cheese-wedge.png` }]
  ],
  themeConfig: simplifiedChineseTheme,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: simplifiedChineseTheme
    },
    'zh-tw': {
      label: '繁體中文',
      lang: 'zh-TW',
      themeConfig: traditionalChineseTheme
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: englishTheme
    }
  }
})
