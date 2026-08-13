const GITHUB_API = 'https://api.github.com'
const GITHUB_API_VERSION = '2022-11-28'
const PAGE_SIZE = 100
const DEFAULT_REPOSITORY = 'uwuAOSP/issue_tracker'
const SESSION_COOKIE = 'uwu_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30
const PASSWORD_ITERATIONS = 120000
const ISSUE_STATUSES = new Set(['open', 'in_progress', 'closed', 'invalid'])

const UPSERT_ISSUE_SQL = [
  'INSERT INTO issues (',
  '  number, node_id, title, body, state, locked, author_login,',
  '  author_avatar_url, html_url, comments_count, labels_json,',
  '  assignees_json, milestone_json, created_at, updated_at,',
  '  closed_at, synced_at',
  ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  'ON CONFLICT(number) DO UPDATE SET',
  '  node_id = excluded.node_id,',
  '  title = excluded.title,',
  '  body = excluded.body,',
  '  state = excluded.state,',
  '  locked = excluded.locked,',
  '  author_login = excluded.author_login,',
  '  author_avatar_url = excluded.author_avatar_url,',
  '  html_url = excluded.html_url,',
  '  comments_count = excluded.comments_count,',
  '  labels_json = excluded.labels_json,',
  '  assignees_json = excluded.assignees_json,',
  '  milestone_json = excluded.milestone_json,',
  '  created_at = excluded.created_at,',
  '  updated_at = excluded.updated_at,',
  '  closed_at = excluded.closed_at,',
  '  synced_at = excluded.synced_at'
].join('\n')

const UPSERT_COMMENT_SQL = [
  'INSERT INTO issue_comments (',
  '  id, issue_number, author_login, body, html_url, created_at, updated_at',
  ') VALUES (?, ?, ?, ?, ?, ?, ?)',
  'ON CONFLICT(id) DO UPDATE SET',
  '  issue_number = excluded.issue_number,',
  '  author_login = excluded.author_login,',
  '  body = excluded.body,',
  '  html_url = excluded.html_url,',
  '  created_at = excluded.created_at,',
  '  updated_at = excluded.updated_at'
].join('\n')

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function configuredOrigins(env) {
  return String(env.WEB_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function responseOrigin(request, env) {
  const origin = request.headers.get('Origin')
  if (!origin) return '*'

  const origins = configuredOrigins(env)
  if (!origins.length || origins.includes('*')) return origin
  return origins.includes(origin) ? origin : 'null'
}

function responseHeaders(request, env, extra = {}) {
  const origin = responseOrigin(request, env)
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': origin !== '*',
    'access-control-allow-headers': 'authorization, content-type, x-github-event, x-github-delivery, x-hub-signature-256',
    'access-control-allow-methods': 'GET, OPTIONS, POST, PATCH',
    'content-type': 'application/json; charset=utf-8',
    vary: 'Origin',
    ...extra
  }
}

function json(data, status = 200, request, env, extraHeaders = {}) {
  return new Response(
    status === 204 ? null : JSON.stringify(data),
    { status, headers: responseHeaders(request, env, extraHeaders) }
  )
}

function assertAllowedOrigin(request, env) {
  const origin = request.headers.get('Origin')
  if (origin && responseOrigin(request, env) === 'null') {
    throw new HttpError(403, 'Origin is not allowed')
  }
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new HttpError(400, 'Invalid JSON body')
  }
}

function repositoryPath(env) {
  const repository = env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY
  const [owner, name] = repository.split('/')

  if (!owner || !name || repository.split('/').length !== 2) {
    throw new Error('GITHUB_REPOSITORY must use the owner/name format')
  }

  return encodeURIComponent(owner) + '/' + encodeURIComponent(name)
}

function repositoryName(env) {
  return env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY
}

function githubHeaders(env) {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': GITHUB_API_VERSION,
    'user-agent': 'uwuAOSP-issue-sync'
  }

  if (env.GITHUB_TOKEN) {
    headers.authorization = 'Bearer ' + env.GITHUB_TOKEN
  }

  return headers
}

