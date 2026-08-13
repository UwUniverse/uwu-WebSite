import { createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'

const port = Number(process.env.ISSUES_PORT || 8787)
const dataFile = resolve(process.cwd(), 'server/data/issues.json')
const webhookSecret = process.env.WEBHOOK_SECRET || 'uwuAOSP-local-demo-secret'
const trackedRepository = process.env.ISSUE_REPOSITORY || 'uwuAOSP/issue_tracker'

if (!process.env.WEBHOOK_SECRET) {
  console.warn('Using the local demo webhook secret. Set WEBHOOK_SECRET before deployment.')
}

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, x-github-event, x-github-delivery, x-hub-signature-256',
  'access-control-allow-methods': 'GET, POST, OPTIONS'
}

async function readStore() {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'))
  } catch {
    return { issues: [], deliveries: [] }
  }
}

async function writeStore(store) {
  await mkdir(dirname(dataFile), { recursive: true })
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

function verifySignature(rawBody, signature) {
  if (typeof signature !== 'string' || !signature.startsWith('sha256=')) return false

  const expected = `sha256=${createHmac('sha256', webhookSecret).update(rawBody).digest('hex')}`
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

function readRequestBody(request) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0

    request.on('data', (chunk) => {
      size += chunk.length
      if (size > 2 * 1024 * 1024) {
        reject(new Error('Webhook payload is too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolveBody(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function normalizeIssue(payload, eventName, action) {
  const issue = payload.issue || {}
  const repository = payload.repository?.full_name || 'unknown/repository'
  const labels = Array.isArray(issue.labels)
    ? issue.labels.map((label) => typeof label === 'string' ? label : label.name).filter(Boolean)
    : []

  return {
    id: `${repository}#${issue.number}`,
    repository,
    number: issue.number,
    title: issue.title || 'Untitled issue',
    state: issue.state || 'open',
    author: issue.user?.login || 'unknown',
    comments: Number(issue.comments || 0),
    labels,
    updated_at: issue.updated_at || new Date().toISOString(),
    html_url: issue.html_url || `https://github.com/${repository}/issues/${issue.number}`,
    last_event: `${eventName}.${action || 'updated'}`
  }
}

function sortIssues(issues) {
  return issues.sort((left, right) => new Date(right.updated_at) - new Date(left.updated_at))
}

async function handleWebhook(request, response) {
  const rawBody = await readRequestBody(request)
  const signature = request.headers['x-hub-signature-256']

  if (!verifySignature(rawBody, signature)) {
    response.writeHead(401, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Invalid webhook signature' }))
    return
  }

  const eventName = request.headers['x-github-event'] || 'unknown'
  const deliveryId = request.headers['x-github-delivery'] || ''
  const payload = JSON.parse(rawBody.toString('utf8'))
  const store = await readStore()

  const repository = payload.repository?.full_name
  if ((eventName === 'issues' || eventName === 'issue_comment') && repository && repository !== trackedRepository) {
    response.writeHead(202, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true, ignored: true, repository }))
    return
  }

  if (deliveryId && store.deliveries.includes(deliveryId)) {
    response.writeHead(200, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true, duplicate: true }))
    return
  }

  if (eventName === 'issues' || eventName === 'issue_comment') {
    const issue = normalizeIssue(payload, eventName, payload.action)
    const existingIndex = store.issues.findIndex((item) => item.id === issue.id)

    if (existingIndex === -1) store.issues.push(issue)
    else store.issues[existingIndex] = { ...store.issues[existingIndex], ...issue }
  }

  if (deliveryId) store.deliveries = [...store.deliveries, deliveryId].slice(-100)
  store.issues = sortIssues(store.issues)
  await writeStore(store)

  response.writeHead(202, { ...headers, 'content-type': 'application/json' })
  response.end(JSON.stringify({ ok: true, event: eventName, action: payload.action || null }))
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers)
    response.end()
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    response.writeHead(200, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/issues') {
    const store = await readStore()
    response.writeHead(200, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ issues: sortIssues(store.issues), source: 'github-webhook' }))
    return
  }

  if (request.method === 'POST' && url.pathname === '/webhooks/github') {
    try {
      await handleWebhook(request, response)
    } catch (error) {
      console.error(error)
      response.writeHead(400, { ...headers, 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Invalid webhook payload' }))
    }
    return
  }

  response.writeHead(404, { ...headers, 'content-type': 'application/json' })
  response.end(JSON.stringify({ error: 'Not found' }))
}

createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error(error)
    if (!response.headersSent) response.writeHead(500, { ...headers, 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Internal server error' }))
  })
}).listen(port, '127.0.0.1', () => {
  console.log(`Issue webhook server: http://127.0.0.1:${port}`)
  console.log(`Issue API: http://127.0.0.1:${port}/api/issues`)
  console.log(`Webhook endpoint: http://127.0.0.1:${port}/webhooks/github`)
  console.log(`Tracked repository: ${trackedRepository}`)
})
