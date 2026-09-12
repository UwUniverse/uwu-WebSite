<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import PatternWallpaper from './PatternWallpaper.vue'

type HomeLocale = 'zh-CN' | 'zh-TW' | 'en'
type TipItem = { text: string, href?: string }
type TipSet = { label: string, items: TipItem[] }

const tipTargets = [
  '/guide/platform-manifests/uwu-16.2.html#building',
  '/docs/AppSensorPolicy/',
  '/guide/platform-manifests/uwu-16.2.html#building',
  '/guide/platform-manifests/uwu-16.2.html#building',
  '/docs/uwuBackGroundManager/',
  undefined,
  '/docs/SmartSuggestions/clipboard-apps.html',
  '/docs/Prism/'
]

function createTipSet(label: string, texts: string[]): TipSet {
  return {
    label,
    items: texts.map((text, index) => ({ text, href: tipTargets[index] }))
  }
}

const props = defineProps<{
  locale: HomeLocale
}>()

const phrases = ['你好', 'Hello', 'こんにちは', 'Bonjour', 'Hola', 'Ciallo', 'Hallo']
const tipsByLocale: Record<HomeLocale, TipSet> = {
  'zh-CN': createTipSet('你知道吗?', [
      'uni 默认调度已经平衡了系统占用和编译耗时',
      '使用传感器控制选项摆脱开屏摇一摇广告',
      'uni 在不传入 -j 参数时会默认使用最适合机器的线程数',
      '如非必要不要向 uni 指定构建线程',
      '后台管理可以帮助你节省设备功耗与保活 App',
      '主屏幕的搜索栏可以更换更多搜索供应',
      '使用智能建议帮助你快速打开复制的链接',
      '启用 Prism 后三指上滑可以进行识屏'
    ]),
  'zh-TW': createTipSet('你知道嗎?', [
      'uni 預設調度已平衡系統佔用與編譯耗時',
      '使用感測器控制選項擺脫開屏搖一搖廣告',
      'uni 在不傳入 -j 參數時會預設使用最適合機器的執行緒數',
      '如非必要不要向 uni 指定建置執行緒',
      '背景管理可以幫助你節省裝置功耗與保活 App',
      '主螢幕的搜尋列可以更換更多搜尋供應商',
      '使用智慧建議幫助你快速開啟複製的連結',
      '啟用 Prism 後三指上滑可以進行識屏'
    ]),
  en: createTipSet('Did you know?', [
      "uni's default scheduler balances system usage and build time",
      'Use the sensor control option to escape shake-to-open ads',
      'Without a -j argument, uni chooses the thread count best suited to the machine',
      'Do not specify build threads for uni unless necessary',
      'Background management can help save power and keep apps alive',
      'The home screen search bar supports more search providers',
      'Smart Suggestions can quickly open links you have copied',
      'With Prism enabled, swipe up with three fingers to identify what is on screen'
    ])
}
const standaloneTips: TipItem[] = [
  { text: 'Ciallo～(∠・ω< )⌒★' },
  { text: 'UwUniverse uw(universe)?' }
]
const tipSet = tipsByLocale[props.locale]
const selectedTip = ref<TipItem>(tipSet.items[0])
const selectedTipLabel = ref(tipSet.label)
const renderedPhrase = ref(phrases[0])
const announcedPhrase = ref(phrases[0])
const greeting = ref<HTMLElement>()
const phase = ref<'holding' | 'covering' | 'revealing'>('holding')
const reducedMotion = ref(false)
let phraseIndex = 0
let timer: ReturnType<typeof setTimeout> | undefined
let mediaQuery: MediaQueryList
let visibilityObserver: IntersectionObserver
let inView = false
let alive = true
let animation: Animation | undefined

function stop() {
  if (timer) clearTimeout(timer)
  timer = undefined
  animation?.cancel()
  animation = undefined
  phase.value = 'holding'
}

function canAnimate() {
  return alive && inView && !document.hidden && !reducedMotion.value
}

function hold() {
  if (!canAnimate()) return
  timer = setTimeout(cycle, 1600)
}

async function cycle() {
  const mask = greeting.value?.querySelector<HTMLElement>('.uwu-greeting__mask')
  if (!mask || !canAnimate()) return
  try {
    phase.value = 'covering'
    animation = mask.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 500, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
    )
    await animation.finished
    if (!canAnimate()) return
    // Change the full phrase only while the opaque mask covers it.
    phraseIndex = (phraseIndex + 1) % phrases.length
    renderedPhrase.value = phrases[phraseIndex]
    await nextTick()
    phase.value = 'revealing'
    animation.cancel()
    animation = mask.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration: 500, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' }
    )
    await animation.finished
    animation.cancel()
    animation = undefined
    phase.value = 'holding'
    announcedPhrase.value = renderedPhrase.value
    hold()
  } catch {
    // Cancellation on route exit, reduced motion or visibility changes.
  }
}