async function githubGet(env, pathname) {
  const response = await fetch(GITHUB_API + pathname, {
    headers: githubHeaders(env)
  })

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error('GitHub API ' + response.status + ': ' + detail)
  }

  return response.json()
}

async function githubPages(env, pathname) {
  const items = []

  for (let page = 1; ; page += 1) {
    const separator = pathname.includes('?') ? '&' : '?'
    const pageItems = await githubGet(
      env,
      pathname + separator + 'per_page=' + PAGE_SIZE + '&page=' + page
    )

    if (!Array.isArray(pageItems)) {
      throw new Error('GitHub API returned a non-array page')
    }

    items.push(...pageItems)
    if (pageItems.length < PAGE_SIZE) return items
  }
}

function jsonText(value) {
  return JSON.stringify(value ?? [])
}

function issueValues(issue, syncedAt) {
  return [
    issue.number,
    issue.node_id ?? null,
    issue.title ?? '',
    issue.body ?? null,
    issue.state ?? 'open',
    issue.locked ? 1 : 0,
    issue.user?.login ?? null,
    issue.user?.avatar_url ?? null,
    issue.html_url ?? '',
    issue.comments ?? 0,
    jsonText(issue.labels),
    jsonText(issue.assignees),
    issue.milestone ? JSON.stringify(issue.milestone) : null,
    issue.created_at ?? new Date().toISOString(),
    issue.updated_at ?? new Date().toISOString(),
    issue.closed_at ?? null,
    syncedAt
  ]
}

function issueStatement(db, issue, syncedAt) {
  return db.prepare(UPSERT_ISSUE_SQL).bind(...issueValues(issue, syncedAt))
}

function commentStatement(db, issueNumber, comment) {
  return db.prepare(UPSERT_COMMENT_SQL).bind(
    comment.id,
    issueNumber,
    comment.user?.login ?? null,
    comment.body ?? null,
    comment.html_url ?? '',
    comment.created_at ?? new Date().toISOString(),
    comment.updated_at ?? new Date().toISOString()
  )
}

async function runBatches(db, statements, size = 50) {
  for (let index = 0; index < statements.length; index += size) {
    await db.batch(statements.slice(index, index + size))
  }
}

async function writeSyncRun(db, values) {
  await db.prepare([
    'INSERT INTO sync_runs (',
    '  started_at, completed_at, issues_count, comments_count, status, error',
    ') VALUES (?, ?, ?, ?, ?, ?)'
  ].join('\n')).bind(
    values.startedAt,
    values.completedAt ?? null,
    values.issuesCount ?? 0,
    values.commentsCount ?? 0,
    values.status,
    values.error ?? null
  ).run()
}

export async function syncIssues(env) {
  const startedAt = new Date().toISOString()
  const db = env.ISSUE_DB

  if (!db) throw new Error('ISSUE_DB binding is missing')

  try {
    const issues = (await githubPages(
      env,
      '/repos/' + repositoryPath(env) + '/issues?state=all&sort=updated&direction=desc'
    )).filter((issue) => !issue.pull_request)
    const syncedAt = new Date().toISOString()

    await runBatches(
      db,
      issues.map((issue) => issueStatement(db, issue, syncedAt))
    )

    let commentsCount = 0

    for (const issue of issues) {
      const comments = issue.comments > 0
        ? await githubPages(env, '/repos/' + repositoryPath(env) + '/issues/' + issue.number + '/comments')
        : []

      await runBatches(db, [
        db.prepare('DELETE FROM issue_comments WHERE issue_number = ?').bind(issue.number),
        ...comments.map((comment) => commentStatement(db, issue.number, comment))
      ])
      commentsCount += comments.length
    }

    const completedAt = new Date().toISOString()
    await writeSyncRun(db, {
      startedAt,
      completedAt,
      issuesCount: issues.length,
      commentsCount,
      status: 'success'
    })

    return {
      repository: repositoryName(env),
      issues: issues.length,
      comments: commentsCount,
      completedAt
    }
  } catch (error) {
    try {
      await writeSyncRun(db, {
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      })
    } catch {
      // Preserve the original sync error when the failure log cannot be written.
    }
    throw error
  }
}

function parseJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function serializeGithubIssue(issue) {
  return {
    ...issue,
    locked: Boolean(issue.locked),
    labels: parseJson(issue.labels_json, []),
    assignees: parseJson(issue.assignees_json, []),
    milestone: parseJson(issue.milestone_json, null),
    repository: repositoryNameFromIssue(issue)
  }
}

function repositoryNameFromIssue(issue) {
  return issue.repository || DEFAULT_REPOSITORY
}

async function listGithubIssues(request, env) {
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0)
  const result = await env.ISSUE_DB.prepare([
    'SELECT * FROM issues',
    'ORDER BY updated_at DESC',
    'LIMIT ? OFFSET ?'
  ].join('\n')).bind(limit, offset).all()
  const items = (result.results || []).map(serializeGithubIssue)

  return json({ items, issues: items, limit, offset }, 200, request, env)
}

async function getGithubIssue(request, env, number) {
  const issue = await env.ISSUE_DB.prepare(
    'SELECT * FROM issues WHERE number = ?'
  ).bind(number).first()

  if (!issue) return json({ error: 'Issue not found' }, 404, request, env)

  const comments = await env.ISSUE_DB.prepare([
    'SELECT id, issue_number, author_login, body, html_url, created_at, updated_at',
    'FROM issue_comments',
    'WHERE issue_number = ?',
    'ORDER BY created_at ASC'
  ].join('\n')).bind(number).all()

  return json({
    ...serializeGithubIssue(issue),
    comments: comments.results || []
  }, 200, request, env)
}

function publicUser(row) {
  if (!row) return null
  return {
    id: Number(row.id ?? row.user_id),
    username: row.username,
    email: row.email,
    role: row.role || 'player',
    is_admin: row.role === 'admin',
    created_at: row.created_at
  }
}

function parseCookies(request) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookies = {}
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    const key = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
  }
  return cookies
}

function bytesToBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function randomToken() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)))
}

async function digestHex(algorithm, value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value
  const digest = await crypto.subtle.digest(algorithm, bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256'
    },
    key,
    256
  )
  return bytesToBase64Url(new Uint8Array(bits))
}

async function createSession(env, userId, request) {
  const rawToken = randomToken()
  const tokenHash = await digestHex('SHA-256', rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString()
  await env.ISSUE_DB.prepare([
    'INSERT INTO sessions (token_hash, user_id, expires_at, created_at)',
    'VALUES (?, ?, ?, ?)'
  ].join('\n')).bind(tokenHash, userId, expiresAt, now.toISOString()).run()

  const origin = request.headers.get('Origin') || ''
  const local = /^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin)
  const sameSite = local ? 'Lax' : 'None'
  const secure = local ? '' : ' Secure;'
  return `${SESSION_COOKIE}=${encodeURIComponent(rawToken)}; Path=/; HttpOnly;${secure} SameSite=${sameSite}; Max-Age=${SESSION_TTL_SECONDS}`
}

async function currentUser(request, env) {
  const rawToken = parseCookies(request)[SESSION_COOKIE]
  if (!rawToken) return null

  const tokenHash = await digestHex('SHA-256', rawToken)
  const row = await env.ISSUE_DB.prepare([
    'SELECT users.id, users.username, users.email, users.role, users.created_at',
    'FROM sessions JOIN users ON users.id = sessions.user_id',
    'WHERE sessions.token_hash = ? AND sessions.expires_at > ?'
  ].join('\n')).bind(tokenHash, new Date().toISOString()).first()
  return publicUser(row)
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new HttpError(400, 'Password must be 8 to 128 characters')
  }
}

function validateTitle(title) {
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
    throw new HttpError(400, 'Title must be 1 to 200 characters')
  }
  return title.trim()
}

function validateBody(body) {
  if (typeof body !== 'string' || !body.trim() || body.length > 20000) {
    throw new HttpError(400, 'Body must be 1 to 20000 characters')
  }
  return body.trim()
}

