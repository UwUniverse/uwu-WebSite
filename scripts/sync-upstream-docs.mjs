import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const workspace = process.cwd()
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'uwuaosp-upstream-'))
const docsRepository = process.env.UPSTREAM_DOCS_REPOSITORY ?? 'https://github.com/uwuAOSP/Docs.git'
const manifestsRepository = process.env.UPSTREAM_MANIFESTS_REPOSITORY ?? 'https://github.com/uwuAOSP/platform_manifests.git'

function run(command, args, cwd = tempRoot) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  }).trim()
}

function cloneBranch(repository, branch, directory) {
  const target = path.join(tempRoot, directory)
  run('git', ['clone', '--depth', '1', '--branch', branch, '--single-branch', repository, target])
  return target
}

function listBranches(repository) {
  return run('git', ['ls-remote', '--heads', repository])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.replace(/^\S+\s+refs\/heads\//, ''))
    .filter(Boolean)
}

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const source = path.join(directory, entry.name)

    if (entry.isDirectory()) return markdownFiles(source)
    return entry.isFile() && entry.name.endsWith('.md') ? [source] : []
  })
}

function relativeMarkdownPath(sourceRoot, sourceFile) {
  const relative = path.relative(sourceRoot, sourceFile)
  return path.basename(relative).toLowerCase() === 'readme.md'
    ? path.join(path.dirname(relative), 'index.md')
    : relative
}

function replaceMarkdownDirectory(sourceRoot, destinationRoot) {
  fs.rmSync(destinationRoot, { recursive: true, force: true })
  fs.mkdirSync(destinationRoot, { recursive: true })

  for (const sourceFile of markdownFiles(sourceRoot)) {
    const destination = path.join(destinationRoot, relativeMarkdownPath(sourceRoot, sourceFile))
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(sourceFile, destination)
  }
}

function copyMarkdownIfPresent(sourceRoot, sourceName, destination, replacements = []) {
  const source = path.join(sourceRoot, sourceName)

  if (!fs.existsSync(source)) return false

  fs.mkdirSync(path.dirname(destination), { recursive: true })
  let content = fs.readFileSync(source, 'utf8')

  for (const [from, to] of replacements) {
    content = content.replaceAll(from, to)
  }

  fs.writeFileSync(destination, content)
  return true
}

function branchDirectory(branch) {
  const segments = branch.split('/')

  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error(`Unsafe upstream branch name: ${branch}`)
  }

  return destination(path.join('docs', 'docs', ...segments))
}

function branchLink(branch) {
  return `/docs/${branch}/`
}

function fileLink(branch, file) {
  const relative = file.split(path.sep).join('/')
  return relative === 'index.md'
    ? branchLink(branch)
    : `/docs/${branch}/${relative.replace(/\.md$/, '')}`
}

function sidebarItems(sourceRoot, branch) {
  const preferredFiles = branch === 'moment'
    ? [
        'index.md',
        'launching-apps.md',
        'navigation-handle.md',
        'moment-arc.md',
        'notifications.md',
        'recents-gesture.md',
        'multiple-windows.md',
        'move-and-resize.md',
        'controls.md',
        'compact-mode.md',
        'landscape.md',
        'back.md',
        'settings.md',
        'debugging.md'
      ]
    : []

  return markdownFiles(sourceRoot)
    .map((file) => path.relative(sourceRoot, file))
    .sort((left, right) => {
      const leftIndex = preferredFiles.indexOf(left)
      const rightIndex = preferredFiles.indexOf(right)
      return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
        - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
        || left.localeCompare(right)
    })
    .map((file) => {
      const content = fs.readFileSync(path.join(sourceRoot, file), 'utf8')
      const title = branch === 'uwuBackGroundManager' && file === 'index.md'
        ? '文档'
        : branch === 'uwuBackGroundManager' && file === 'english.md'
          ? 'English'
          : file === 'index.md'
            ? '概览'
            : content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file, '.md')

      return {
        text: title,
        link: fileLink(branch, file)
      }
    })
}

function writeSidebarFile(sidebars) {
  fs.writeFileSync(
    destination('docs/.vitepress/generated-upstream-docs.ts'),
    `export const upstreamDocsSidebars = ${JSON.stringify(sidebars, null, 2)}\n`
  )
}

function destination(relativePath) {
  return path.join(workspace, relativePath)
}

try {
  const upstreamBranches = listBranches(docsRepository)
    .filter((branch) => branch !== 'main')
  const preferredOrder = ['moment', 'uwuBackGroundManager']
  const docsBranches = [
    ...preferredOrder.filter((branch) => upstreamBranches.includes(branch)),
    ...upstreamBranches
      .filter((branch) => !preferredOrder.includes(branch))
      .sort((left, right) => left.localeCompare(right))
  ]
  const docsSidebars = []

  for (const branch of docsBranches) {
    const cloneDirectory = `docs-${branch.replaceAll('/', '-')}`
    const upstream = cloneBranch(docsRepository, branch, cloneDirectory)
    const branchDestination = branchDirectory(branch)

    if (branch === 'uwuBackGroundManager') {
      fs.rmSync(branchDestination, { recursive: true, force: true })
      fs.mkdirSync(branchDestination, { recursive: true })
      copyMarkdownIfPresent(upstream, 'CN.md', path.join(branchDestination, 'index.md'))
      copyMarkdownIfPresent(
        upstream,
        'README.md',
        path.join(branchDestination, 'english.md'),
        [[/\[English\]\(\.\/README\.md\)\s*\|\s*\[简体中文\]\(\.\/CN\.md\)/g, '']]
      )
    } else {
      replaceMarkdownDirectory(upstream, branchDestination)
    }

    const items = sidebarItems(branchDestination, branch)
    if (items.length === 0) continue

    docsSidebars.push({
      text: branch,
      link: branchLink(branch),
      collapsed: false,
      items
    })
  }

  writeSidebarFile(docsSidebars)

  const manifestBranches = [
    ['uwu-16.2', 'docs/guide/platform-manifests/uwu-16.2.md'],
    ['uwu-17.0', 'docs/guide/platform-manifests/uwu-17.0.md'],
    ['uwu-17.0-wip', 'docs/guide/platform-manifests/uwu-17.0-wip.md'],
    ['wip/uwu-16.2-tesseract-ocr-deps', 'docs/guide/platform-manifests/tesseract-ocr-deps.md'],
    ['ciallo', 'docs/guide/platform-manifests/ciallo.md']
  ]

  for (const [branch, relativeDestination] of manifestBranches) {
    const cloneDirectory = `manifests-${branch.replaceAll('/', '-')}`
    const manifest = cloneBranch(manifestsRepository, branch, cloneDirectory)
    copyMarkdownIfPresent(manifest, 'README.md', destination(relativeDestination))
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
