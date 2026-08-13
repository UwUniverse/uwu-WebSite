const GITHUB_API = 'https://api.github.com'
const GITHUB_API_VERSION = '2022-11-28'
const PAGE_SIZE = 100
const DEFAULT_REPOSITORY = 'uwuAOSP/issue_tracker'

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

function responseHeaders(request) {
  const origin = request?.headers.get('Origin')
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, OPTIONS, POST',
    'content-type': 'application/json; charset=utf-8',
    vary: 'Origin'
  }
}

function json(data, status = 200, request) {
  return new Response(
    status === 204 ? null : JSON.stringify(data),
    { status, headers: responseHeaders(request) }
  )
}

function repositoryPath(env) {
  const repository = env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY
  const [owner, name] = repository.split('/')

  if (!owner || !name || repository.split('/').length !== 2) {
    throw new Error('GITHUB_REPOSITORY must use the owner/name format')
  }

  return encodeURIComponent(owner) + '/' + encodeURIComponent(name)
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
    issue.created_at,
    issue.updated_at,
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
    comment.created_at,
    comment.updated_at
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
    const repository = repositoryPath(env)
    const issues = (await githubPages(
      env,
      '/repos/' + repository + '/issues?state=all&sort=updated&direction=desc'
    )).filter((issue) => !issue.pull_request)
    const syncedAt = new Date().toISOString()

    await runBatches(
      db,
      issues.map((issue) => issueStatement(db, issue, syncedAt))
    )

    let commentsCount = 0

    for (const issue of issues) {
      const comments = issue.comments > 0
        ? await githubPages(env, '/repos/' + repository + '/issues/' + issue.number + '/comments')
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
      repository: env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY,
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

function serializeIssue(issue) {
  return {
    ...issue,
    locked: Boolean(issue.locked),
    labels: parseJson(issue.labels_json, []),
    assignees: parseJson(issue.assignees_json, []),
    milestone: parseJson(issue.milestone_json, null)
  }
}

async function listIssues(request, env) {
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100)
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0)
  const result = await env.ISSUE_DB.prepare([
    'SELECT * FROM issues',
    'ORDER BY updated_at DESC',
    'LIMIT ? OFFSET ?'
  ].join('\n')).bind(limit, offset).all()

  return json({
    items: (result.results || []).map(serializeIssue),
    limit,
    offset
  }, 200, request)
}

async function getIssue(request, env, number) {
  const issue = await env.ISSUE_DB.prepare(
    'SELECT * FROM issues WHERE number = ?'
  ).bind(number).first()

  if (!issue) return json({ error: 'Issue not found' }, 404, request)

  const comments = await env.ISSUE_DB.prepare([
    'SELECT id, issue_number, author_login, body, html_url, created_at, updated_at',
    'FROM issue_comments',
    'WHERE issue_number = ?',
    'ORDER BY created_at ASC'
  ].join('\n')).bind(number).all()

  return json({
    ...serializeIssue(issue),
    comments: comments.results || []
  }, 200, request)
}

async function getStatus(request, env) {
  const latest = await env.ISSUE_DB.prepare([
    'SELECT * FROM sync_runs',
    'ORDER BY id DESC',
    'LIMIT 1'
  ].join('\n')).first()

  return json({ latest }, 200, request)
}

function canSync(request, env) {
  return Boolean(env.SYNC_TOKEN)
    && request.headers.get('Authorization') === 'Bearer ' + env.SYNC_TOKEN
}

export default {
  async scheduled(controller, env) {
    await syncIssues(env)
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return json(null, 204, request)
    }

    const url = new URL(request.url)

    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        return json({ ok: true, service: 'uwuaosp-issue-sync' }, 200, request)
      }

      if (request.method === 'GET' && url.pathname === '/api/issues') {
        return listIssues(request, env)
      }

      const issueMatch = url.pathname.match(/^\/api\/issues\/(\d+)$/)
      if (request.method === 'GET' && issueMatch) {
        return getIssue(request, env, Number(issueMatch[1]))
      }

      if (request.method === 'GET' && url.pathname === '/api/sync-status') {
        return getStatus(request, env)
      }

      if (request.method === 'POST' && url.pathname === '/api/sync') {
        if (!canSync(request, env)) {
          return json({ error: 'Unauthorized' }, 401, request)
        }

        return json({ ok: true, result: await syncIssues(env) }, 200, request)
      }

      return json({ error: 'Not found' }, 404, request)
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : String(error)
      }, 500, request)
    }
  }
}