function validateIssueStatus(status) {
  if (typeof status !== 'string' || !ISSUE_STATUSES.has(status)) {
    throw new HttpError(400, 'Invalid issue status')
  }
  return status
}

function isAdmin(user) {
  return user?.role === 'admin'
}

async function register(request, env) {
  assertAllowedOrigin(request, env)
  const data = await readJson(request)
  const username = typeof data.username === 'string' ? data.username.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
  if (username.length < 2 || username.length > 32) {
    throw new HttpError(400, 'Username must be 2 to 32 characters')
  }
  if (!validateEmail(email)) throw new HttpError(400, 'A valid email is required')
  validatePassword(data.password)

  const reserved = await env.ISSUE_DB.prepare(
    'SELECT username FROM reserved_usernames WHERE username_key = lower(?)'
  ).bind(username).first()
  if (reserved) throw new HttpError(409, 'This username is reserved')

  const existing = await env.ISSUE_DB.prepare(
    'SELECT id FROM users WHERE lower(username) = lower(?) OR email = ?'
  ).bind(username, email).first()
  if (existing) throw new HttpError(409, 'Username or email is already registered')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const passwordHash = await derivePassword(data.password, salt)
  const createdAt = new Date().toISOString()
  const result = await env.ISSUE_DB.prepare([
    'INSERT INTO users (username, email, password_salt, password_hash, role, created_at)',
    "VALUES (?, ?, ?, ?, 'player', ?)"
  ].join('\n')).bind(
    username,
    email,
    bytesToBase64Url(salt),
    passwordHash,
    createdAt
  ).run()

  const userId = Number(result.meta?.last_row_id)
  const cookie = await createSession(env, userId, request)
  return json(
    { user: { id: userId, username, email, created_at: createdAt } },
    201,
    request,
    env,
    { 'set-cookie': cookie }
  )
}

async function login(request, env) {
  assertAllowedOrigin(request, env)
  const data = await readJson(request)
  const emailOrUsername = typeof data.emailOrUsername === 'string'
    ? data.emailOrUsername.trim()
    : ''
  validatePassword(data.password)
  if (!emailOrUsername) throw new HttpError(400, 'Email or username is required')

  const row = await env.ISSUE_DB.prepare([
    'SELECT id, username, email, password_salt, password_hash, role, created_at',
    'FROM users WHERE lower(email) = ? OR lower(username) = ?'
  ].join('\n')).bind(emailOrUsername.toLowerCase(), emailOrUsername).first()
  if (!row) throw new HttpError(401, 'Invalid email, username or password')

  const passwordHash = await derivePassword(data.password, base64UrlToBytes(row.password_salt))
  if (!constantTimeEqual(passwordHash, row.password_hash)) {
    throw new HttpError(401, 'Invalid email, username or password')
  }

  const cookie = await createSession(env, row.id, request)
  return json(
    { user: publicUser(row) },
    200,
    request,
    env,
    { 'set-cookie': cookie }
  )
}

