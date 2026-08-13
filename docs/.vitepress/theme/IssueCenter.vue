<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type Locale = 'zh-CN' | 'zh-TW' | 'en'
type Mode = 'website' | 'github'

type User = {
  id: number
  username: string
  email: string
}

type IssueStatus = 'open' | 'in_progress' | 'closed' | 'invalid' | string

type Issue = {
  id: number | string
  number?: number
  title: string
  body?: string | null
  status?: IssueStatus
  state?: IssueStatus
  author?: { id?: number; username?: string; email?: string }
  author_login?: string | null
  comments_count?: number
  labels?: Array<{ name?: string } | string>
  updated_at: string
  created_at: string
  closed_at?: string | null
  html_url?: string
}

const props = withDefaults(defineProps<{ locale?: Locale; mode: Mode }>(), {
  locale: 'zh-CN'
})

const apiBase = String(import.meta.env.VITE_ISSUES_API || 'http://127.0.0.1:8787').replace(/\/$/, '')
const loading = ref(true)
const detailLoading = ref(false)
const formLoading = ref(false)
const authLoading = ref(false)
const errorMessage = ref('')
const feedbackMessage = ref('')
const issues = ref<Issue[]>([])
const mineIssues = ref<Issue[]>([])
const selectedIssue = ref<Issue | null>(null)
const user = ref<User | null>(null)
const panel = ref<'auth' | 'create' | 'edit' | null>(null)
const authMode = ref<'login' | 'register'>('login')
const afterAuth = ref<'create' | 'edit' | null>(null)

const authForm = ref({
  emailOrUsername: '',
  email: '',
  username: '',
  password: ''
})

const issueForm = ref({
  title: '',
  body: ''
})

const copy = computed(() => ({
  'zh-CN': {
    loading: '正在加载',
    unavailable: '暂时无法连接 issue 服务，请确认 Worker 和 D1 已部署。',
    empty: '暂无 issue',
    refresh: '刷新',
    count: '条目',
    open: '开放',
    inProgress: '处理中',
    closed: '已关闭',
    invalid: '无效',
    author: '发送者',
    email: '邮箱',
    created: '创建于',
    updated: '更新于',
    comments: '评论',
    send: '发送 issue',
    edit: '修改 issue',
    login: '登录',
    register: '注册',
    logout: '退出登录',
    username: '用户名',
    emailOrUsername: '邮箱或用户名',
    password: '密码',
    title: '标题',
    body: '内容',
    submit: '提交',
    save: '保存修改',
    cancel: '取消',
    mine: '我的 issue',
    noMine: '当前账户还没有 issue',
    loginRequired: '请先登录账户',
    githubOpen: '在 GitHub 查看',
    back: '返回列表',
    authFailed: '登录或注册失败',
    issueSent: 'issue 已发送',
    issueSaved: 'issue 已更新',
    passwordHint: '至少 8 个字符',
    contact: '联系信息'
  },
  'zh-TW': {
    loading: '正在載入',
    unavailable: '暫時無法連線 issue 服務，請確認 Worker 和 D1 已部署。',
    empty: '暫無 issue',
    refresh: '重新整理',
    count: '個項目',
    open: '開放',
    inProgress: '處理中',
    closed: '已關閉',
    invalid: '無效',
    author: '發送者',
    email: '電子郵件',
    created: '建立於',
    updated: '更新於',
    comments: '留言',
    send: '發送 issue',
    edit: '修改 issue',
    login: '登入',
    register: '註冊',
    logout: '登出',
    username: '使用者名稱',
    emailOrUsername: '電子郵件或使用者名稱',
    password: '密碼',
    title: '標題',
    body: '內容',
    submit: '提交',
    save: '儲存修改',
    cancel: '取消',
    mine: '我的 issue',
    noMine: '目前帳戶還沒有 issue',
    loginRequired: '請先登入帳戶',
    githubOpen: '在 GitHub 查看',
    back: '返回列表',
    authFailed: '登入或註冊失敗',
    issueSent: 'issue 已發送',
    issueSaved: 'issue 已更新',
    passwordHint: '至少 8 個字元',
    contact: '聯絡資訊'
  },
  en: {
    loading: 'Loading',
    unavailable: 'The issue service is unavailable. Check the Worker and D1 deployment.',
    empty: 'No issues yet',
    refresh: 'Refresh',
    count: 'items',
    open: 'Open',
    inProgress: 'In progress',
    closed: 'Closed',
    invalid: 'Invalid',
    author: 'Author',
    email: 'Email',
    created: 'Created',
    updated: 'Updated',
    comments: 'comments',
    send: 'Send issue',
    edit: 'Edit issue',
    login: 'Log in',
    register: 'Register',
    logout: 'Log out',
    username: 'Username',
    emailOrUsername: 'Email or username',
    password: 'Password',
    title: 'Title',
    body: 'Body',
    submit: 'Submit',
    save: 'Save changes',
    cancel: 'Cancel',
    mine: 'My issues',
    noMine: 'This account has no issues yet',
    loginRequired: 'Log in to continue',
    githubOpen: 'View on GitHub',
    back: 'Back to list',
    authFailed: 'Login or registration failed',
    issueSent: 'Issue sent',
    issueSaved: 'Issue updated',
    passwordHint: 'At least 8 characters',
    contact: 'Contact'
  }
}[props.locale]))

