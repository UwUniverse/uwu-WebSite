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

function destination(relativePath) {
  return path.join(workspace, relativePath)
}

try {
  const moment = cloneBranch(docsRepository, 'moment', 'docs-moment')
  replaceMarkdownDirectory(moment, destination('docs/docs/moment'))

  const backgroundManager = cloneBranch(docsRepository, 'uwuBackGroundManager', 'docs-background-manager')
  copyMarkdownIfPresent(
    backgroundManager,
    'CN.md',
    destination('docs/docs/uwuBackGroundManager/index.md')
  )
  copyMarkdownIfPresent(
    backgroundManager,
    'README.md',
    destination('docs/docs/uwuBackGroundManager/english.md'),
    [['[English](./README.md) | [简体中文](./CN.md)', '']]
  )

  const momentDestination = destination('docs/docs/moment')
  const momentOrder = [
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
  const momentFiles = markdownFiles(momentDestination)
    .map((file) => path.relative(momentDestination, file))
    .sort((left, right) => {
      const leftIndex = momentOrder.indexOf(left)
      const rightIndex = momentOrder.indexOf(right)
      return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex)
        - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex)
        || left.localeCompare(right)
    })
  const momentItems = momentFiles.map((file) => {
    const content = fs.readFileSync(path.join(momentDestination, file), 'utf8')
    const title = file === 'index.md'
      ? '概览'
      : content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file, '.md')
    const link = file === 'index.md'
      ? '/docs/moment/'
      : `/docs/moment/${file.replace(/\.md$/, '')}`
    return `  { text: ${JSON.stringify(title)}, link: ${JSON.stringify(link)} }`
  })
  fs.writeFileSync(
    destination('docs/.vitepress/generated-upstream-docs.ts'),
    `export const momentDocsItems = [\n${momentItems.join(',\n')}\n]\n`
  )

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