async function logout(request, env) {
  assertAllowedOrigin(request, env)
  const rawToken = parseCookies(request)[SESSION_COOKIE]
  if (rawToken) {
    const tokenHash = await digestHex('SHA-256', rawToken)
    await env.ISSUE_DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
  }

  return json(null, 204, request, env, {
    'set-cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  })
}

async function listWebsiteIssues(request, env) {
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0)
  const mine = url.searchParams.get('mine') === '1'
  const user = await currentUser(request, env)
  if (mine && !user) throw new HttpError(401, 'Login required')

  const query = mine
    ? [
      'SELECT website_issues.*, users.username AS current_username',
      'FROM website_issues JOIN users ON users.id = website_issues.author_id',
      'WHERE website_issues.author_id = ? AND website_issues.hidden = 0',
      'ORDER BY website_issues.updated_at DESC LIMIT ? OFFSET ?'
    ].join('\n')
    : [
      'SELECT website_issues.*, users.username AS current_username',
      'FROM website_issues JOIN users ON users.id = website_issues.author_id',
      'WHERE website_issues.hidden = 0',
      'ORDER BY website_issues.updated_at DESC LIMIT ? OFFSET ?'
    ].join('\n')
  const bindings = mine ? [user.id, limit, offset] : [limit, offset]
  const result = await env.ISSUE_DB.prepare(query).bind(...bindings).all()
  const items = (result.results || []).map(serializeWebsiteIssue)
  return json({ items, limit, offset, mine }, 200, request, env)
}

function serializeWebsiteIssue(issue, includeContact = false) {
  const output = {
    id: Number(issue.id),
    title: issue.title,
    body: issue.body,
    status: issue.status,
    author: {
      id: Number(issue.author_id),
      username: issue.author_name || issue.current_username
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    closed_at: issue.closed_at
  }
  if (includeContact) output.author.email = issue.author_email
  return output
}

async function getWebsiteIssue(request, env, id) {
  const issue = await env.ISSUE_DB.prepare([
    'SELECT website_issues.*, users.username AS current_username',
    'FROM website_issues JOIN users ON users.id = website_issues.author_id',
    'WHERE website_issues.id = ? AND website_issues.hidden = 0'
  ].join('\n')).bind(id).first()
  if (!issue) return json({ error: 'WebSite issue not found' }, 404, request, env)

  return json(serializeWebsiteIssue(issue, true), 200, request, env)
}

async function createWebsiteIssue(request, env) {
  assertAllowedOrigin(request, env)
  const user = await currentUser(request, env)
  if (!user) throw new HttpError(401, 'Login required')
  const data = await readJson(request)
  const title = validateTitle(data.title)
  const body = validateBody(data.body)
  const now = new Date().toISOString()
  const result = await env.ISSUE_DB.prepare([
    'INSERT INTO website_issues (title, body, status, author_id, author_name, author_email, created_at, updated_at)',
    "VALUES (?, ?, 'open', ?, ?, ?, ?, ?)"
  ].join('\n')).bind(
    title,
    body,
    user.id,
    user.username,
    user.email,
    now,
    now
  ).run()
  const issue = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ?'
  ).bind(result.meta?.last_row_id).first()
  return json(serializeWebsiteIssue(issue, true), 201, request, env)
}

async function updateWebsiteIssue(request, env, id) {
  assertAllowedOrigin(request, env)
  const user = await currentUser(request, env)
  if (!user) throw new HttpError(401, 'Login required')
  const existing = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ? AND hidden = 0'
  ).bind(id).first()
  if (!existing) return json({ error: 'WebSite issue not found' }, 404, request, env)
  if (Number(existing.author_id) !== user.id && !isAdmin(user)) {
    throw new HttpError(403, 'Only the issue author or an administrator can edit it')
  }

  const data = await readJson(request)
  const title = validateTitle(data.title)
  const body = validateBody(data.body)
  const updatedAt = new Date().toISOString()
  await env.ISSUE_DB.prepare([
    'UPDATE website_issues',
    'SET title = ?, body = ?, updated_at = ?',
    'WHERE id = ?'
  ].join('\n')).bind(title, body, updatedAt, id).run()
  const issue = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ?'
  ).bind(id).first()
  return json(serializeWebsiteIssue(issue, true), 200, request, env)
}

async function updateWebsiteIssueStatus(request, env, id, status) {
  assertAllowedOrigin(request, env)
  const user = await currentUser(request, env)
  if (!user) throw new HttpError(401, 'Login required')
  if (!isAdmin(user)) throw new HttpError(403, 'Administrator access required')

  return writeWebsiteIssueStatus(request, env, id, status)
}

