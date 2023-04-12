// @ts-check
import * as url from 'url'
import { join, relative, resolve, dirname } from 'path'
import { readFile, writeFile, readdir } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { build } from 'esbuild'
import report from './report.mjs'

async function getFiles (dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  }))
  return Array.prototype.concat(...files)
}
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const folder = join(__dirname, '../dist')
if (!existsSync(folder)) {
  mkdirSync(folder)
}

function ensureDirectoryExistence (filePath) {
  const _dirname = dirname(filePath)
  if (existsSync(_dirname)) {
    return true
  }
  ensureDirectoryExistence(_dirname)
  mkdirSync(_dirname)
}

const _minify = async (code, format) => {
  const result = await build({
    stdin: {
      contents: code
    },
    format,
    write: false,
    bundle: false,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  })
  if (result.errors.length > 0) {
    console.error(result.errors)
    return code
  }
  return result.outputFiles[0].text
}
const output = join(__dirname, '../output/')
const dist = join(__dirname, '../dist/')

const reports = []
async function job (code, path) {
  const esm = path.includes('esm/') ? 'esm' : undefined
  const after = await _minify(code, esm)
  reports.push({ path, before: code, after })
  return after
}

async function writeBack (path, code) {
  ensureDirectoryExistence(path)
  writeFile(path, code, 'utf-8')
}
getFiles(output).then(async paths => {
  await Promise.all(paths.map(async path => {
    // omit macros (files are empty)
    if (path.includes('.macro.')) return

    const _path = relative(output, path)
    const __path = join(dist, _path)
    // console.log(path, _path, __path)
    let code = await readFile(path, 'utf-8')
    if (!path.includes('.d.ts')) {
      code = await job(code, __path)
    }
    return writeBack(__path, code)
  }))

  report(reports)
})