const isWebsite = computed(() => props.mode === 'website')
const statusFor = (issue: Issue): IssueStatus => issue.status || issue.state || 'open'

function statusLabel(status: IssueStatus) {
  if (status === 'in_progress') return copy.value.inProgress
  if (status === 'closed') return copy.value.closed
  if (status === 'invalid') return copy.value.invalid
  return copy.value.open
}

function statusClass(status: IssueStatus) {
  return `is-${status.replace(/[^a-z_]/g, '')}`
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(props.locale === 'en' ? 'en-US' : props.locale, {
    dateStyle: 'medium'
  }).format(new Date(value))
}

function labelsFor(issue: Issue) {
  return (issue.labels || []).map((label) => typeof label === 'string' ? label : label.name).filter(Boolean) as string[]
}

async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body) headers.set('content-type', 'application/json')
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    credentials: 'include'
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
  return data as T
}

async function loadUser() {
  try {
    const data = await apiFetch<{ user: User | null }>('/api/auth/me')
    user.value = data.user
  } catch {
    user.value = null
  }
}

async function loadIssues() {
  loading.value = true
  errorMessage.value = ''
  selectedIssue.value = null
  const path = isWebsite.value ? '/api/website-issues?limit=50' : '/api/github-issues?limit=50'
  try {
    const data = await apiFetch<{ items: Issue[] }>(path)
    issues.value = Array.isArray(data.items) ? data.items : []
  } catch (error) {
    issues.value = []
    errorMessage.value = error instanceof Error && error.message !== 'Failed to fetch'
      ? error.message
      : copy.value.unavailable
  } finally {
    loading.value = false
  }
}

async function selectIssue(issue: Issue) {
  selectedIssue.value = issue
  detailLoading.value = true
  try {
    const path = isWebsite.value
      ? `/api/website-issues/${issue.id}`
      : `/api/github-issues/${issue.number}`
    selectedIssue.value = await apiFetch<Issue>(path)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : copy.value.unavailable
  } finally {
    detailLoading.value = false
  }
}

function startAuth(action: 'create' | 'edit' | null = null) {
  afterAuth.value = action
  panel.value = 'auth'
  feedbackMessage.value = ''
}

function openCreate() {
  if (!user.value) return startAuth('create')
  issueForm.value = { title: '', body: '' }
  panel.value = 'create'
  feedbackMessage.value = ''
}

async function openEdit() {
  if (!user.value) return startAuth('edit')
  formLoading.value = true
  feedbackMessage.value = ''
  try {
    const data = await apiFetch<{ items: Issue[] }>('/api/website-issues?mine=1&limit=100')
    mineIssues.value = data.items || []
    const issue = selectedIssue.value && mineIssues.value.find((item) => item.id === selectedIssue.value?.id)
    if (issue) selectEditIssue(issue)
    else if (mineIssues.value[0]) selectEditIssue(mineIssues.value[0])
    panel.value = 'edit'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : copy.value.unavailable
  } finally {
    formLoading.value = false
  }
}

function selectEditIssue(issue: Issue) {
  if (!issue) return
  selectedIssue.value = issue
  issueForm.value = { title: issue.title, body: issue.body || '' }
}

function handleEditSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const issue = mineIssues.value.find((item) => String(item.id) === value)
  if (issue) selectEditIssue(issue)
}

async function submitAuth() {
  authLoading.value = true
  feedbackMessage.value = ''
  try {
    const body = authMode.value === 'login'
      ? {
        emailOrUsername: authForm.value.emailOrUsername,
        password: authForm.value.password
      }
      : {
        email: authForm.value.email,
        username: authForm.value.username,
        password: authForm.value.password
      }
    const data = await apiFetch<{ user: User }>(
      authMode.value === 'login' ? '/api/auth/login' : '/api/auth/register',
      { method: 'POST', body: JSON.stringify(body) }
    )
    user.value = data.user
    panel.value = null
    const nextAction = afterAuth.value
    afterAuth.value = null
    if (nextAction === 'create') openCreate()
    if (nextAction === 'edit') await openEdit()
  } catch (error) {
    feedbackMessage.value = error instanceof Error ? error.message : copy.value.authFailed
  } finally {
    authLoading.value = false
  }
}

async function logout() {
  await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
  user.value = null
  panel.value = null
  mineIssues.value = []
}