async function writeWebsiteIssueStatus(request, env, id, status) {
  const nextStatus = validateIssueStatus(status)

  const existing = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ? AND hidden = 0'
  ).bind(id).first()
  if (!existing) return json({ error: 'WebSite issue not found' }, 404, request, env)

  const updatedAt = new Date().toISOString()
  const closedAt = nextStatus === 'closed' ? (existing.closed_at || updatedAt) : null
  await env.ISSUE_DB.prepare([
    'UPDATE website_issues',
    'SET status = ?, closed_at = ?, updated_at = ?',
    'WHERE id = ?'
  ].join('\n')).bind(nextStatus, closedAt, updatedAt, id).run()

  const issue = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ?'
  ).bind(id).first()
  return json(serializeWebsiteIssue(issue, true), 200, request, env)
}

async function closeWebsiteIssue(request, env, id) {
  assertAllowedOrigin(request, env)
  const user = await currentUser(request, env)
  if (!user) throw new HttpError(401, 'Login required')

  const existing = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ? AND hidden = 0'
  ).bind(id).first()
  if (!existing) return json({ error: 'WebSite issue not found' }, 404, request, env)
  if (Number(existing.author_id) !== user.id && !isAdmin(user)) {
    throw new HttpError(403, 'Only the issue author or an administrator can close it')
  }
  if (!['open', 'in_progress'].includes(existing.status)) {
    throw new HttpError(409, 'Only open or in-progress issues can be closed')
  }

  return writeWebsiteIssueStatus(request, env, id, 'closed')
}

async function reopenWebsiteIssue(request, env, id) {
  assertAllowedOrigin(request, env)
  const user = await currentUser(request, env)
  if (!user) throw new HttpError(401, 'Login required')

  const existing = await env.ISSUE_DB.prepare(
    'SELECT * FROM website_issues WHERE id = ? AND hidden = 0'
  ).bind(id).first()
  if (!existing) return json({ error: 'WebSite issue not found' }, 404, request, env)
  if (Number(existing.author_id) !== user.id && !isAdmin(user)) {
    throw new HttpError(403, 'Only the issue author or an administrator can reopen it')
  }
  if (existing.status !== 'closed' && !(existing.status === 'invalid' && isAdmin(user))) {
    throw new HttpError(409, 'Only closed issues can be reopened')
  }

  return writeWebsiteIssueStatus(request, env, id, 'open')
}

async function getStatus(request, env) {
  const latest = await env.ISSUE_DB.prepare([
    'SELECT * FROM sync_runs',
    'ORDER BY id DESC',
    'LIMIT 1'
  ].join('\n')).first()
  return json({ latest }, 200, request, env)
}

function canSync(request, env) {
  return Boolean(env.SYNC_TOKEN)
    && request.headers.get('Authorization') === 'Bearer ' + env.SYNC_TOKEN
}

