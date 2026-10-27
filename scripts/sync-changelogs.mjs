import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const workspace = process.cwd()
const repository = process.env.UPSTREAM_CHANGELOG_REPOSITORY ?? 'https://github.com/uwuAOSP/uwu_ChangeLOG.git'
const releasePattern = /^uwu-\d+\.\d+\.\d+$/
const locales = [
  { locale: 'zh-CN', prefix: '', file: 'README.md' },
  { locale: 'zh-TW', prefix: '/zh-tw', file: 'README.zh-tw.md' },
  { locale: 'en-US', prefix: '/en', file: 'README.en.md' }
]
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'uwuaosp-changelogs-'))

function git(args, cwd = tempRoot) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit']
  }).trim()
}

function compareVersions(left, right) {
  const a = left.slice(4).split('.').map(BigInt)
  const b = right.slice(4).split('.').map(BigInt)
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? -1 : 1
  }
  return left.localeCompare(right)
}

function copyAssets(source, destination) {
  if (!fs.existsSync(source)) return
  fs.mkdirSync(destination, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name)
    const to = path.join(destination, entry.name)
    if (entry.isDirectory()) copyAssets(from, to)
    else if (entry.isFile()) fs.copyFileSync(from, to)
    else throw new Error(`Unsupported changelog asset: ${from}`)
  }
}

function article(source, branch, locale, availableLocales) {
  const version = branch.slice(4)
  const title = source.match(/^#\s+uwuAOSP\s+(\S+)\s*$/m)
  const dateMatch = source.match(/^\d{4}-\d{2}-\d{2}\s*$/m)
  if (title?.[1] !== version || !dateMatch || dateMatch.index < title.index) {
    throw new Error(`Missing or mismatched version/date: ${branch}/${locale.file}`)
  }
  const date = dateMatch[0].trim()
  if (Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid release date: ${branch}/${locale.file}`)
  }
  const hero = source.slice(0, dateMatch.index).match(/!\[[^\]]*\]\((?:\.\/)?(assets\/[^)\s]+)\)/)?.[1]
  const assetPrefix = `/images/changelogs/${branch}/`
  let body = source.slice(dateMatch.index + dateMatch[0].length).trim()
    .replaceAll('https://uwuaosp.uwuniverse.org/', '/')
    .replace(/\]\((?:\.\/)?assets\//g, `](${assetPrefix}assets/`)
    .replace(/(\bsrc\s*=\s*["'])(?:\.\/)?assets\//g, `$1${assetPrefix}assets/`)
    .replace(/\]\((?:\.\/)?(README(?:\.en|\.zh-tw)?\.md)(#[^)]+)?\)/g, (match, file, hash = '') => {
      const target = availableLocales.find((entry) => entry.file === file)
      return target ? `](${target.prefix}/blog/${branch}/${hash})` : match
    })

  const sections = []
  const legacyIds = branch === 'uwu-17.0.100'
    ? ['privacy-and-control', 'daily-use', 'for-maintainers', 'thanks-and-contributing']
    : []
  let fence = ''
  body = body.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)
    if (marker) {
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = ''
      return line
    }
    if (fence) return line
    const heading = line.match(/^##\s+(.+?)(?:\s+\{#([^}]+)\})?\s*$/)
    if (!heading) return line
    const id = heading[2] ?? legacyIds[sections.length] ?? `release-section-${sections.length + 1}`
    sections.push([heading[1], id])
    return `## ${heading[1]} {#${id}}`
  }).join('\n')

  body = body.replace(
    /\[([^\]]+)\]\([^)]*\/docs\/uni\/#uni-runtime-telemetry\)/g,
    `<UniBuildCharts locale="${locale.locale === 'en-US' ? 'en' : locale.locale === 'zh-TW' ? 'zh-tw' : 'zh'}" />`
  )
  const content = [
    '---',
    `title: uwuAOSP ${version}`,
    `description: uwuAOSP ${version}`,
    'aside: false',
    'outline: false',
    `changelogBranch: ${branch}`,
    '---',
    '',
    `<ReleaseBlog locale="${locale.locale}" mode="article" release="${branch}" />`,
    '',
    body,
    ''
  ].join('\n')
  return { content, metadata: { date, image: hero ? `${assetPrefix}${hero}` : '', sections } }
}

try {
  const branches = git(['ls-remote', '--heads', repository]).split(/\r?\n/)
    .map((line) => line.replace(/^\S+\s+refs\/heads\//, ''))
    .filter((branch) => releasePattern.test(branch))
    .sort(compareVersions)
  const releases = []
  const pages = []

  // 所有分支校验成功后才替换站内文件，失败时保留已发布内容
  for (const branch of branches) {
    const checkout = path.join(tempRoot, branch)
    git(['clone', '--depth', '1', '--single-branch', '--branch', branch, repository, checkout])
    const availableLocales = locales.filter(({ file }) => fs.existsSync(path.join(checkout, file)))
    if (!availableLocales.some(({ locale }) => locale === 'zh-CN')) {
      throw new Error(`Missing release notes: ${branch}/README.md`)
    }
    const release = { branch, version: branch.slice(4), source: git(['rev-parse', 'HEAD'], checkout), locales: {} }
    for (const locale of availableLocales) {
      const result = article(fs.readFileSync(path.join(checkout, locale.file), 'utf8'), branch, locale, availableLocales)
      if (result.metadata.image && !fs.existsSync(path.join(checkout, result.metadata.image.split(`/${branch}/`)[1]))) {
        throw new Error(`Missing release artwork: ${branch}/${locale.file}`)
      }
      release.locales[locale.locale] = result.metadata
      pages.push({ branch, locale, content: result.content })
    }
    releases.push(release)
  }

  const assetRoot = path.join(workspace, 'docs/public/images/changelogs')
  for (const release of releases) {
    const target = path.join(assetRoot, release.branch)
    fs.rmSync(target, { recursive: true, force: true })
    copyAssets(path.join(tempRoot, release.branch, 'assets'), path.join(target, 'assets'))
    const license = path.join(tempRoot, release.branch, 'LICENSE')
    if (fs.existsSync(license)) {
      fs.mkdirSync(target, { recursive: true })
      fs.copyFileSync(license, path.join(target, 'LICENSE'))
    }
  }
  for (const { branch, locale, content } of pages) {
    const target = path.join(workspace, 'docs', locale.prefix.slice(1), 'blog', branch, 'index.md')
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, content)
  }

  // 只移除同步器拥有的版本目录，不清理其他博客文章
  for (const locale of locales) {
    const blogRoot = path.join(workspace, 'docs', locale.prefix.slice(1), 'blog')
    for (const entry of fs.readdirSync(blogRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && releasePattern.test(entry.name)
          && !pages.some((page) => page.branch === entry.name && page.locale.locale === locale.locale)) {
        fs.rmSync(path.join(blogRoot, entry.name), { recursive: true })
      }
    }
  }
  if (fs.existsSync(assetRoot)) {
    for (const entry of fs.readdirSync(assetRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && releasePattern.test(entry.name) && !branches.includes(entry.name)) {
        fs.rmSync(path.join(assetRoot, entry.name), { recursive: true })
      }
    }
  }
  fs.writeFileSync(path.join(workspace, 'docs/.vitepress/generated-changelogs.json'), `${JSON.stringify(releases, null, 2)}\n`)
  console.log(`Synced ${releases.length} release branches and ${pages.length} localized articles.`)
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
