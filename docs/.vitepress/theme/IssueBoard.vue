<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Locale = 'zh-CN' | 'zh-TW' | 'en'

type Issue = {
  id: string
  repository: string
  number: number
  title: string
  state: 'open' | 'closed' | string
  author: string
  comments: number
  labels: string[]
  updated_at: string
  html_url: string
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), {
  locale: 'zh-CN'
})

const apiUrl = import.meta.env.VITE_ISSUES_API || 'http://127.0.0.1:8787/api/issues'
const loading = ref(true)
const usingDemoData = ref(false)
const errorMessage = ref('')
const issues = ref<Issue[]>([])

const copy = computed(() => ({
  'zh-CN': {
    refresh: '刷新',
    loading: '正在加载 Issue',
    empty: '暂无 Issue',
    demo: '演示数据',
    open: '开放',
    closed: '已关闭',
    comments: '评论',
    updated: '更新于',
    failed: '暂时无法连接 Webhook API，当前显示演示数据。'
  },
  'zh-TW': {
    refresh: '重新整理',
    loading: '正在載入 Issue',
    empty: '暫無 Issue',
    demo: '示範資料',
    open: '開放',
    closed: '已關閉',
    comments: '留言',
    updated: '更新於',
    failed: '暫時無法連線 Webhook API，目前顯示示範資料。'
  },
  en: {
    refresh: 'Refresh',
    loading: 'Loading issues',
    empty: 'No issues yet',
    demo: 'Demo data',
    open: 'Open',
    closed: 'Closed',
    comments: 'comments',
    updated: 'Updated',
    failed: 'The Webhook API is unavailable. Showing demo data.'
  }
}[props.locale]))

const demoIssues: Issue[] = [
  {
    id: 'uwuAOSP/issue_tracker#1',
    repository: 'uwuAOSP/issue_tracker',
    number: 1,
    title: '示例 Issue：设备树适配反馈',
    state: 'open',
    author: 'uwuAOSP',
    comments: 0,
    labels: ['demo'],
    updated_at: '2026-08-14T00:00:00.000Z',
    html_url: 'https://github.com/uwuAOSP'
  }
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat(props.locale === 'en' ? 'en-US' : props.locale, {
    dateStyle: 'medium'
  }).format(new Date(value))
}

async function loadIssues() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(apiUrl, { headers: { accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    issues.value = Array.isArray(data.issues) ? data.issues : []
    usingDemoData.value = false
  } catch {
    issues.value = demoIssues
    usingDemoData.value = true
    errorMessage.value = copy.value.failed
  } finally {
    loading.value = false
  }
}

onMounted(loadIssues)
</script>

<template>
  <section class="uwu-issues-board" aria-live="polite">
    <div class="uwu-issues-toolbar">
      <p v-if="usingDemoData" class="uwu-issues-status">{{ copy.demo }}</p>
      <p v-else-if="!loading" class="uwu-issues-status">{{ issues.length }} Issues</p>
      <button class="uwu-issues-refresh" type="button" :disabled="loading" @click="loadIssues">
        {{ loading ? copy.loading : copy.refresh }}
      </button>
    </div>

    <p v-if="errorMessage" class="uwu-issues-note">{{ errorMessage }}</p>
    <p v-if="loading" class="uwu-issues-empty">{{ copy.loading }}</p>
    <p v-else-if="!issues.length" class="uwu-issues-empty">{{ copy.empty }}</p>

    <div v-else class="uwu-issues-list">
      <a
        v-for="issue in issues"
        :key="issue.id"
        class="uwu-issue-item"
        :href="issue.html_url"
        target="_blank"
        rel="noreferrer"
      >
        <div class="uwu-issue-main">
          <span class="uwu-issue-repository">{{ issue.repository }} #{{ issue.number }}</span>
          <h2>{{ issue.title }}</h2>
          <div class="uwu-issue-meta">
            <span :class="['uwu-issue-state', issue.state === 'closed' ? 'is-closed' : '']">
              {{ issue.state === 'closed' ? copy.closed : copy.open }}
            </span>
            <span v-for="label in issue.labels" :key="label" class="uwu-issue-label">{{ label }}</span>
            <span>{{ issue.comments }} {{ copy.comments }}</span>
            <span>{{ copy.updated }} {{ formatDate(issue.updated_at) }}</span>
          </div>
        </div>
        <span class="uwu-issue-arrow" aria-hidden="true" />
      </a>
    </div>
  </section>
</template>