async function webhookSignatureIsValid(rawBody, signature, secret) {
  if (!signature || !signature.startsWith('sha256=') || !secret) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = 'sha256=' + Array.from(new Uint8Array(mac), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return constantTimeEqual(expected, signature)
}

async function handleGithubWebhook(request, env) {
  if (!env.GITHUB_WEBHOOK_SECRET) {
    throw new HttpError(503, 'GITHUB_WEBHOOK_SECRET is not configured')
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  if (!await webhookSignatureIsValid(rawBody, signature, env.GITHUB_WEBHOOK_SECRET)) {
    throw new HttpError(401, 'Invalid webhook signature')
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw new HttpError(400, 'Invalid webhook payload')
  }

  const eventName = request.headers.get('x-github-event') || 'unknown'
  const deliveryId = request.headers.get('x-github-delivery') || ''
  const repository = payload.repository?.full_name
  if (repository && repository !== repositoryName(env)) {
    return json({ ok: true, ignored: true, repository }, 202, request, env)
  }

  if (deliveryId) {
    const seen = await env.ISSUE_DB.prepare(
      'SELECT delivery_id FROM github_webhook_deliveries WHERE delivery_id = ?'
    ).bind(deliveryId).first()
    if (seen) return json({ ok: true, duplicate: true }, 200, request, env)
  }

  const issue = payload.issue
  if ((eventName === 'issues' || eventName === 'issue_comment') && issue && !issue.pull_request) {
    const now = new Date().toISOString()
    if (eventName === 'issues' && payload.action === 'deleted') {
      await env.ISSUE_DB.batch([
        env.ISSUE_DB.prepare('DELETE FROM issue_comments WHERE issue_number = ?').bind(issue.number),
        env.ISSUE_DB.prepare('DELETE FROM issues WHERE number = ?').bind(issue.number)
      ])
    } else {
      const statements = [issueStatement(env.ISSUE_DB, issue, now)]
      if (eventName === 'issue_comment' && payload.comment) {
        if (payload.action === 'deleted') {
          statements.push(env.ISSUE_DB.prepare('DELETE FROM issue_comments WHERE id = ?').bind(payload.comment.id))
        } else {
          statements.push(commentStatement(env.ISSUE_DB, issue.number, payload.comment))
        }
      }
      await env.ISSUE_DB.batch(statements)
    }
  }

  if (deliveryId) {
    await env.ISSUE_DB.prepare([
      'INSERT OR IGNORE INTO github_webhook_deliveries (delivery_id, received_at)',
      'VALUES (?, ?)'
    ].join('\n')).bind(deliveryId, new Date().toISOString()).run()
  }

  return json({ ok: true, event: eventName, action: payload.action || null }, 202, request, env)
}

export default {
  async scheduled(controller, env) {
    await syncIssues(env)
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return json(null, 204, request, env)
    }

    const url = new URL(request.url)

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return json({ ok: true, service: 'uwuaosp-issue-sync' }, 200, request, env)
      }

      if (request.method === 'GET' && url.pathname === '/api/auth/me') {
        return json({ user: await currentUser(request, env) }, 200, request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/auth/register') {
        return await register(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/auth/login') {
        return await login(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
        return await logout(request, env)
      }

      if (request.method === 'GET' && (url.pathname === '/api/issues' || url.pathname === '/api/github-issues')) {
        return await listGithubIssues(request, env)
      }

      const githubIssueMatch = url.pathname.match(/^\/api\/(?:issues|github-issues)\/(\d+)$/)
      if (request.method === 'GET' && githubIssueMatch) {
        return await getGithubIssue(request, env, Number(githubIssueMatch[1]))
      }

      if (request.method === 'GET' && url.pathname === '/api/website-issues') {
        return await listWebsiteIssues(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/website-issues') {
        return await createWebsiteIssue(request, env)
      }

      const websiteIssueMatch = url.pathname.match(/^\/api\/website-issues\/(\d+)$/)
      if (websiteIssueMatch && request.method === 'GET') {
        return await getWebsiteIssue(request, env, Number(websiteIssueMatch[1]))
      }
      if (websiteIssueMatch && request.method === 'PATCH') {
        return await updateWebsiteIssue(request, env, Number(websiteIssueMatch[1]))
      }

      const websiteIssueStatusMatch = url.pathname.match(/^\/api\/website-issues\/(\d+)\/status$/)
      if (websiteIssueStatusMatch && request.method === 'PATCH') {
        const data = await readJson(request)
        return await updateWebsiteIssueStatus(request, env, Number(websiteIssueStatusMatch[1]), data.status)
      }

      const websiteIssueActionMatch = url.pathname.match(/^\/api\/website-issues\/(\d+)\/(close|reopen)$/)
      if (websiteIssueActionMatch && request.method === 'POST') {
        const id = Number(websiteIssueActionMatch[1])
        return await (websiteIssueActionMatch[2] === 'close'
          ? closeWebsiteIssue(request, env, id)
          : reopenWebsiteIssue(request, env, id))
      }

      if (request.method === 'GET' && url.pathname === '/api/sync-status') {
        return await getStatus(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/sync') {
        if (!canSync(request, env)) {
          return json({ error: 'Unauthorized' }, 401, request, env)
        }
        return json({ ok: true, result: await syncIssues(env) }, 200, request, env)
      }

      if (request.method === 'POST' && url.pathname === '/webhooks/github') {
        return await handleGithubWebhook(request, env)
      }

      return json({ error: 'Not found' }, 404, request, env)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      return json({
        error: error instanceof Error ? error.message : String(error)
      }, status, request, env)
    }
  }
}