function resume() {
  stop()
  reducedMotion.value = mediaQuery.matches
  if (reducedMotion.value) {
    phraseIndex = 0
    renderedPhrase.value = phrases[0]
  }
  announcedPhrase.value = renderedPhrase.value
  hold()
}

onMounted(() => {
  const tipOptions = [
    ...tipSet.items.map(item => ({ label: tipSet.label, ...item })),
    ...standaloneTips.map(item => ({ label: '', ...item }))
  ]
  const selected = tipOptions[Math.floor(Math.random() * tipOptions.length)]
  selectedTip.value = { text: selected.text, href: selected.href }
  selectedTipLabel.value = selected.label
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', resume)
  document.addEventListener('visibilitychange', resume)
  visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting
    resume()
  }, { threshold: 0.1 })
  if (greeting.value) visibilityObserver.observe(greeting.value)
  resume()
})

onBeforeUnmount(() => {
  alive = false
  stop()
  visibilityObserver?.disconnect()
  mediaQuery?.removeEventListener('change', resume)
  document.removeEventListener('visibilitychange', resume)
})
</script>

<template>
  <main class="uwu-home" aria-labelledby="uwu-home-title">
    <PatternWallpaper />
    <section class="uwu-home__stage">
      <div ref="greeting" class="uwu-greeting" :data-phase="phase">
        <h1 id="uwu-home-title" class="uwu-sr-only">uwuAOSP</h1>
        <div class="uwu-greeting__line" aria-hidden="true">
          <span>{{ renderedPhrase }}</span>
          <span class="uwu-greeting__mask" />
        </div>
        <nav class="uwu-home__links" aria-label="社区链接">
          <a
            class="uwu-home__link"
            href="https://github.com/uwuAOSP"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            title="GitHub"
          >
            <span class="uwu-home__link-icon uwu-home__link-icon--github" aria-hidden="true" />
            <span class="uwu-home__link-label">GitHub</span>
          </a>
          <a
            class="uwu-home__link"
            href="https://t.me/+qMXkya4CEdc5YmU1"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Telegram"
            title="Telegram"
          >
            <span class="uwu-home__link-icon uwu-home__link-icon--telegram" aria-hidden="true" />
            <span class="uwu-home__link-label">Telegram</span>
          </a>
          <a
            class="uwu-home__link"
            href="https://qun.qq.com/universal-share/share?ac=1&authKey=qElelAQHgA1g4hBdYLpo%2ByU2Ix1CjrH5O1lxxDE%2FYx7OHdBnTaPsh8Gewbkmy8M%2F&busi_data=eyJncm91cENvZGUiOiIxMDk0MjM2MzYzIiwidG9rZW4iOiJsSkdLT2ZuS1RibFgrblJwVFVoOTE5blcvSXB3T1RZOEcrQndMMDdVSm5BR0lpWjJ6U0ZJQkxFK1hFNUZhZFMzIiwidWluIjoiMzU0MjE1MTYxNCJ9&data=YvYl6XqfUwWCGt2YoJKMXZnsXuO43iBtDCQz-_QIRB9RWqdWvsUgT14Sw-hNI_M3DaB_eni1irEZVCRHuAOj3A&svctype=4&tempid=h5_group_info"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="QQ-Group"
            title="QQ-Group"
          >
            <span class="uwu-home__link-icon uwu-home__link-icon--qq" aria-hidden="true" />
            <span class="uwu-home__link-label">QQ-Group</span>
          </a>
        </nav>
        <a v-if="selectedTip.href" class="uwu-home__tip" :href="withBase(selectedTip.href)">
          <span v-if="selectedTipLabel" class="uwu-home__tip-label">{{ selectedTipLabel }}</span>
          <span>{{ selectedTip.text }}</span>
        </a>
        <p v-else class="uwu-home__tip">
          <span v-if="selectedTipLabel" class="uwu-home__tip-label">{{ selectedTipLabel }}</span>
          <span>{{ selectedTip.text }}</span>
        </p>
        <p class="uwu-sr-only" aria-live="polite" aria-atomic="true">{{ announcedPhrase }}</p>
      </div>
    </section>

  </main>
</template>
