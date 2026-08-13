import { defineConfig, type DefaultTheme } from 'vitepress'
import { upstreamDocsSidebars } from './generated-upstream-docs'

const githubUrl = 'https://github.com/uwuAOSP'

const docsSidebar = upstreamDocsSidebars

const manifestSidebar = {
  text: 'platform_manifests',
  collapsed: false,
  items: [
    { text: 'ciallo', link: '/guide/platform-manifests/ciallo' },
    { text: 'uwu-16.2', link: '/guide/platform-manifests/uwu-16.2' },
    { text: 'uwu-17.0', link: '/guide/platform-manifests/uwu-17.0' },
    { text: 'uwu-17.0-wip', link: '/guide/platform-manifests/uwu-17.0-wip' },
    { text: 'wip/uwu-16.2-tesseract-ocr-deps', link: '/guide/platform-manifests/tesseract-ocr-deps' }
  ]
}

const traditionalManifestSidebar = {
  text: 'platform_manifests',
  collapsed: false,
  items: [
    { text: 'ciallo', link: '/zh-tw/guide/platform-manifests/ciallo' },
    { text: 'uwu-16.2', link: '/zh-tw/guide/platform-manifests/uwu-16.2' },
    { text: 'uwu-17.0', link: '/zh-tw/guide/platform-manifests/uwu-17.0' },
    { text: 'uwu-17.0-wip', link: '/zh-tw/guide/platform-manifests/uwu-17.0-wip' },
    { text: 'wip/uwu-16.2-tesseract-ocr-deps', link: '/zh-tw/guide/platform-manifests/tesseract-ocr-deps' }
  ]
}

const baseTheme: DefaultTheme.Config = {
  siteTitle: 'uwuAOSP',
  socialLinks: [{ icon: 'github', link: githubUrl }],
  i18nRouting: true,
  sidebar: {
    '/guide/': [
      {
        text: '开始使用',
        items: [{ text: '快速开始', link: '/guide/' }]
      },
      manifestSidebar
    ]
  }
}

const simplifiedChineseTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: '关于项目', link: '/about/' },
    { text: '文档', link: '/docs/' },
    { text: '用户交流', link: '/community/' },
    { text: '宜修', link: '/issues/' }
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
    '/docs/uwuBackGroundManager/': docsSidebar
  }
}

const traditionalChineseTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: '關於專案', link: '/zh-tw/about/' },
    { text: '文件', link: '/zh-tw/docs/' },
    { text: '使用者交流', link: '/zh-tw/community/' },
    { text: '宜修', link: '/zh-tw/issues/' }
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
    '/docs/uwuBackGroundManager/': docsSidebar
  }
}

const englishTheme: DefaultTheme.Config = {
  ...baseTheme,
  nav: [
    { text: 'About', link: '/en/about/' },
    { text: 'Docs', link: '/en/docs/' },
    { text: 'Community', link: '/en/community/' },
    { text: '宜修', link: '/en/issues/' }
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
    '/docs/uwuBackGroundManager/': docsSidebar
  }
}

export default defineConfig({
  title: 'uwuAOSP',
  description: '开盖即食的 AOSP',
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
