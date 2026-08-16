import { defineConfig, type DefaultTheme } from 'vitepress'
import {
  upstreamDocsSidebars,
  upstreamManifestBranches
} from './generated-upstream-docs'

const githubUrl = 'https://github.com/uwuAOSP'

const docsSidebar = upstreamDocsSidebars

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
    '/zh-tw/docs/': docsSidebar,
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
    '/en/docs/': docsSidebar,
    '/docs/main/': docsSidebar,
    '/docs/moment/': docsSidebar,
    '/docs/uwuBackGroundManager/': docsSidebar,
    '/en/issues/': [englishIssueSidebar]
  }
}

export default defineConfig({
  title: 'uwuAOSP',
  description: '开盖即食的 AOSP',
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/turtle-cheese-wedge.png' }]
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
