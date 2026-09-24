import DefaultTheme from 'vitepress/theme'
import { inBrowser, withBase, type Router } from 'vitepress'
import DemoVideo from './DemoVideo.vue'
import HomeLanding from './HomeLanding.vue'
import EditorialLayout from './EditorialLayout.vue'
import UniBuildCharts from './UniBuildCharts.vue'
import ReleaseBlog from './ReleaseBlog.vue'
import './custom.css'

const localePreferenceKey = 'uwuAOSP-locale-preference'

type SiteLocale = 'root' | 'zh-tw' | 'en'

function localeFromPath(path: string): SiteLocale {
  const normalized = path.replace(/^https?:\/\/[^/]+/i, '')
  if (/(^|\/)zh-tw(?:\/|$)/i.test(normalized)) return 'zh-tw'
  if (/(^|\/)en(?:\/|$)/i.test(normalized)) return 'en'
  return 'root'
}

function stripBase(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  const basePath = base === '/' ? '/' : base.replace(/\/$/, '')
  if (basePath === '/') return path || '/'
  return path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path
}

function detectLocale(): SiteLocale {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  const primaryLanguage = languages[0]?.replace(/_/g, '-').toLowerCase() || ''

  if (
    primaryLanguage.startsWith('zh-hant') ||
    /^(zh)-(tw|hk|mo)(?:-|$)/.test(primaryLanguage)
  ) {
    return 'zh-tw'
  }
  if (primaryLanguage === 'zh' || primaryLanguage.startsWith('zh-')) return 'root'
  return 'en'
}

function setupLocaleRouting(router: Router) {
  if (!inBrowser) return

  const originalBeforeRouteChange = router.onBeforeRouteChange
  router.onBeforeRouteChange = async (to) => {
    const result = await originalBeforeRouteChange?.(to)
    if (result === false) return false

    const fromLocale = localeFromPath(stripBase(window.location.pathname))
    const toLocale = localeFromPath(stripBase(new URL(to, window.location.href).pathname))
    if (fromLocale !== toLocale) {
      localStorage.setItem(localePreferenceKey, toLocale)
    }
    return result
  }

  const originalAfterRouteChange = router.onAfterRouteChange
  router.onAfterRouteChange = async (to) => {
    await originalAfterRouteChange?.(to)

    const currentPath = stripBase(new URL(to, window.location.href).pathname)
    if (localeFromPath(currentPath) !== 'root' || currentPath !== '/') return
    if (localStorage.getItem(localePreferenceKey)) return

    const detectedLocale = detectLocale()
    if (detectedLocale === 'root') return

    localStorage.setItem(localePreferenceKey, detectedLocale)
    window.location.replace(withBase(`/${detectedLocale}/`))
  }
}

export default {
  ...DefaultTheme,
  Layout: EditorialLayout,
  enhanceApp({ app, router }) {
    setupLocaleRouting(router)
    app.component('DemoVideo', DemoVideo)
    app.component('HomeLanding', HomeLanding)
    app.component('UniBuildCharts', UniBuildCharts)
    app.component('ReleaseBlog', ReleaseBlog)
  }
}