async function submitIssue() {
  if (!user.value) return startAuth(panel.value === 'edit' ? 'edit' : 'create')
  formLoading.value = true
  feedbackMessage.value = ''
  try {
    const editing = panel.value === 'edit' && selectedIssue.value
    const data = await apiFetch<Issue>(
      editing ? `/api/website-issues/${selectedIssue.value?.id}` : '/api/website-issues',
      {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(issueForm.value)
      }
    )
    feedbackMessage.value = editing ? copy.value.issueSaved : copy.value.issueSent
    selectedIssue.value = data
    panel.value = null
    await loadIssues()
  } catch (error) {
    feedbackMessage.value = error instanceof Error ? error.message : copy.value.unavailable
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  void Promise.all([loadUser(), loadIssues()])
})
</script>

<template>
  <section class="uwu-issue-center" aria-live="polite">
    <div class="uwu-issue-center__toolbar">
      <div>
        <p v-if="!loading" class="uwu-issue-center__count">{{ issues.length }} {{ copy.count }}</p>
      </div>
      <div class="uwu-issue-center__toolbar-actions">
        <button class="uwu-m3-button uwu-m3-button--tonal" type="button" :disabled="loading" @click="loadIssues">
          {{ loading ? copy.loading : copy.refresh }}
        </button>
        <template v-if="isWebsite">
          <button class="uwu-m3-button uwu-m3-button--filled" type="button" @click="openCreate">
            {{ copy.send }}
          </button>
          <button class="uwu-m3-button uwu-m3-button--tonal" type="button" @click="openEdit">
            {{ copy.edit }}
          </button>
        </template>
      </div>
    </div>

    <div v-if="user" class="uwu-issue-center__account">
      <span>{{ user.username }} · {{ user.email }}</span>
      <button class="uwu-issue-text-button" type="button" @click="logout">{{ copy.logout }}</button>
    </div>

    <p v-if="errorMessage" class="uwu-issue-center__message is-error">{{ errorMessage }}</p>
    <p v-if="feedbackMessage" class="uwu-issue-center__message is-success">{{ feedbackMessage }}</p>
    <p v-if="loading" class="uwu-issue-center__empty">{{ copy.loading }}</p>
    <p v-else-if="!issues.length" class="uwu-issue-center__empty">{{ copy.empty }}</p>

    <div v-else class="uwu-issue-center__list">
      <button
        v-for="issue in issues"
        :key="issue.id"
        class="uwu-issue-row"
        type="button"
        :aria-label="`${issue.title} — ${statusLabel(statusFor(issue))}`"
        @click="selectIssue(issue)"
      >
        <span :class="['uwu-issue-status-icon', statusClass(statusFor(issue))]" aria-hidden="true">
          <svg v-if="statusFor(issue) === 'open'" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7" />
          </svg>
          <svg v-else-if="statusFor(issue) === 'in_progress'" viewBox="0 0 24 24">
            <path d="M12 4a8 8 0 1 0 7.2 4.5" />
            <path d="M12 8v4l2.5 1.5" />
          </svg>
          <svg v-else-if="statusFor(issue) === 'closed'" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="m8 12 2.6 2.6L16.5 9" />
          </svg>
          <svg v-else viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        </span>
        <span class="uwu-issue-row__main">
          <span class="uwu-issue-row__title">{{ issue.title }}</span>
          <span class="uwu-issue-row__meta">
            <span>{{ statusLabel(statusFor(issue)) }}</span>
            <span v-if="isWebsite">{{ issue.author?.username }}</span>
            <span v-else>{{ issue.author_login }}</span>
            <span>{{ formatDate(issue.updated_at) }}</span>
          </span>
        </span>
        <span class="uwu-issue-row__arrow" aria-hidden="true" />
      </button>
    </div>

    <div v-if="selectedIssue" class="uwu-issue-detail" aria-labelledby="uwu-issue-detail-title">
      <div class="uwu-issue-detail__header">
        <div>
          <h2 id="uwu-issue-detail-title">{{ selectedIssue.title }}</h2>
        </div>
        <button class="uwu-issue-text-button" type="button" @click="selectedIssue = null">{{ copy.back }}</button>
      </div>
      <p v-if="detailLoading" class="uwu-issue-center__empty">{{ copy.loading }}</p>
      <template v-else>
        <div class="uwu-issue-detail__status">
          <span :class="['uwu-issue-status-icon', statusClass(statusFor(selectedIssue))]" aria-hidden="true">
            <svg v-if="statusFor(selectedIssue) === 'open'" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7" />
            </svg>
            <svg v-else-if="statusFor(selectedIssue) === 'in_progress'" viewBox="0 0 24 24">
              <path d="M12 4a8 8 0 1 0 7.2 4.5" />
              <path d="M12 8v4l2.5 1.5" />
            </svg>
            <svg v-else-if="statusFor(selectedIssue) === 'closed'" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
              <path d="m8 12 2.6 2.6L16.5 9" />
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
              <path d="m8.5 8.5 7 7" />
            </svg>
          </span>
          <span>{{ statusLabel(statusFor(selectedIssue)) }}</span>
        </div>
        <div class="uwu-issue-detail__body">{{ selectedIssue.body || '—' }}</div>
        <dl class="uwu-issue-detail__contact">
          <div>
            <dt>{{ copy.author }}</dt>
            <dd>{{ selectedIssue.author?.username || selectedIssue.author_login || '—' }}</dd>
          </div>
          <div v-if="isWebsite">
            <dt>{{ copy.email }}</dt>
            <dd>{{ selectedIssue.author?.email || '—' }}</dd>
          </div>
          <div>
            <dt>{{ copy.created }}</dt>
            <dd>{{ formatDate(selectedIssue.created_at) }}</dd>
          </div>
          <div>
            <dt>{{ copy.updated }}</dt>
            <dd>{{ formatDate(selectedIssue.updated_at) }}</dd>
          </div>
        </dl>
        <a v-if="!isWebsite && selectedIssue.html_url" class="uwu-m3-button uwu-m3-button--tonal uwu-issue-external" :href="selectedIssue.html_url" target="_blank" rel="noreferrer">
          {{ copy.githubOpen }} <span class="uwu-issue-external-icon" aria-hidden="true" />
        </a>
      </template>
    </div>

    <div v-if="panel === 'auth'" class="uwu-issue-panel" aria-labelledby="uwu-issue-panel-title">
      <div class="uwu-issue-panel__header">
        <h2 id="uwu-issue-panel-title">{{ afterAuth ? copy.loginRequired : copy.login }}</h2>
        <button class="uwu-issue-text-button" type="button" @click="panel = null">{{ copy.cancel }}</button>
      </div>
      <div class="uwu-issue-tabs" role="tablist">
        <button :class="['uwu-issue-tab', { 'is-active': authMode === 'login' }]" type="button" role="tab" @click="authMode = 'login'">{{ copy.login }}</button>
        <button :class="['uwu-issue-tab', { 'is-active': authMode === 'register' }]" type="button" role="tab" @click="authMode = 'register'">{{ copy.register }}</button>
      </div>
      <form class="uwu-issue-form" @submit.prevent="submitAuth">
        <label v-if="authMode === 'login'">
          <span>{{ copy.emailOrUsername }}</span>
          <input v-model="authForm.emailOrUsername" autocomplete="username" required />
        </label>
        <label v-else>
          <span>{{ copy.username }}</span>
          <input v-model="authForm.username" autocomplete="username" required />
        </label>
        <label v-if="authMode === 'register'">
          <span>{{ copy.email }}</span>
          <input v-model="authForm.email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>{{ copy.password }} <small>({{ copy.passwordHint }})</small></span>
          <input v-model="authForm.password" type="password" autocomplete="current-password" minlength="8" required />
        </label>
        <button class="uwu-m3-button uwu-m3-button--filled" type="submit" :disabled="authLoading">
          {{ authLoading ? copy.loading : authMode === 'login' ? copy.login : copy.register }}
        </button>
      </form>
    </div>

    <div v-if="panel === 'create' || panel === 'edit'" class="uwu-issue-panel" aria-labelledby="uwu-issue-form-title">
      <div class="uwu-issue-panel__header">
        <h2 id="uwu-issue-form-title">{{ panel === 'create' ? copy.send : copy.edit }}</h2>
        <button class="uwu-issue-text-button" type="button" @click="panel = null">{{ copy.cancel }}</button>
      </div>
      <div v-if="panel === 'edit' && !mineIssues.length" class="uwu-issue-center__empty">{{ copy.noMine }}</div>
      <template v-else>
        <label v-if="panel === 'edit'" class="uwu-issue-form__select">
          <span>{{ copy.mine }}</span>
          <select :value="selectedIssue?.id" @change="handleEditSelect">
            <option v-for="issue in mineIssues" :key="issue.id" :value="issue.id">{{ issue.title }}</option>
          </select>
        </label>
        <form class="uwu-issue-form" @submit.prevent="submitIssue">
          <label>
            <span>{{ copy.title }}</span>
            <input v-model="issueForm.title" maxlength="200" required />
          </label>
          <label>
            <span>{{ copy.body }}</span>
            <textarea v-model="issueForm.body" rows="7" maxlength="20000" required />
          </label>
          <button class="uwu-m3-button uwu-m3-button--filled" type="submit" :disabled="formLoading">
            {{ formLoading ? copy.loading : panel === 'create' ? copy.submit : copy.save }}
          </button>
        </form>
      </template>
    </div>
  </section>
</template>
